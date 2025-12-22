/* eslint-disable @typescript-eslint/no-explicit-any */
import { LayoutPattern } from './baseBusType'

export interface SeatItem {
  id: string
  code: string
  [key: string]: any
}

export interface SeatWithNumber {
  id: string
  seatNumber: string
  [key: string]: any
}

export interface GroupedSeats<T extends SeatItem> {
  rows: { [key: number]: T[] }
  columns: string[]
}

export interface DetectedLayoutPattern extends LayoutPattern {
  hasMiddle: boolean
}

/**
 * Detect layout pattern from seat codes and group seats by rows
 * Automatically detects bus layout based on seat codes (A1, B1, L1, M1, R1, etc.)
 * 
 * @param seats - Array of seats with at least { id, code } properties
 * @returns Object containing grouped rows and detected columns
 */
export const detectLayoutAndGroupSeats = <T extends SeatItem>(
  seats: T[]
): GroupedSeats<T> => {
  const rows: { [key: number]: T[] } = {}
  const columnSet = new Set<string>()

  seats.forEach((seat) => {
    if (!seat.code) {
      console.warn('Seat without code:', seat)
      return
    }

    // Match seat code pattern: Letter(s) + Number (e.g., A1, L1, R1)
    const match = seat.code.match(/^([A-Z]+)(\d+)$/)
    if (match) {
      const column = match[1]
      const row = parseInt(match[2])

      columnSet.add(column)

      if (!rows[row]) rows[row] = []
      rows[row].push(seat)
    }
  })

  // Sort seats in each row by column letter
  Object.keys(rows).forEach((rowNum) => {
    rows[Number(rowNum)].sort((a, b) => a.code.localeCompare(b.code))
  })

  return { rows, columns: Array.from(columnSet).sort() }
}

/**
 * Detect layout pattern based on columns
 * Determines the seating arrangement (left, middle, right) based on column count and patterns
 *
 * Common patterns:
 * - 2-2: A, B, C, D (4 columns) - Standard seater bus
 * - 1-1-1: L, M, R (3 columns) - Sleeper bus with middle aisle
 * - 2-1: A, B, C (3 columns) - Limousine layout
 * - Cabin: L, R (2 columns) - VIP cabin sleeper
 *
 * @param columns - Array of column letters detected from seat codes
 * @returns Layout pattern with left, right, optional middle, and hasMiddle flag
 */
export const detectLayoutPattern = (columns: string[]): DetectedLayoutPattern => {
  const columnCount = columns.length

  if (columnCount === 2) {
    // Cabin-VIP or similar: L, R
    return { left: 1, right: 1, hasMiddle: false }
  } else if (columnCount === 3) {
    // Check if it's 1-1-1 (sleeper) or 2-1 (limousine)
    // For sleeper: usually L, M, R
    // For limousine: usually A, B, C
    if (columns.includes('M') || columns.includes('L')) {
      return { left: 1, middle: 1, right: 1, hasMiddle: true }
    } else {
      return { left: 2, right: 1, hasMiddle: false }
    }
  } else if (columnCount === 4) {
    // Standard 2-2 layout: A, B, C, D
    return { left: 2, right: 2, hasMiddle: false }
  } else {
    // Fallback for unknown patterns
    const half = Math.floor(columnCount / 2)
    return { left: half, right: columnCount - half, hasMiddle: false }
  }
}

/**
 * Organize seats by floor number for multi-floor buses
 * Detects floor from seat number pattern (e.g., "1A1" is floor 1, "2B3" is floor 2)
 *
 * @param seats - Array of seats with seatNumber property
 * @returns Object mapping floor numbers to arrays of seats
 */
export const organizeSeatsByFloor = <T extends SeatWithNumber>(
  seats?: T[]
): { [key: number]: T[] } => {
  const floors: { [key: number]: T[] } = {}

  if (!seats) return floors

  seats.forEach((seat) => {
    // Check if seat number starts with a floor number (e.g., "1A1", "2B3")
    const floorMatch = seat.seatNumber.match(/^(\d)/)
    const floor = floorMatch ? parseInt(floorMatch[1]) : 1

    if (!floors[floor]) {
      floors[floor] = []
    }
    floors[floor].push(seat)
  })

  return floors
}

/**
 * Organize seats by row numbers for better visualization
 * Groups seats by row and sorts them by column letter within each row
 *
 * @param seats - Array of seats with seatNumber property
 * @returns Object mapping row numbers (as strings) to sorted arrays of seats
 */
export const organizeSeatsByRows = <T extends SeatWithNumber>(
  seats?: T[]
): { [key: string]: T[] } => {
  const rows: { [key: string]: T[] } = {}

  if (!seats) return rows

  seats.forEach((seat) => {
    // Extract row number from seat (e.g., "A1" -> "1", "1A1" -> "1")
    const rowMatch = seat.seatNumber.match(/(\d+)$/)
    const rowNum = rowMatch ? rowMatch[1] : '0'

    if (!rows[rowNum]) {
      rows[rowNum] = []
    }
    rows[rowNum].push(seat)
  })

  // Sort rows by number
  const sortedRows: { [key: string]: T[] } = {}
  Object.keys(rows)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach((key) => {
      // Sort seats within each row by column letter
      sortedRows[key] = rows[key].sort((a, b) => {
        const colA = a.seatNumber.replace(/\d/g, '')
        const colB = b.seatNumber.replace(/\d/g, '')
        return colA.localeCompare(colB)
      })
    })

  return sortedRows
}

/**
 * Get Tailwind CSS color class for seat status
 *
 * @param status - Seat status (available, locked, booked)
 * @returns Tailwind CSS background color class
 */
export const getSeatStatusColor = (status: string): string => {
  switch (status) {
    case 'available':
      return 'bg-green-500'
    case 'locked':
      return 'bg-yellow-500'
    case 'booked':
      return 'bg-gray-400'
    default:
      return 'bg-gray-300'
  }
}

/**
 * Get Tailwind CSS border color class for seat type
 *
 * @param type - Seat type (premium, sleeper, regular)
 * @returns Tailwind CSS border color class
 */
export const getSeatTypeBorderColor = (type: string): string => {
  switch (type) {
    case 'premium':
      return 'border-purple-400'
    case 'sleeper':
      return 'border-blue-400'
    default:
      return 'border-gray-400'
  }
}

/**
 * Get Tailwind CSS background color class for seat type (for bus details page)
 *
 * @param type - Seat type (premium, sleeper, regular)
 * @returns Tailwind CSS background color class with hover state
 */
export const getSeatTypeBackgroundColor = (type: string): string => {
  switch (type) {
    case 'premium':
      return 'bg-purple-500 hover:bg-purple-600'
    case 'sleeper':
      return 'bg-blue-500 hover:bg-blue-600'
    default:
      return 'bg-green-500 hover:bg-green-600'
  }
}
