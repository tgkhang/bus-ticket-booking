// Define the User type
export type User = {
  id: string;
  displayName: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  googleId?: string;
  bookingCount?: number;
};