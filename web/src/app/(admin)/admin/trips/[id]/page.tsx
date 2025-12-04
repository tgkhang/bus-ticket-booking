'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Wifi,
  Wind,
  Droplet,
  Usb,
  Phone,
  Mail,
  User,
  TrendingUp,
  Ticket,
  ArrowRight,
} from 'lucide-react';
import { TripDetail, TripStatus } from '@/types/trip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'seats' | 'bookings' | 'route'>('overview');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TripStatus>('scheduled');

  const amenityIcons: { [key: string]: any } = {
    wifi: Wifi,
    ac: Wind,
    toilet: Droplet,
    usb: Usb,
  };

  // Mock data - Replace with API call
  useEffect(() => {
    const mockTrip: TripDetail = {
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

      seatsBooked: 3,
      totalSeats: 45,
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
          <Badge className="gap-2 bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
            <Calendar className="w-5 h-5" />
            Scheduled
          </Badge>
        );
      case 'active':
        return (
          <Badge className="gap-2 bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300">
            <PlayCircle className="w-5 h-5" />
            Active
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="gap-2 bg-gray-100 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300">
            <CheckCircle className="w-5 h-5" />
            Completed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="gap-2 bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900 dark:text-red-300">
            <XCircle className="w-5 h-5" />
            Cancelled
          </Badge>
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
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading trip details...</p>
        </div>
      </div>
    );
  }

  const seatsBooked = trip.seats.filter((s) => s.status === 'booked').length;
  const seatsAvailable = trip.seats.filter((s) => s.status === 'available').length;
  const seatsLocked = trip.seats.filter((s) => s.status === 'locked').length;
  const occupancyPercentage = (seatsBooked / trip.busCapacity) * 100;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push('/admin/trips')}
            variant="ghost"
            size="sm"
            className="text-gray-600 dark:text-gray-400"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{trip.routeName}</h1>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(trip.departureTime).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <span>"</span>
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
              <Button
                onClick={() => setIsEditingStatus(true)}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                <Edit className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as TripStatus)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              >
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button
                onClick={handleUpdateStatus}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => {
                  setIsEditingStatus(false);
                  setSelectedStatus(trip.status);
                }}
                variant="ghost"
                size="sm"
                className="text-gray-600 dark:text-gray-400"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Seats Booked</p>
                <p className="text-gray-900 dark:text-white text-2xl font-bold">
                  {seatsBooked}/{trip.busCapacity}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Available</p>
                <p className="text-gray-900 dark:text-white text-2xl font-bold">{seatsAvailable}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Occupancy</p>
                <p className="text-gray-900 dark:text-white text-2xl font-bold">{occupancyPercentage.toFixed(0)}%</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Revenue</p>
                <p className="text-gray-900 dark:text-white text-2xl font-bold">�{((trip.totalRevenue || 0) / 1000).toFixed(0)}K</p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Bookings</p>
                <p className="text-gray-900 dark:text-white text-2xl font-bold">{trip.bookings.length}</p>
              </div>
              <div className="bg-pink-100 dark:bg-pink-900 p-3 rounded-lg">
                <Ticket className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="mb-6">
        <div className="flex gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
          <Button
            onClick={() => setActiveTab('overview')}
            variant={activeTab === 'overview' ? 'default' : 'outline'}
          >
            Overview
          </Button>
          <Button
            onClick={() => setActiveTab('seats')}
            variant={activeTab === 'seats' ? 'default' : 'outline'}
          >
            Seat Layout
          </Button>
          <Button
            onClick={() => setActiveTab('bookings')}
            variant={activeTab === 'bookings' ? 'default' : 'outline'}
          >
            Bookings & Passengers
          </Button>
          <Button
            onClick={() => setActiveTab('route')}
            variant={activeTab === 'route' ? 'default' : 'outline'}
          >
            Route Details
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trip Information */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Trip Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Trip ID</span>
                    <span className="text-gray-900 dark:text-white">{trip.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Departure</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(trip.departureTime).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Arrival</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(trip.arrivalTime).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Duration</span>
                    <span className="text-gray-900 dark:text-white">
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
                    <span className="text-gray-600 dark:text-gray-400">Base Price</span>
                    <span className="text-gray-900 dark:text-white">�{trip.basePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Distance</span>
                    <span className="text-gray-900 dark:text-white">{trip.distanceKm} km</span>
                  </div>
                </div>
              </div>

              {/* Bus Information */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Bus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Bus Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Plate Number</span>
                    <Link
                      href={`/admin/buses/${trip.busId}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {trip.busPlateNumber}
                    </Link>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Model</span>
                    <span className="text-gray-900 dark:text-white">{trip.busModel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Capacity</span>
                    <span className="text-gray-900 dark:text-white">{trip.busCapacity} seats</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 block mb-2">Amenities</span>
                    <div className="flex flex-wrap gap-2">
                      {trip.busAmenities.map((amenity) => {
                        const Icon = amenityIcons[amenity];
                        return (
                          <div
                            key={amenity}
                            className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg"
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
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Operator Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Company Name</span>
                    <Link
                      href={`/admin/operators`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {trip.operatorName}
                    </Link>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Phone</span>
                    <a
                      href={`tel:${trip.operatorPhone}`}
                      className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      {trip.operatorPhone}
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email</span>
                    <a
                      href={`mailto:${trip.operatorEmail}`}
                      className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      {trip.operatorEmail}
                    </a>
                  </div>
                </div>
              </div>

              {/* Route Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Route Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Origin</p>
                      <p className="text-gray-900 dark:text-white">{trip.originStop}</p>
                    </div>
                  </div>
                  <div className="ml-4 border-l-2 border-dashed border-gray-300 dark:border-gray-600 pl-7 py-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {trip.routeStops.length} intermediate stop(s)
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Destination</p>
                      <p className="text-gray-900 dark:text-white">{trip.destinationStop}</p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/routes/${trip.routeId}`}
                    className="w-full mt-4 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 px-4 py-2 rounded-lg transition-colors"
                  >
                    View Full Route
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Occupancy Visualization */}
            <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Seat Occupancy</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Overall Occupancy</span>
                    <span className="text-gray-900 dark:text-white">{occupancyPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
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
                  <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-3">
                    <p className="text-sm text-green-700 dark:text-green-300 mb-1">Available</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{seatsAvailable}</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-1">Locked</p>
                    <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{seatsLocked}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">Booked</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{seatsBooked}</p>
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Seat Layout - {trip.busPlateNumber}</h3>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-500 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Locked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-400 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 border-4 border-purple-400 bg-white dark:bg-gray-800 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Premium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 border-4 border-blue-400 bg-white dark:bg-gray-800 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Sleeper</span>
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bookings ({trip.bookings.length})</h3>
              <div className="space-y-3">
                {trip.bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-gray-900 dark:text-white font-medium">{booking.bookingRef}</span>
                          <Badge
                            className={`${
                              booking.status === 'confirmed'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : booking.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            }`}
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <User className="w-4 h-4" />
                            {booking.userName}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Mail className="w-4 h-4" />
                            {booking.userEmail}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Users className="w-4 h-4" />
                            {booking.passengerCount} passenger(s)
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            {new Date(booking.bookedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Amount</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          �{booking.totalAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Passengers Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Passenger List ({trip.passengers.length})</h3>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Seat</th>
                      <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Name</th>
                      <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Email</th>
                      <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Phone</th>
                      <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Booking Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {trip.passengers.map((passenger) => (
                      <tr key={passenger.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4">
                          <Badge className="bg-blue-600 text-white hover:bg-blue-600">
                            {passenger.seatNumber}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-900 dark:text-white">{passenger.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600 dark:text-gray-400">{passenger.email}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600 dark:text-gray-400">{passenger.phone}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600 dark:text-gray-400">{passenger.bookingRef}</span>
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Complete Route Journey</h3>

            <div className="space-y-4">
              {/* Origin */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="w-0.5 h-20 bg-gray-300 dark:bg-gray-600"></div>
                </div>
                <div className="flex-1 bg-green-50 dark:bg-green-900 border-2 border-green-200 dark:border-green-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Origin</h3>
                    <Badge className="bg-green-600 text-white hover:bg-green-600">
                      0 km " {new Date(trip.departureTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Badge>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{trip.originStop}</p>
                </div>
              </div>

              {/* Intermediate Stops */}
              {trip.routeStops.map((stop, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">{index + 1}</span>
                    </div>
                    <div className="w-0.5 h-20 bg-gray-300 dark:bg-gray-600"></div>
                  </div>
                  <div className="flex-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{stop.stopName}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{stop.stopAddress}</p>
                      </div>
                      <Badge className="bg-blue-600 text-white hover:bg-blue-600 ml-4">
                        {stop.distanceFromOrigin} km
                      </Badge>
                    </div>

                    <div className="flex items-center gap-6 mt-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Navigation className="w-4 h-4" />
                        {stop.distanceFromOrigin} km from origin
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        {Math.floor(stop.estimatedMinutes / 60)}h {stop.estimatedMinutes % 60}m
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <Badge
                        className={`${
                          stop.isPickup
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {stop.isPickup ? ' Pickup' : ' No Pickup'}
                      </Badge>
                      <Badge
                        className={`${
                          stop.isDropoff
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {stop.isDropoff ? ' Drop-off' : ' No Drop-off'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}

              {/* Destination */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="flex-1 bg-red-50 dark:bg-red-900 border-2 border-red-200 dark:border-red-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Destination</h3>
                    <Badge className="bg-red-600 text-white hover:bg-red-600">
                      {trip.distanceKm} km " {new Date(trip.arrivalTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Badge>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{trip.destinationStop}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
