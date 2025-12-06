import { LayoutPattern } from './baseBusType'

export interface SeatItem {
  id: string
  code: string
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
