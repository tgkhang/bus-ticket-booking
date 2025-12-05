export interface LayoutPattern {
  left: number
  middle?: number
  right: number
  floors?: number
}

export interface BusLayoutDetailed {
  code: string
  name: string
  type: string
  rows?: string
  layout?: string
  capacity_range: string
  common_use: string
  description: string
  layoutPattern: LayoutPattern
}

export const BUS_LAYOUTS_VIETNAM_DETAILED: BusLayoutDetailed[] = [
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
    layoutPattern: { left: 2, right: 2 },
  },
]

export const BUS_LAYOUTS_VIETNAM_BRIEF = [
  { code: '2-2', type: 'Seater', name: 'Ghế ngồi 2-2' },
  { code: 'Sleeper-32', type: 'Sleeper Bus', name: 'Giường nằm 32 chỗ' },
  { code: 'Sleeper-40', type: 'Sleeper Bus', name: 'Giường nằm 40 chỗ' },
  { code: 'Cabin-VIP', type: 'VIP Cabin Sleeper', name: 'Giường nằm Cabin riêng' },
  { code: 'Limo-9', type: 'Limousine', name: 'Limousine 9 chỗ' },
  { code: 'Limo-16', type: 'Limousine', name: 'Limousine 16 chỗ' },
  // { code: '2-1', type: 'VIP Seater', name: 'Ghế ngồi 2-1' },
  // { code: '1-1', type: 'Luxury Seater', name: 'Ghế VIP 1-1' },
  // { code: 'City-Transit', type: 'City Bus', name: 'Xe buýt nội thành' },
  // { code: 'Mini-Bus', type: 'Mini Bus', name: 'Xe buýt nhỏ' },
]

/**
 * Get layout configuration by code
 */
export const getLayoutByCode = (layoutCode: string): BusLayoutDetailed | null => {
  return BUS_LAYOUTS_VIETNAM_DETAILED.find((layout) => layout.code === layoutCode) || null
}

/**
 * Calculate expected seat count for a layout
 */
export const calculateSeatCount = (layoutCode: string, rows: number): number => {
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

/**
 * Calculate suggested number of rows based on bus capacity
 */
export const calculateSuggestedRows = (layoutCode: string, busCapacity: number): number => {
  const layout = getLayoutByCode(layoutCode)
  if (!layout || !layout.layoutPattern) {
    return 10 // default fallback
  }

  const pattern = layout.layoutPattern
  const seatsPerRow = (pattern.left || 0) + (pattern.middle || 0) + (pattern.right || 0)

  if (seatsPerRow === 0) return 10

  return Math.floor(busCapacity / seatsPerRow)
}
