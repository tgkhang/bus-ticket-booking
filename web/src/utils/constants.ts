import { Wifi, Wind, Droplet, Usb, Tv, Lightbulb, User } from 'lucide-react'

export const ITEMS_PER_PAGE = 7

export const amenityOptions = [
  { value: 'wifi', label: 'WiFi', icon: Wifi },
  { value: 'ac', label: 'AC', icon: Wind },
  { value: 'restroom', label: 'Restroom', icon: Droplet },
  { value: 'usb_charging', label: 'USB Charging', icon: Usb },
  { value: 'entertainment', label: 'Entertainment', icon: Tv },
  { value: 'reclining_seats', label: 'Reclining Seats', icon: User },
  { value: 'reading_light', label: 'Reading Light', icon: Lightbulb },
  { value: 'blanket', label: 'Blanket', icon: Lightbulb },
  { value: 'water', label: 'Water', icon: Droplet },
]
