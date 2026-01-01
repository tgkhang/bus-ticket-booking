// Define the User type
export type User = {
  id: string
  displayName: string
  username: string
  email: string
  role: 'admin' | 'client' | 'staff' | 'operator'
  isActive: boolean
  avatar?: string
  createdAt: string
  updatedAt: string
  lastLogin?: string
  googleId?: string
  bookingCount?: number
  // Staff-specific fields
  staffId?: string
  operatorId?: string
  operatorName?: string
}
