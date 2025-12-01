const { PrismaClient } = require('@prisma/client')
const bcryptjs = require('bcryptjs')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create sample users
  const hashedPassword = await bcryptjs.hash('Demo@123', 10)

  const user1 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      username: 'johndoe',
      password: hashedPassword,
      displayName: 'John Doe',
      role: 'client',
      isActive: true,
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      email: 'jane.smith@example.com',
      username: 'janesmith',
      password: hashedPassword,
      displayName: 'Jane Smith',
      role: 'client',
      isActive: true,
    },
  })

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@busticket.com' },
    update: {},
    create: {
      email: 'admin@busticket.com',
      username: 'admin',
      password: hashedPassword,
      displayName: 'System Administrator',
      role: 'admin',
      isActive: true,
    },
  })

  // Create sample operator
  let operator = await prisma.operator.findFirst({ where: { name: 'Green Bus Lines' } })
  if (!operator) {
    operator = await prisma.operator.create({
      data: {
        name: 'Green Bus Lines',
        contact_email: 'contact@greenbus.com',
        contact_phone: '+1555000111',
        status: 'approved',
        approved_at: new Date(),
      },
    })
  }

  // Import 4 real HCMC stops from stops.txt (name,latitude,longitude,address)
  const ensureStop = async (name, latitude, longitude, address) => {
    const existing = await prisma.stop.findFirst({ where: { name, latitude, longitude } })
    if (existing) return existing
    return prisma.stop.create({ data: { name, latitude, longitude, address, active: true } })
  }

  const stopsFile = path.resolve(__dirname, '../../data/hcmc_stops.txt');
  let importedStops = []
  if (fs.existsSync(stopsFile)) {
    const raw = fs.readFileSync(stopsFile, 'utf8')
    const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0)
    if (lines.length > 0) {
      const header = lines[0].split(',').map((h) => h.trim().toLowerCase())
      const isExpectedHeader =
        header[0] === 'stop_id' &&
        header[1] === 'stop_code' &&
        header[2] === 'stop_name' &&
        header[3] === 'stop_lat' &&
        header[4] === 'stop_lon'
      const dataLines = isExpectedHeader ? lines.slice(1) : lines
      for (const line of dataLines) {
        const parts = line.split(',')
        if (parts.length < 5) continue
        const name = (isExpectedHeader ? parts[2] : parts[0])?.trim()
        const lat = parseFloat(isExpectedHeader ? parts[3] : parts[1])
        const lon = parseFloat(isExpectedHeader ? parts[4] : parts[2])
        const address = name
        if (!name || Number.isNaN(lat) || Number.isNaN(lon)) continue
        const s = await ensureStop(name, lat, lon, address)
        importedStops.push(s)
        if (importedStops.length >= 10) break // remove this limit if you want to import more
      }
    }
    console.log(`📍 Imported ${importedStops.length} HCMC stops from stops.txt`)
  } else {
    console.log('⚠️ stops.txt not found, using fallback demo stops')
    const hcm = await ensureStop('Ben Thanh Market', 10.772, 106.698, 'District 1')
    const mhd = await ensureStop('Mien Dong Bus Station', 10.805, 106.714, 'Binh Thanh')
    const stp = await ensureStop('Suoi Tien Park', 10.872, 106.802, 'Thu Duc')
    const tanSonNhat = await ensureStop('Tan Son Nhat Airport', 10.818, 106.651, 'Tan Binh')
    importedStops = [hcm, mhd, stp, tanSonNhat]
  }

  // Create multiple intra-city routes in HCMC using imported stops
  const pick = (idx) => importedStops[idx % importedStops.length]
  const hasEnough = importedStops.length >= 4
  const routeSpecs = hasEnough
    ? [
        // Linear D1 -> Binh Thanh -> Thu Duc
        {
          name: 'City Line A',
          seqIdx: [0, 1, 2],
          distanceKm: 22,
          estimatedMinutes: 60,
        },
        // Airport express D1 -> Airport
        {
          name: 'Airport Express',
          seqIdx: [0, 3],
          distanceKm: 8,
          estimatedMinutes: 35,
        },
        // Ring route: Airport -> Binh Thanh -> D1 -> Thu Duc
        {
          name: 'City Ring B',
          seqIdx: [3, 1, 0, 2],
          distanceKm: 30,
          estimatedMinutes: 85,
        },
      ]
    : [
        {
          name: 'Demo City Route',
          seqIdx: [0, 1],
          distanceKm: 5,
          estimatedMinutes: 20,
        },
      ]

  const createdRoutes = []
  for (const spec of routeSpecs) {
    const stopsSeq = spec.seqIdx.map(pick)
    const origin = stopsSeq[0]
    const destination = stopsSeq[stopsSeq.length - 1]
    let r = await prisma.route.findFirst({
      where: {
        operatorId: operator.id,
        originStopId: origin.id,
        destinationStopId: destination.id,
        name: spec.name,
      },
      include: { stops: true },
    })
    if (!r) {
      r = await prisma.route.create({
        data: {
          name: spec.name,
          operatorId: operator.id,
          originStopId: origin.id,
          destinationStopId: destination.id,
          distanceKm: spec.distanceKm,
          estimatedMinutes: spec.estimatedMinutes,
          active: true,
        },
      })
      const data = stopsSeq.map((s, i) => ({
        routeId: r.id,
        stopId: s.id,
        sequence: i + 1,
        isPickup: i < stopsSeq.length - 1,
        isDropoff: i > 0,
      }))
      await prisma.routeStop.createMany({ data, skipDuplicates: true })
    }
    createdRoutes.push(r)
  }

  // Create sample bus
  const bus = await prisma.bus.upsert({
    where: { plate_number: 'GBL-001' },
    update: {},
    create: {
      operator_id: operator.id,
      plate_number: 'GBL-001',
      model: 'Mercedes Sprinter',
      seat_capacity: 16,
      amenities_json: JSON.stringify({
        wifi: true,
        ac: true,
        restroom: true,
        entertainment: true,
        usb_charging: true,
        reclining_seats: true,
        reading_light: true,
        blanket: true,
        water: true,
      }),
    },
  })

  // Create seats for the bus
  const seatNumbers = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4']

  for (const seatNumber of seatNumbers) {
    await prisma.seat.upsert({
      where: {
        bus_id_seat_number: {
          bus_id: bus.id,
          seat_number: seatNumber,
        },
      },
      update: {},
      create: {
        bus_id: bus.id,
        seat_number: seatNumber,
        seat_type: seatNumber.startsWith('A') ? 'premium' : 'regular',
        is_active: true,
      },
    })
  }

  // Create multiple trips for each created route
  const makeTime = (daysFromNow, hour, minute) => {
    const d = new Date()
    d.setDate(d.getDate() + daysFromNow)
    d.setHours(hour, minute, 0, 0)
    return d
  }

  const tripWindows = [
    { days: 1, dep: [7, 30], price: 35000 },
    { days: 1, dep: [9, 0], price: 45000 },
    { days: 2, dep: [17, 0], price: 50000 },
  ]

  for (const r of createdRoutes) {
    for (const w of tripWindows) {
      const dep = makeTime(w.days, w.dep[0], w.dep[1])
      const arr = new Date(dep)
      // Arrival based on estimatedMinutes
      arr.setMinutes(arr.getMinutes() + (r.estimatedMinutes || 60))
      const exists = await prisma.trip.findFirst({
        where: { route_id: r.id, bus_id: bus.id, departure_time: dep },
      })
      if (!exists) {
        await prisma.trip.create({
          data: {
            route_id: r.id,
            bus_id: bus.id,
            departure_time: dep,
            arrival_time: arr,
            base_price: w.price,
            status: 'scheduled',
          },
        })
      }
    }
  }

  // Create seat statuses for all upcoming trips on the bus
  const seats = await prisma.seat.findMany({ where: { bus_id: bus.id } })
  const tripsForBus = await prisma.trip.findMany({ where: { bus_id: bus.id } })
  for (const t of tripsForBus) {
    for (const seat of seats) {
      await prisma.seatStatus.upsert({
        where: {
          trip_id_seat_id: { trip_id: t.id, seat_id: seat.id },
        },
        update: {},
        create: {
          trip_id: t.id,
          seat_id: seat.id,
          status: 'available',
        },
      })
    }
  }

  // Create sample payment method
  await prisma.paymentMethod.create({
    data: {
      user_id: user1.id,
      provider: 'stripe',
      token: 'card_1234567890abcdef',
      is_default: true,
    },
  })

  console.log('✅ Database seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
