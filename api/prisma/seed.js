const { PrismaClient } = require('@prisma/client')
const bcryptjs = require('bcryptjs')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create sample users with avatars
  const hashedPassword = await bcryptjs.hash('Demo@123', 10)

  const user1 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      username: 'johndoe',
      password: hashedPassword,
      displayName: 'John Doe',
      avatar: 'https://i.pravatar.cc/150?img=12',
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
      avatar: 'https://i.pravatar.cc/150?img=47',
      role: 'client',
      isActive: true,
      phoneNumber: '+84912345678',
      address: '456 Le Loi Boulevard, District 3, Ho Chi Minh City',
      bankAccount: '9876543210',
      accountBalance: 250000,
      currency: 'VND',
    },
  })

  const user3 = await prisma.user.upsert({
    where: { email: 'michael.brown@example.com' },
    update: {},
    create: {
      email: 'michael.brown@example.com',
      username: 'michaelbrown',
      password: hashedPassword,
      displayName: 'Michael Brown',
      avatar: 'https://i.pravatar.cc/150?img=33',
      role: 'client',
      isActive: true,
      phoneNumber: '+84923456789',
      address: '789 Tran Hung Dao Street, District 5, Ho Chi Minh City',
      bankAccount: '5551234567',
      accountBalance: 300000,
      currency: 'VND',
    },
  })

  const user4 = await prisma.user.upsert({
    where: { email: 'emily.davis@example.com' },
    update: {},
    create: {
      email: 'emily.davis@example.com',
      username: 'emilydavis',
      password: hashedPassword,
      displayName: 'Emily Davis',
      avatar: 'https://i.pravatar.cc/150?img=44',
      role: 'client',
      isActive: true,
      phoneNumber: '+84934567890',
      address: '321 Vo Van Tan Street, District 3, Ho Chi Minh City',
      bankAccount: '7779876543',
      accountBalance: 180000,
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
      avatar: 'https://i.pravatar.cc/150?img=68',
      role: 'admin',
      isActive: true,
      phoneNumber: '+84900000000',
      address: 'Bus Ticket System HQ, District 1, Ho Chi Minh City',
      bankAccount: '0000000000',
      accountBalance: 0,
      currency: 'VND',
    },
  })

  // Create operator users
  const operatorUser1 = await prisma.user.upsert({
    where: { email: 'operator1@greenbus.com' },
    update: {},
    create: {
      email: 'operator1@greenbus.com',
      username: 'greenbus_operator',
      password: hashedPassword,
      displayName: 'Green Bus Manager',
      avatar: 'https://i.pravatar.cc/150?img=15',
      role: 'operator',
      isActive: true,
      phoneNumber: '+84945678901',
      address: 'Green Bus Lines Office, District 1, Ho Chi Minh City',
      bankAccount: '1112223334',
      accountBalance: 0,
      currency: 'VND',
    },
  })

  const operatorUser2 = await prisma.user.upsert({
    where: { email: 'operator2@expresstravel.vn' },
    update: {},
    create: {
      email: 'operator2@expresstravel.vn',
      username: 'express_operator',
      password: hashedPassword,
      displayName: 'Express Travel Manager',
      avatar: 'https://i.pravatar.cc/150?img=57',
      role: 'operator',
      isActive: true,
      phoneNumber: '+84956789012',
      address: 'Express Travel Office, District 3, Ho Chi Minh City',
      bankAccount: '4445556667',
      accountBalance: 0,
      currency: 'VND',
    },
  })

  // Add more client users
  const user5 = await prisma.user.upsert({
    where: { email: 'sarah.wilson@example.com' },
    update: {},
    create: {
      email: 'sarah.wilson@example.com',
      username: 'sarahwilson',
      password: hashedPassword,
      displayName: 'Sarah Wilson',
      avatar: 'https://i.pravatar.cc/150?img=24',
      role: 'client',
      isActive: true,
      phoneNumber: '+84967890123',
      address: '555 Hai Ba Trung Street, District 1, Ho Chi Minh City',
      bankAccount: '6667778889',
      accountBalance: 200000,
      currency: 'VND',
    },
  })

  const user6 = await prisma.user.upsert({
    where: { email: 'david.lee@example.com' },
    update: {},
    create: {
      email: 'david.lee@example.com',
      username: 'davidlee',
      password: hashedPassword,
      displayName: 'David Lee',
      avatar: 'https://i.pravatar.cc/150?img=51',
      role: 'client',
      isActive: true,
      phoneNumber: '+84978901234',
      address: '888 Nguyen Thi Minh Khai, District 3, Ho Chi Minh City',
      bankAccount: '8889990001',
      accountBalance: 350000,
      currency: 'VND',
    },
  })

  const user7 = await prisma.user.upsert({
    where: { email: 'lisa.nguyen@example.com' },
    update: {},
    create: {
      email: 'lisa.nguyen@example.com',
      username: 'lisanguyen',
      password: hashedPassword,
      displayName: 'Lisa Nguyen',
      avatar: 'https://i.pravatar.cc/150?img=38',
      role: 'client',
      isActive: true,
      phoneNumber: '+84989012345',
      address: '777 Pasteur Street, District 1, Ho Chi Minh City',
      bankAccount: '1234509876',
      accountBalance: 120000,
      currency: 'VND',
    },
  })

  const user8 = await prisma.user.upsert({
    where: { email: 'robert.tran@example.com' },
    update: {},
    create: {
      email: 'robert.tran@example.com',
      username: 'roberttran',
      password: hashedPassword,
      displayName: 'Robert Tran',
      avatar: 'https://i.pravatar.cc/150?img=13',
      role: 'client',
      isActive: true,
      phoneNumber: '+84990123456',
      address: '999 Dien Bien Phu, Binh Thanh District, Ho Chi Minh City',
      bankAccount: '5556667778',
      accountBalance: 280000,
      currency: 'VND',
    },
  })

  console.log(`👥 Created ${10} users with avatars (including admin and operator users)`)

  // Create multiple operators
  const operatorConfigs = [
    {
      name: 'Green Bus Lines',
      contactEmail: 'contact@greenbus.com',
      contactPhone: '+84281234567',
      status: 'approved',
    },
    {
      name: 'Express Travel Co.',
      contactEmail: 'info@expresstravel.vn',
      contactPhone: '+84287654321',
      status: 'approved',
    },
    {
      name: 'Comfort Coach Services',
      contactEmail: 'service@comfortcoach.vn',
      contactPhone: '+84289876543',
      status: 'approved',
    },
    {
      name: 'VIP Transport',
      contactEmail: 'contact@viptransport.vn',
      contactPhone: '+84283334444',
      status: 'approved',
    },
    {
      name: 'Premium Coaches',
      contactEmail: 'hello@premiumcoaches.vn',
      contactPhone: '+84285556666',
      status: 'approved',
    },
    {
      name: 'City Link Express',
      contactEmail: 'support@citylink.vn',
      contactPhone: '+84287778888',
      status: 'approved',
    },
    {
      name: 'Sunshine Travel',
      contactEmail: 'info@sunshinetravel.vn',
      contactPhone: '+84289991111',
      status: 'pending',
    },
  ]

  const operators = []
  for (const config of operatorConfigs) {
    let operator = await prisma.operator.findFirst({
      where: { contactEmail: config.contactEmail },
    })

    if (!operator) {
      operator = await prisma.operator.create({
        data: {
          name: config.name,
          contactEmail: config.contactEmail,
          contactPhone: config.contactPhone,
          status: config.status,
          approvedAt: config.status === 'approved' ? new Date() : null,
        },
      })
    }
    operators.push(operator)
  }
  console.log(`🏢 Created ${operators.length} operators`)

  // Import real HCMC stops from stops.txt (name,latitude,longitude,address)
  const ensureStop = async (name, latitude, longitude, address) => {
    const existing = await prisma.stop.findFirst({ where: { name, latitude, longitude } })
    if (existing) return existing
    return prisma.stop.create({ data: { name, latitude, longitude, address, active: true } })
  }

  const stopsFile = path.resolve(__dirname, '../../data/hcmc_stops.txt')
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
  for (let i = 0; i < routeSpecs.length; i++) {
    const spec = routeSpecs[i]
    // Rotate through approved operators for route assignment
    const operator = operators.filter((o) => o.status === 'approved')[
      i % operators.filter((o) => o.status === 'approved').length
    ]
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

  // Helper function to generate 2-2 layout seats (A, B | Aisle | C, D)
  const generate22Seats = (rows) => {
    const seats = []
    for (let row = 1; row <= rows; row++) {
      seats.push(`A${row}`, `B${row}`, `C${row}`, `D${row}`)
    }
    return seats
  }

  // Create buses for every layout type with images - All using proper 2-2 layout
  const busConfigs = [
    {
      plateNumber: 'GBL-001',
      model: 'Mercedes Sprinter Standard',
      seatCapacity: 32,
      layoutCode: '2-2',
      busType: 'Seater',
      operatorIdx: 0,
      seatNumbers: generate22Seats(8), // 8 rows × 4 seats = 32 seats
      seatType: 'regular',
      images: [
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600',
        'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&h=600',
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600',
      ],
    },
    {
      plateNumber: 'GBL-002',
      model: 'Hyundai Universe Sleeper 32',
      seatCapacity: 32,
      layoutCode: '2-2',
      busType: 'Sleeper',
      operatorIdx: 0,
      seatNumbers: generate22Seats(8), // 8 rows × 4 seats = 32 seats
      seatType: 'sleeper',
      images: [
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&q=80',
        'https://images.unsplash.com/photo-1583377411423-910eee26ca2d?w=800&h=600',
      ],
    },
    {
      plateNumber: 'ETC-001',
      model: 'Thaco Universe Sleeper 40',
      seatCapacity: 40,
      layoutCode: '2-2',
      busType: 'Sleeper',
      operatorIdx: 1,
      seatNumbers: generate22Seats(10), // 10 rows × 4 seats = 40 seats
      seatType: 'sleeper',
      images: [
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&q=85',
        'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&h=600',
        'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=800&h=600',
      ],
    },
    {
      plateNumber: 'CCS-001',
      model: 'Mercedes Cabin VIP',
      seatCapacity: 20,
      layoutCode: '2-2',
      busType: 'Seater',
      operatorIdx: 2,
      seatNumbers: generate22Seats(5), // 5 rows × 4 seats = 20 seats
      seatType: 'premium',
      images: [
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&q=90',
        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=600',
      ],
    },
    {
      plateNumber: 'VIP-001',
      model: 'Ford Transit Limousine 12',
      seatCapacity: 12,
      layoutCode: '2-2',
      busType: 'Seater',
      operatorIdx: 3,
      seatNumbers: generate22Seats(3), // 3 rows × 4 seats = 12 seats
      seatType: 'premium',
      images: [
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&q=95',
        'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600',
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600',
      ],
    },
    {
      plateNumber: 'VIP-002',
      model: 'Hyundai Solati Limousine 16',
      seatCapacity: 16,
      layoutCode: '2-2',
      busType: 'Seater',
      operatorIdx: 3,
      seatNumbers: generate22Seats(4), // 4 rows × 4 seats = 16 seats
      seatType: 'premium',
      images: [
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600',
        'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&h=600',
      ],
    },
    {
      plateNumber: 'PRM-001',
      model: 'Isuzu NPR Premium Seater',
      seatCapacity: 28,
      layoutCode: '2-2',
      busType: 'Seater',
      operatorIdx: 4,
      seatNumbers: generate22Seats(7), // 7 rows × 4 seats = 28 seats
      seatType: 'regular',
      images: [
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600',
        'https://images.unsplash.com/photo-1556610961-2fecc5927173?w=800&h=600',
      ],
    },
    {
      plateNumber: 'CLX-001',
      model: 'Mercedes Tourismo Executive',
      seatCapacity: 36,
      layoutCode: '2-2',
      busType: 'Seater',
      operatorIdx: 5,
      seatNumbers: generate22Seats(9), // 9 rows × 4 seats = 36 seats
      seatType: 'regular',
      images: [
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600',
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600',
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600',
      ],
    },
  ]

  const buses = []
  for (const config of busConfigs) {
    const bus = await prisma.bus.upsert({
      where: { plateNumber: config.plateNumber },
      update: {},
      create: {
        operatorId: operators[config.operatorIdx].id,
        plateNumber: config.plateNumber,
        model: config.model,
        busType: config.busType,
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
        images: JSON.stringify(config.images),
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
    { time: [6, 0], priceMultiplier: 1.0 }, // Early morning
    { time: [7, 30], priceMultiplier: 1.1 }, // Morning peak
    { time: [9, 0], priceMultiplier: 1.0 }, // Mid morning
    { time: [11, 30], priceMultiplier: 0.9 }, // Late morning
    { time: [14, 0], priceMultiplier: 0.95 }, // Afternoon
    { time: [17, 0], priceMultiplier: 1.2 }, // Evening peak
    { time: [19, 30], priceMultiplier: 1.1 }, // Evening
    { time: [22, 0], priceMultiplier: 1.0 }, // Night
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
        const basePrice = Math.floor(route.distanceKm * 1500 * slot.priceMultiplier)

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
    const tripSeats = allSeats.filter((s) => s.busId === trip.busId)
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
  // Seed sample bookings with payment for revenue analytics
  const allUsers = [user1, user2]
  const allPayments = ["VNPAY", "CASH"]
  const allTripsForBooking = await prisma.trip.findMany({})
  const allSeatsForBooking = await prisma.seat.findMany({})
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
  let bookingSeedCount = 0
  for (let i = 0; i < 200; i++) {
    // Phân bổ đều ngày và giờ trong 7 ngày gần nhất
    const day = Math.floor(i / 24) % 7; // 0-6
    const hour = i % 24; // 0-23
    const user = allUsers[randomInt(0, allUsers.length - 1)];
    const trip = allTripsForBooking[(i + day + hour) % allTripsForBooking.length];
    const seat = allSeatsForBooking.find(s => s.busId === trip.busId) || allSeatsForBooking[0];
    const amount = randomInt(50000, 250000);
    const bookedAt = new Date();
    bookedAt.setDate(bookedAt.getDate() - day); // day 0 = hôm nay, day 6 = 6 ngày trước
    bookedAt.setHours(hour, randomInt(0, 59), 0, 0);
    // Tăng số lượng hành khách mỗi booking (2-4)
    const numPassengers = randomInt(2, 4);
    // Lấy các seatCode hợp lệ cho bus của trip
    const tripSeats = allSeatsForBooking.filter(s => s.busId === trip.busId);
    const usedSeats = new Set();
    const passengerDetails = [];
    for (let p = 0; p < numPassengers; p++) {
      // Chọn seatCode chưa bị trùng
      let seat;
      do {
        seat = tripSeats[randomInt(0, tripSeats.length - 1)];
      } while (usedSeats.has(seat.seatNumber) && usedSeats.size < tripSeats.length);
      usedSeats.add(seat.seatNumber);
      passengerDetails.push({
        fullName: `Passenger ${p + 1} Booking ${i + 1}`,
        documentId: `ID${i + 1}${p + 1}${randomInt(1000,9999)}`,
        seatCode: seat.seatNumber
      });
    }

    // Phân phối trạng thái booking: 1/3 initiated, 1/3 confirmed, 1/3 completed
    let status = "completed";
    if (i % 3 === 0) status = "initiated";
    else if (i % 3 === 1) status = "confirmed";

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        tripId: trip.id,
        totalAmount: amount,
        status,
        bookedAt,
        payments: {
          create: {
            provider: allPayments[randomInt(0, allPayments.length - 1)],
            amount: amount,
            status: "success"
          }
        },
        passengerDetails: {
          create: passengerDetails
        }
      }
    });
    bookingSeedCount++;
  }
  console.log(`💵 Seeded ${bookingSeedCount} sample bookings with payment for revenue analytics`)

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
