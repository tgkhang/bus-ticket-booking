import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  MapPin,
  Navigation,
  Clock,
  DollarSign,
  Bus,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  PlayCircle,
  AlertCircle,
  Wifi,
  Wind,
  Droplet,
  Usb,
  Phone,
  Mail,
  User,
  Star,
  TrendingUp,
  Ticket,
  ArrowRight,
} from 'lucide-react';

interface Seat {
  id: string;
  seatNumber: string;
  seatType: 'regular' | 'premium' | 'sleeper';
  status: 'available' | 'locked' | 'booked';
  passengerName?: string;
  bookingId?: string;
}

interface Passenger {
  id: string;
  name: string;
  email: string;
  phone: string;
  seatNumber: string;
  bookingRef: string;
}

interface Booking {
  id: string;
  bookingRef: string;
  userName: string;
  userEmail: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalAmount: number;
  bookedAt: string;
  passengerCount: number;
}

interface RouteStop {
  stopName: string;
  stopAddress: string;
  distanceFromOrigin: number;
  estimatedMinutes: number;
  isPickup: boolean;
  isDropoff: boolean;
}

interface Trip {
  id: string;
  routeId: string;
  routeName: string;
  originStop: string;
  destinationStop: string;
  routeStops: RouteStop[];
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
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  
  seats: Seat[];
  bookings: Booking[];
  passengers: Passenger[];
  
  totalRevenue: number;
  averageRating?: number;
}

export default function TripDetailPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'seats' | 'bookings' | 'route'>('overview');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'scheduled' | 'active' | 'completed' | 'cancelled'>('scheduled');

  const amenityIcons: { [key: string]: any } = {
    wifi: Wifi,
    ac: Wind,
    toilet: Droplet,
    usb: Usb,
  };

  // Mock data - Replace with API call
  useEffect(() => {
    const mockTrip: Trip = {
      id: tripId || '1',
      routeId: 'r1',
      routeName: 'HCMC - Da Lat Express',
      originStop: 'Ho Chi Minh City Terminal',
      destinationStop: 'Da Lat Bus Station',
      routeStops: [
        {
          stopName: 'Bao Loc Rest Stop',
          stopAddress: 'National Highway 20, Bao Loc',
          distanceFromOrigin: 154,
          estimatedMinutes: 195,
          isPickup: false,
          isDropoff: false,
        },
        {
          stopName: 'Di Linh Stop',
          stopAddress: 'Di Linh Town, Lam Dong',
          distanceFromOrigin: 220,
          estimatedMinutes: 280,
          isPickup: true,
          isDropoff: true,
        },
      ],
      distanceKm: 308,
      
      busId: 'b1',
      busPlateNumber: '59A-12345',
      busModel: 'Mercedes Sprinter',
      busCapacity: 45,
      busAmenities: ['wifi', 'ac', 'usb'],
      
      operatorId: 'op1',
      operatorName: 'National Express Vietnam',
      operatorPhone: '+84 123 456 789',
      operatorEmail: 'contact@nationalexpress.vn',
      
      departureTime: '2024-12-15T08:00:00',
      arrivalTime: '2024-12-15T14:30:00',
      basePrice: 350000,
      status: 'scheduled',
      
      seats: [
        { id: 's1', seatNumber: 'A1', seatType: 'premium', status: 'booked', passengerName: 'John Doe', bookingId: 'b1' },
        { id: 's2', seatNumber: 'A2', seatType: 'premium', status: 'booked', passengerName: 'Jane Doe', bookingId: 'b1' },
        { id: 's3', seatNumber: 'A3', seatType: 'regular', status: 'available' },
        { id: 's4', seatNumber: 'A4', seatType: 'regular', status: 'available' },
        { id: 's5', seatNumber: 'B1', seatType: 'regular', status: 'booked', passengerName: 'Mike Smith', bookingId: 'b2' },
        { id: 's6', seatNumber: 'B2', seatType: 'regular', status: 'locked' },
        { id: 's7', seatNumber: 'B3', seatType: 'regular', status: 'available' },
        { id: 's8', seatNumber: 'B4', seatType: 'regular', status: 'available' },
      ],
      
      bookings: [
        {
          id: 'b1',
          bookingRef: 'BUS-2024-001234',
          userName: 'John Doe',
          userEmail: 'john.doe@example.com',
          status: 'confirmed',
          totalAmount: 700000,
          bookedAt: '2024-12-10T14:23:00',
          passengerCount: 2,
        },
        {
          id: 'b2',
          bookingRef: 'BUS-2024-001235',
          userName: 'Mike Smith',
          userEmail: 'mike.smith@example.com',
          status: 'confirmed',
          totalAmount: 350000,
          bookedAt: '2024-12-11T09:15:00',
          passengerCount: 1,
        },
      ],
      
      passengers: [
        {
          id: 'p1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+84 123 456 789',
          seatNumber: 'A1',
          bookingRef: 'BUS-2024-001234',
        },
        {
          id: 'p2',
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          phone: '+84 123 456 790',
          seatNumber: 'A2',
          bookingRef: 'BUS-2024-001234',
        },
        {
          id: 'p3',
          name: 'Mike Smith',
          email: 'mike.smith@example.com',
          phone: '+84 987 654 321',
          seatNumber: 'B1',
          bookingRef: 'BUS-2024-001235',
        },
      ],
      
      totalRevenue: 1050000,
      averageRating: 4.5,
    };
    setTrip(mockTrip);
    setSelectedStatus(mockTrip.status);
  }, [tripId]);

  const handleUpdateStatus = () => {
    if (trip) {
      setTrip({ ...trip, status: selectedStatus });
      setIsEditingStatus(false);
      // TODO: Call API to update status
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700">
            <Calendar className="w-5 h-5" />
            Scheduled
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700">
            <PlayCircle className="w-5 h-5" />
            Active
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700">
            <CheckCircle className="w-5 h-5" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700">
            <XCircle className="w-5 h-5" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const getSeatStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500 hover:bg-green-600';
      case 'locked':
        return 'bg-yellow-500';
      case 'booked':
        return 'bg-gray-400';
      default:
        return 'bg-gray-300';
    }
  };

  const getSeatTypeColor = (type: string) => {
    switch (type) {
      case 'premium':
        return 'border-purple-400';
      case 'sleeper':
        return 'border-blue-400';
      default:
        return 'border-gray-400';
    }
  };

  if (!trip) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Loading trip details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const seatsBooked = trip.seats.filter((s) => s.status === 'booked').length;
  const seatsAvailable = trip.seats.filter((s) => s.status === 'available').length;
  const seatsLocked = trip.seats.filter((s) => s.status === 'locked').length;
  const occupancyPercentage = (seatsBooked / trip.busCapacity) * 100;

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/trips')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-gray-900 mb-1">{trip.routeName}</h1>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(trip.departureTime).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(trip.departureTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isEditingStatus ? (
              <>
                {getStatusBadge(trip.status)}
                <button
                  onClick={() => setIsEditingStatus(true)}
                  className="p-2 text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                  title="Change Status"
                >
                  <Edit className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={handleUpdateStatus}
                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setIsEditingStatus(false);
                    setSelectedStatus(trip.status);
                  }}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Seats Booked</p>
                <p className="text-gray-900 text-2xl">
                  {seatsBooked}/{trip.busCapacity}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-[#2563EB]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Available</p>
                <p className="text-gray-900 text-2xl">{seatsAvailable}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-[#10B981]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Occupancy</p>
                <p className="text-gray-900 text-2xl">{occupancyPercentage.toFixed(0)}%</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Revenue</p>
                <p className="text-gray-900 text-2xl">₫{(trip.totalRevenue / 1000).toFixed(0)}K</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Bookings</p>
                <p className="text-gray-900 text-2xl">{trip.bookings.length}</p>
              </div>
              <div className="bg-pink-100 p-3 rounded-lg">
                <Ticket className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex gap-2 p-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'overview'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('seats')}
              className={`px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'seats'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Seat Layout
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'bookings'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Bookings & Passengers
            </button>
            <button
              onClick={() => setActiveTab('route')}
              className={`px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'route'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Route Details
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trip Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#2563EB]" />
                    Trip Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Trip ID</span>
                      <span className="text-gray-900">{trip.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Departure</span>
                      <span className="text-gray-900">
                        {new Date(trip.departureTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Arrival</span>
                      <span className="text-gray-900">
                        {new Date(trip.arrivalTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="text-gray-900">
                        {Math.floor(
                          (new Date(trip.arrivalTime).getTime() -
                            new Date(trip.departureTime).getTime()) /
                            (1000 * 60 * 60)
                        )}
                        h{' '}
                        {Math.floor(
                          ((new Date(trip.arrivalTime).getTime() -
                            new Date(trip.departureTime).getTime()) %
                            (1000 * 60 * 60)) /
                            (1000 * 60)
                        )}
                        m
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Base Price</span>
                      <span className="text-gray-900">₫{trip.basePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Distance</span>
                      <span className="text-gray-900">{trip.distanceKm} km</span>
                    </div>
                  </div>
                </div>

                {/* Bus Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                    <Bus className="w-5 h-5 text-[#2563EB]" />
                    Bus Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Plate Number</span>
                      <button
                        onClick={() => navigate(`/admin/buses/${trip.busId}`)}
                        className="text-[#2563EB] hover:underline"
                      >
                        {trip.busPlateNumber}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Model</span>
                      <span className="text-gray-900">{trip.busModel}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Capacity</span>
                      <span className="text-gray-900">{trip.busCapacity} seats</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-2">Amenities</span>
                      <div className="flex flex-wrap gap-2">
                        {trip.busAmenities.map((amenity) => {
                          const Icon = amenityIcons[amenity];
                          return (
                            <div
                              key={amenity}
                              className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg"
                            >
                              {Icon && <Icon className="w-4 h-4" />}
                              <span className="text-sm capitalize">{amenity}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operator Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#2563EB]" />
                    Operator Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Company Name</span>
                      <button
                        onClick={() => navigate(`/admin/operators`)}
                        className="text-[#2563EB] hover:underline"
                      >
                        {trip.operatorName}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Phone</span>
                      <a
                        href={`tel:${trip.operatorPhone}`}
                        className="text-gray-900 hover:text-[#2563EB] flex items-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        {trip.operatorPhone}
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Email</span>
                      <a
                        href={`mailto:${trip.operatorEmail}`}
                        className="text-gray-900 hover:text-[#2563EB] flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        {trip.operatorEmail}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Route Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#2563EB]" />
                    Route Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Origin</p>
                        <p className="text-gray-900">{trip.originStop}</p>
                      </div>
                    </div>
                    <div className="ml-4 border-l-2 border-dashed border-gray-300 pl-7 py-2">
                      <p className="text-sm text-gray-600">
                        {trip.routeStops.length} intermediate stop(s)
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Destination</p>
                        <p className="text-gray-900">{trip.destinationStop}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/admin/routes/${trip.routeId}`)}
                      className="w-full mt-4 flex items-center justify-center gap-2 text-[#2563EB] hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                    >
                      View Full Route
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Occupancy Visualization */}
              <div className="mt-6 bg-gray-50 rounded-lg p-6">
                <h3 className="text-gray-900 mb-4">Seat Occupancy</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Overall Occupancy</span>
                      <span className="text-gray-900">{occupancyPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full ${
                          occupancyPercentage >= 80
                            ? 'bg-red-500'
                            : occupancyPercentage >= 50
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${occupancyPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-700 mb-1">Available</p>
                      <p className="text-2xl text-green-900">{seatsAvailable}</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-700 mb-1">Locked</p>
                      <p className="text-2xl text-yellow-900">{seatsLocked}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-sm text-gray-700 mb-1">Booked</p>
                      <p className="text-2xl text-gray-900">{seatsBooked}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Seat Layout Tab */}
          {activeTab === 'seats' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-gray-900 mb-4">Seat Layout - {trip.busPlateNumber}</h3>
                
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500 rounded"></div>
                    <span className="text-sm text-gray-700">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-500 rounded"></div>
                    <span className="text-sm text-gray-700">Locked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-400 rounded"></div>
                    <span className="text-sm text-gray-700">Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 border-4 border-purple-400 bg-white rounded"></div>
                    <span className="text-sm text-gray-700">Premium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 border-4 border-blue-400 bg-white rounded"></div>
                    <span className="text-sm text-gray-700">Sleeper</span>
                  </div>
                </div>

                {/* Seat Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                  {trip.seats.map((seat) => (
                    <div key={seat.id} className="relative group">
                      <div
                        className={`w-full aspect-square rounded-lg text-white transition-all border-4 ${getSeatStatusColor(
                          seat.status
                        )} ${getSeatTypeColor(seat.seatType)}`}
                      >
                        <div className="flex flex-col items-center justify-center h-full p-1">
                          <span className="text-sm font-semibold">{seat.seatNumber}</span>
                          {seat.status === 'booked' && seat.passengerName && (
                            <span className="text-xs text-center mt-1 truncate w-full px-1">
                              {seat.passengerName.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      </div>
                      {seat.status === 'booked' && seat.passengerName && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {seat.passengerName}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bookings & Passengers Tab */}
          {activeTab === 'bookings' && (
            <div className="p-6">
              {/* Bookings Section */}
              <div className="mb-8">
                <h3 className="text-gray-900 mb-4">Bookings ({trip.bookings.length})</h3>
                <div className="space-y-3">
                  {trip.bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-gray-900">{booking.bookingRef}</span>
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                booking.status === 'confirmed'
                                  ? 'bg-green-100 text-green-700'
                                  : booking.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {booking.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="w-4 h-4" />
                              {booking.userName}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="w-4 h-4" />
                              {booking.userEmail}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Users className="w-4 h-4" />
                              {booking.passengerCount} passenger(s)
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {new Date(booking.bookedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                          <p className="text-xl text-gray-900">
                            ₫{booking.totalAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Passengers Section */}
              <div>
                <h3 className="text-gray-900 mb-4">Passenger List ({trip.passengers.length})</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-gray-700">Seat</th>
                        <th className="px-6 py-3 text-left text-gray-700">Name</th>
                        <th className="px-6 py-3 text-left text-gray-700">Email</th>
                        <th className="px-6 py-3 text-left text-gray-700">Phone</th>
                        <th className="px-6 py-3 text-left text-gray-700">Booking Ref</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {trip.passengers.map((passenger) => (
                        <tr key={passenger.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-[#2563EB] text-white rounded-full text-sm">
                              {passenger.seatNumber}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-900">{passenger.name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-600">{passenger.email}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-600">{passenger.phone}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-600">{passenger.bookingRef}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Route Details Tab */}
          {activeTab === 'route' && (
            <div className="p-6">
              <h3 className="text-gray-900 mb-6">Complete Route Journey</h3>
              
              <div className="space-y-4">
                {/* Origin */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="w-0.5 h-20 bg-gray-300"></div>
                  </div>
                  <div className="flex-1 bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-gray-900">Origin</h3>
                      <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">
                        0 km • {new Date(trip.departureTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700">{trip.originStop}</p>
                  </div>
                </div>

                {/* Intermediate Stops */}
                {trip.routeStops.map((stop, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600">{index + 1}</span>
                      </div>
                      <div className="w-0.5 h-20 bg-gray-300"></div>
                    </div>
                    <div className="flex-1 bg-white border-2 border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-gray-900 mb-1">{stop.stopName}</h3>
                          <p className="text-sm text-gray-600">{stop.stopAddress}</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm ml-4">
                          {stop.distanceFromOrigin} km
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 mt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Navigation className="w-4 h-4" />
                          {stop.distanceFromOrigin} km from origin
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          {Math.floor(stop.estimatedMinutes / 60)}h {stop.estimatedMinutes % 60}m
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            stop.isPickup
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {stop.isPickup ? '✓ Pickup' : '✗ No Pickup'}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            stop.isDropoff
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {stop.isDropoff ? '✓ Drop-off' : '✗ No Drop-off'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Destination */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1 bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-gray-900">Destination</h3>
                      <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm">
                        {trip.distanceKm} km • {new Date(trip.arrivalTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700">{trip.destinationStop}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
