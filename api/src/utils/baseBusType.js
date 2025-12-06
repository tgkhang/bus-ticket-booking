export const BUS_LAYOUTS_VIETNAM_DETAILED = [
  {
    code: '2-2',
    name: 'Ghế ngồi 2-2',
    type: 'Seater Bus',
    rows: '2 seats left, 2 seats right',
    capacity_range: '28–45 seats',
    common_use: 'Intercity travel, short to medium distances',
    description: 'Standard seater layout used by most Vietnamese intercity buses. Comfortable for trips under 6 hours.',
    layoutPattern: { left: 2, right: 2 },
  },
  {
    code: '2-1',
    name: 'Ghế ngồi 2-1',
    type: 'VIP Seater Bus',
    rows: '2 seats left, 1 seat right',
    capacity_range: '20–30 seats',
    common_use: 'Premium intercity routes, airport transfers',
    description: 'More spacious than 2-2 layout with wider VIP seats and extra legroom.',
    layoutPattern: { left: 2, right: 1 },
  },
  {
    code: '1-1',
    name: 'Ghế ngồi VIP 1-1',
    type: 'Luxury Seater Bus',
    rows: '1 seat left, 1 seat right',
    capacity_range: '16–20 seats',
    common_use: 'Business travel, long-distance VIP routes',
    description: 'Extremely spacious single-row VIP seats, often with massage, recline, charging ports.',
    layoutPattern: { left: 1, right: 1 },
  },
  {
    code: 'Sleeper-32',
    name: 'Giường nằm 32 chỗ',
    type: 'Sleeper Bus',
    layout: '2 floors, 1-1-1 layout',
    capacity_range: '30–34 beds',
    common_use: 'Long-distance travel (Saigon–Hanoi, Saigon–Đà Lạt)',
    description: 'Classic sleeper bus with 3 columns of reclining beds (left, middle, right).',
    layoutPattern: { left: 1, middle: 1, right: 1, floors: 2 },
  },
  {
    code: 'Sleeper-40',
    name: 'Giường nằm 40 chỗ',
    type: 'High-Capacity Sleeper Bus',
    layout: '2 floors, 1-1-1 layout',
    capacity_range: '38–44 beds',
    common_use: 'Low-cost long-distance routes',
    description: 'Higher capacity sleeper bus with 3 narrow columns of beds. Used by budget companies.',
    layoutPattern: { left: 1, middle: 1, right: 1, floors: 2 },
  },
  {
    code: 'Cabin-VIP',
    name: 'Giường nằm Cabin VIP',
    type: 'Private Cabin Sleeper',
    layout: '1 or 2 floors with private rooms',
    capacity_range: '18–24 cabins',
    common_use: 'Premium long-distance routes (HCMC–Nha Trang, HCMC–Đà Lạt)',
    description:
      'Each passenger gets a private enclosed cabin with door, screen, USB, AC, curtain. Most comfortable sleeper bus.',
    layoutPattern: { left: 1, right: 1, floors: 2 },
  },
  {
    code: 'Limo-9',
    name: 'Limousine 9 chỗ',
    type: 'VIP Van Limousine',
    layout: '3 rows (2-1 style), 9 large VIP seats',
    capacity_range: '9 seats',
    common_use: 'Short trips, airport transfer, business travel',
    description: 'Modified Ford Transit or Hyundai Solati with luxury seats and LED lighting.',
    layoutPattern: { left: 2, right: 1 },
  },
  {
    code: 'Limo-16',
    name: 'Limousine 16 chỗ',
    type: 'VIP Minibus',
    layout: 'Upgraded 16-seat van',
    capacity_range: '10–16 seats',
    common_use: 'Premium intercity routes, tourist transport',
    description: 'Like Limo-9 but larger. Used heavily on HCMC–Vũng Tàu and Hà Nội–Ninh Bình routes.',
    layoutPattern: { left: 2, right: 1 },
  },
  // {
  //   code: 'City-Transit',
  //   name: 'Xe buýt nội thành',
  //   type: 'City Bus',
  //   layout: 'Standing + seating mixed',
  //   capacity_range: '60–100 passengers',
  //   common_use: 'City public transportation',
  //   description: 'Used by public bus systems with standing area, disabled priority seating, and wide doors.',
  //   layoutPattern: { left: 2, right: 2 },
  // },
  // {
  //   code: 'Mini-Bus',
  //   name: 'Xe buýt nhỏ',
  //   type: 'Mini City Bus',
  //   layout: '15–25 seats',
  //   capacity_range: '20–40 passengers',
  //   common_use: 'Narrow roads, school bus, shuttle',
  //   description: 'Smaller buses for city and rural routes with limited space.',
  //   layoutPattern: { left: 2, right: 1 },
  // },
]

export const BUS_LAYOUTS_VIETNAM_BRIEF = [
  { code: '2-2', type: 'Seater', name: 'Ghế ngồi 2-2' },
  { code: '2-1', type: 'VIP Seater', name: 'Ghế ngồi 2-1' },
  { code: '1-1', type: 'Luxury Seater', name: 'Ghế VIP 1-1' },
  { code: 'Sleeper-32', type: 'Sleeper Bus', name: 'Giường nằm 32 chỗ' },
  { code: 'Sleeper-40', type: 'Sleeper Bus', name: 'Giường nằm 40 chỗ' },
  { code: 'Cabin-VIP', type: 'VIP Cabin Sleeper', name: 'Giường nằm Cabin riêng' },
  // { code: 'Limo-9', type: 'Limousine', name: 'Limousine 9 chỗ' },
  // { code: 'Limo-16', type: 'Limousine', name: 'Limousine 16 chỗ' },
  // { code: 'City-Transit', type: 'City Bus', name: 'Xe buýt nội thành' },
  // { code: 'Mini-Bus', type: 'Mini Bus', name: 'Xe buýt nhỏ' },
]

/**
 * Get layout configuration by code
 * @param {string} layoutCode - The layout code (e.g., '2-2', 'Sleeper-32')
 * @returns {object|null} The layout configuration or null if not found
 */
export const getLayoutByCode = (layoutCode) => {
  return BUS_LAYOUTS_VIETNAM_DETAILED.find((layout) => layout.code === layoutCode) || null
}

/**
 * Generate seat layout based on bus type code
 * Simplified version that matches frontend expectations
 *
 * Seat numbering format:
 * - Single floor: A1, B1, C1, D1 (Column + Row)
 * - Multi-floor: 1A1, 1B1, 1C1, 1D1 (Floor + Column + Row)
 *
 * @param {string} layoutCode - The bus layout code
 * @param {number} rows - Number of rows to generate
 * @param {string} seatType - Type of seat (regular, premium, sleeper)
 * @param {number} startRow - Starting row number (default: 1)
 * @returns {array} Array of seat objects
 */
export const generateSeatsByLayoutCode = (layoutCode, rows, seatType = 'regular', startRow = 1) => {
  const layout = getLayoutByCode(layoutCode)
  if (!layout || !layout.layoutPattern) {
    throw new Error(`Invalid or unsupported layout code: ${layoutCode}`)
  }

  const pattern = layout.layoutPattern
  const seats = []
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

  // Handle floor-based layouts (sleeper buses with multiple floors)
  if (pattern.floors && pattern.floors > 1) {
    // Calculate rows per floor
    const rowsPerFloor = Math.ceil(rows / pattern.floors)

    for (let floor = 1; floor <= pattern.floors; floor++) {
      for (let row = 1; row <= rowsPerFloor; row++) {
        let colIndex = 0

        // Generate left side seats
        for (let i = 0; i < pattern.left; i++) {
          seats.push({
            seatNumber: `${floor}${columns[colIndex]}${row}`,
            seatType,
            isActive: true,
          })
          colIndex++
        }

        // Generate middle seats (if exists, for 1-1-1 layouts)
        if (pattern.middle) {
          for (let i = 0; i < pattern.middle; i++) {
            seats.push({
              seatNumber: `${floor}${columns[colIndex]}${row}`,
              seatType,
              isActive: true,
            })
            colIndex++
          }
        }

        // Generate right side seats
        for (let i = 0; i < pattern.right; i++) {
          seats.push({
            seatNumber: `${floor}${columns[colIndex]}${row}`,
            seatType,
            isActive: true,
          })
          colIndex++
        }
      }
    }
  } else {
    // Standard single-floor layout
    for (let row = startRow; row < startRow + rows; row++) {
      let colIndex = 0

      // Generate left side seats
      for (let i = 0; i < pattern.left; i++) {
        seats.push({
          seatNumber: `${columns[colIndex]}${row}`,
          seatType,
          isActive: true,
        })
        colIndex++
      }

      // Generate right side seats (columns continue after left seats)
      for (let i = 0; i < pattern.right; i++) {
        seats.push({
          seatNumber: `${columns[colIndex]}${row}`,
          seatType,
          isActive: true,
        })
        colIndex++
      }
    }
  }

  return seats
}

/**
 * Calculate expected seat count for a layout
 * @param {string} layoutCode - The bus layout code
 * @param {number} rows - Number of rows
 * @returns {number} Expected seat count
 */
export const calculateSeatCount = (layoutCode, rows) => {
  const layout = getLayoutByCode(layoutCode)
  if (!layout || !layout.layoutPattern) {
    throw new Error(`Invalid or unsupported layout code: ${layoutCode}`)
  }

  const pattern = layout.layoutPattern
  const seatsPerRow = (pattern.left || 0) + (pattern.middle || 0) + (pattern.right || 0)

  if (pattern.floors && pattern.floors > 1) {
    return seatsPerRow * rows
  }

  return seatsPerRow * rows
}
