// Trip types for the bus ticket booking system

export type TripStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

export type SeatStatus = 'available' | 'locked' | 'booked';

export type SeatType = 'regular' | 'premium' | 'sleeper';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Seat {
  id: string;
  seatNumber: string;
  seatType: SeatType;
  status: SeatStatus;
  passengerName?: string;
  bookingId?: string;
}

export interface Passenger {
  id: string;
  name: string;
  email: string;
  phone: string;
  seatNumber: string;
  bookingRef: string;
}

export interface TripBooking {
  id: string;
  bookingRef: string;
  userName: string;
  userEmail: string;
  status: BookingStatus;
  totalAmount: number;
  bookedAt: string;
  passengerCount: number;
}

export interface Trip {
  id: string;
  routeId: string;
  routeName: string;
  originStop: string;
  destinationStop: string;
  distanceKm: number;

  busId: string;
  busPlateNumber: string;
  busModel: string;
  busCapacity: number;
  busAmenities: string[];

  operatorId: string;
  operatorName: string;
  operatorPhone: string;
  operatorEmail: string;

  departureTime: string;
  arrivalTime: string;
  basePrice: number;
  status: TripStatus;

  seatsBooked: number;
  totalSeats: number;

  totalRevenue?: number;
  averageRating?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TripDetail extends Trip {
  routeStops: Array<{
    stopName: string;
    stopAddress: string;
    distanceFromOrigin: number;
    estimatedMinutes: number;
    isPickup: boolean;
    isDropoff: boolean;
  }>;
  seats: Seat[];
  bookings: TripBooking[];
  passengers: Passenger[];
}

export interface CreateTripData {
  routeId: string;
  busId: string;
  departureTime: string;
  arrivalTime: string;
  basePrice: number;
  status: TripStatus;
}

export interface UpdateTripData extends Partial<CreateTripData> {
  id: string;
}

export interface ListTripsFilters {
  status?: TripStatus;
  routeId?: string;
  busId?: string;
  operatorId?: string;
  departureFrom?: string;
  departureTo?: string;
  search?: string;
}

export interface SearchTripsFilters {
  originStopId?: string;
  destinationStopId?: string;
  departureDate?: string;
  minPrice?: number;
  maxPrice?: number;
}
