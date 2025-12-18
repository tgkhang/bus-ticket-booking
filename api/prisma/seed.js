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
      phoneNumber: '+84901234567',
      address: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
      bankAccount: '1234567890',
      accountBalance: 150000,
      currency: 'VND',
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
      phoneNumber: '+84912345678',
      address: '456 Le Loi Boulevard, District 3, Ho Chi Minh City',
      bankAccount: '9876543210',
      accountBalance: 250000,
      currency: 'VND',
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
      phoneNumber: '+84900000000',
      address: 'Bus Ticket System HQ, District 1, Ho Chi Minh City',
      bankAccount: '0000000000',
      accountBalance: 0,
      currency: 'VND',
    },
  })

  // Create sample operator
  let operator = await prisma.operator.findFirst({ where: { name: 'Green Bus Lines' } })
  if (!operator) {
    operator = await prisma.operator.create({
      data: {
        name: 'Green Bus Lines',
        contactEmail: 'contact@greenbus.com',
        contactPhone: '+1555000111',
        status: 'approved',
        approvedAt: new Date(),
      },
    })
  }

  // Import real HCMC stops from stops.txt (name,latitude,longitude,address)
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

  // Create buses for every layout type
  const busConfigs = [
    {
      plateNumber: 'GBL-001',
      model: 'Mercedes Sprinter Standard',
      seatCapacity: 32,
      layoutCode: '2-2',
      seatNumbers: Array.from({ length: 8 }, (_, row) => 
        ['A', 'B', 'C', 'D'].map(col => `${col}${row + 1}`)
      ).flat(),
      seatType: 'regular',
    },
    {
      plateNumber: 'GBL-002',
      model: 'Hyundai Universe Sleeper 32',
      seatCapacity: 32,
      layoutCode: 'Sleeper-32',
      seatNumbers: Array.from({ length: 11 }, (_, row) => 
        ['L', 'M', 'R'].map(col => `${col}${row + 1}`)
      ).flat().slice(0, 32),
      seatType: 'sleeper',
    },
    {
      plateNumber: 'GBL-003',
      model: 'Thaco Universe Sleeper 40',
      seatCapacity: 40,
      layoutCode: 'Sleeper-40',
      seatNumbers: Array.from({ length: 14 }, (_, row) => 
        ['L', 'M', 'R'].map(col => `${col}${row + 1}`)
      ).flat().slice(0, 40),
      seatType: 'sleeper',
    },
    {
      plateNumber: 'GBL-004',
      model: 'Mercedes Cabin VIP',
      seatCapacity: 22,
      layoutCode: 'Cabin-VIP',
      seatNumbers: Array.from({ length: 11 }, (_, row) => 
        ['L', 'R'].map(col => `${col}${row + 1}`)
      ).flat(),
      seatType: 'premium',
    },
    {
      plateNumber: 'GBL-005',
      model: 'Ford Transit Limousine 9',
      seatCapacity: 9,
      layoutCode: 'Limo-9',
      seatNumbers: Array.from({ length: 3 }, (_, row) => 
        ['A', 'B', 'C'].map(col => `${col}${row + 1}`)
      ).flat(),
      seatType: 'premium',
    },
    {
      plateNumber: 'GBL-006',
      model: 'Hyundai Solati Limousine 16',
      seatCapacity: 16,
      layoutCode: 'Limo-16',
      seatNumbers: Array.from({ length: 4 }, (_, row) => 
        ['A', 'B', 'C', 'D'].map(col => `${col}${row + 1}`)
      ).flat(),
      seatType: 'premium',
    },
  ]

  const buses = []
  for (const config of busConfigs) {
    const bus = await prisma.bus.upsert({
      where: { plateNumber: config.plateNumber },
      update: {},
      create: {
        operatorId: operator.id,
        plateNumber: config.plateNumber,
        model: config.model,
        seatCapacity: config.seatCapacity,
        amenities: JSON.stringify({
          wifi: true,
          ac: true,
          restroom: config.seatCapacity > 16,
          entertainment: config.seatCapacity > 20,
          usb_charging: true,
          reclining_seats: true,
          reading_light: true,
        }),
      },
    })

    // Create seats for the bus
    for (const seatNumber of config.seatNumbers) {
      await prisma.seat.upsert({
        where: {
          busId_seatNumber: {
            busId: bus.id,
            seatNumber: seatNumber,
          },
        },
        update: {},
        create: {
          busId: bus.id,
          seatNumber: seatNumber,
          seatType: config.seatType,
          isActive: true,
        },
      })
    }

    buses.push(bus)
    console.log(`🚌 Created bus ${config.plateNumber} (${config.model}) with ${config.seatNumbers.length} seats`)
  }

  // Create multiple trips for each created route for the next 7 days
  const makeTime = (daysFromNow, hour, minute) => {
    const d = new Date()
    d.setDate(d.getDate() + daysFromNow)
    d.setHours(hour, minute, 0, 0)
    return d
  }

  // Multiple departure times throughout the day
  const departureSlots = [
    { time: [6, 0], priceMultiplier: 1.0 },   // Early morning
    { time: [7, 30], priceMultiplier: 1.1 },  // Morning peak
    { time: [9, 0], priceMultiplier: 1.0 },   // Mid morning
    { time: [11, 30], priceMultiplier: 0.9 }, // Late morning
    { time: [14, 0], priceMultiplier: 0.95 }, // Afternoon
    { time: [17, 0], priceMultiplier: 1.2 },  // Evening peak
    { time: [19, 30], priceMultiplier: 1.1 }, // Evening
    { time: [22, 0], priceMultiplier: 1.0 },  // Night
  ]

  let tripCount = 0
  // Create trips for next 7 days
  for (let day = 0; day < 7; day++) {
    for (const route of createdRoutes) {
      // Rotate through buses for variety
      const busesForDay = day % 2 === 0 ? buses.slice(0, 3) : buses.slice(3, 6)
      
      for (const slot of departureSlots) {
        // Use different buses for different time slots
        const bus = busesForDay[slot.time[0] % busesForDay.length]
        
        const dep = makeTime(day, slot.time[0], slot.time[1])
        const arr = new Date(dep)
        arr.setMinutes(arr.getMinutes() + (route.estimatedMinutes || 60))
        
        // Base price varies by route distance
        const basePrice = Math.floor((route.distanceKm * 1500) * slot.priceMultiplier)
        
        const exists = await prisma.trip.findFirst({
          where: { routeId: route.id, busId: bus.id, departureTime: dep },
        })
        
        if (!exists) {
          await prisma.trip.create({
            data: {
              routeId: route.id,
              busId: bus.id,
              departureTime: dep,
              arrivalTime: arr,
              basePrice: basePrice,
              status: 'scheduled',
            },
          })
          tripCount++
        }
      }
    }
  }
  console.log(`🎫 Created ${tripCount} trips across 7 days`)

  // Create seat statuses for all upcoming trips
  const allSeats = await prisma.seat.findMany()
  const allTrips = await prisma.trip.findMany()
  
  let seatStatusCount = 0
  for (const trip of allTrips) {
    const tripSeats = allSeats.filter(s => s.busId === trip.busId)
    for (const seat of tripSeats) {
      await prisma.seatStatus.upsert({
        where: {
          tripId_seatId: { tripId: trip.id, seatId: seat.id },
        },
        update: {},
        create: {
          tripId: trip.id,
          seatId: seat.id,
          status: 'available',
        },
      })
      seatStatusCount++
    }
  }
  console.log(`💺 Created ${seatStatusCount} seat statuses for all trips`)

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
