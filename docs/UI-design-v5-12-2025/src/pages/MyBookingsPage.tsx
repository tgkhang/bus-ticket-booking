import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Ticket, Calendar, Users, Eye, X, PackageOpen } from 'lucide-react';

type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

interface Booking {
  id: string;
  bookingRef: string;
  status: BookingStatus;
  route: { from: string; to: string };
  date: string;
  departure: string;
  operator: string;
  passengers: number;
  seats: string[];
  totalPrice: number;
}

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');

  // Mock bookings data
  const allBookings: Booking[] = [
    {
      id: '1',
      bookingRef: 'BUS-2024-123456',
      status: 'confirmed',
      route: { from: 'Ho Chi Minh City', to: 'Da Lat' },
      date: '2024-12-15',
      departure: '11:59pm',
      operator: 'National Express',
      passengers: 2,
      seats: ['A1', 'A2'],
      totalPrice: 700000,
    },
    {
      id: '2',
      bookingRef: 'BUS-2024-123455',
      status: 'completed',
      route: { from: 'Hanoi', to: 'Ha Long Bay' },
      date: '2024-11-20',
      departure: '9:00am',
      operator: 'Futa Bus Lines',
      passengers: 1,
      seats: ['B3'],
      totalPrice: 180000,
    },
    {
      id: '3',
      bookingRef: 'BUS-2024-123454',
      status: 'cancelled',
      route: { from: 'Da Nang', to: 'Hue' },
      date: '2024-11-25',
      departure: '2:30pm',
      operator: 'Mai Linh Express',
      passengers: 3,
      seats: ['C1', 'C2', 'C3'],
      totalPrice: 360000,
    },
    {
      id: '4',
      bookingRef: 'BUS-2024-123453',
      status: 'pending',
      route: { from: 'Ho Chi Minh City', to: 'Nha Trang' },
      date: '2024-12-20',
      departure: '7:00pm',
      operator: 'Phuong Trang',
      passengers: 2,
      seats: ['D1', 'D2'],
      totalPrice: 640000,
    },
  ];

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-[#10B981] text-white';
      case 'pending':
        return 'bg-[#F59E0B] text-white';
      case 'cancelled':
        return 'bg-[#EF4444] text-white';
      case 'completed':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-300 text-gray-700';
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filterBookings = (bookings: Booking[]) => {
    switch (activeTab) {
      case 'upcoming':
        return bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending');
      case 'past':
        return bookings.filter((b) => b.status === 'completed');
      case 'cancelled':
        return bookings.filter((b) => b.status === 'cancelled');
      default:
        return bookings;
    }
  };

  const filteredBookings = filterBookings(allBookings);

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      alert('Booking cancelled successfully. Refund will be processed within 5-7 business days.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-gray-900 mb-8">My Bookings</h1>

        {/* Tab Filters */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-4 whitespace-nowrap transition-colors ${
                activeTab === 'all'
                  ? 'border-b-2 border-[#2563EB] text-[#2563EB]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Bookings
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-4 whitespace-nowrap transition-colors ${
                activeTab === 'upcoming'
                  ? 'border-b-2 border-[#2563EB] text-[#2563EB]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-4 whitespace-nowrap transition-colors ${
                activeTab === 'past'
                  ? 'border-b-2 border-[#2563EB] text-[#2563EB]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-6 py-4 whitespace-nowrap transition-colors ${
                activeTab === 'cancelled'
                  ? 'border-b-2 border-[#2563EB] text-[#2563EB]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <PackageOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">
              You don't have any {activeTab !== 'all' ? activeTab : ''} bookings yet
            </p>
            <Link
              to="/"
              className="inline-block bg-[#2563EB] text-white px-6 py-3 rounded-md hover:bg-[#1d4ed8] transition-colors"
            >
              Book a Trip
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Ticket className="w-5 h-5 text-[#2563EB]" />
                      <span className="text-gray-900">{booking.bookingRef}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {getStatusLabel(booking.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-gray-600 mb-1">Route</p>
                        <p className="text-gray-900">
                          {booking.route.from} → {booking.route.to}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-600">Date & Time</p>
                          <p className="text-gray-900">
                            {booking.date} | {booking.departure}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Operator</p>
                        <p className="text-gray-900">{booking.operator}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-600">Passengers</p>
                          <p className="text-gray-900">
                            {booking.passengers} | Seats: {booking.seats.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className="text-gray-600">Total: </span>
                      <span className="text-[#2563EB]">
                        ₫{booking.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex lg:flex-col gap-3">
                    <button className="flex items-center justify-center gap-2 bg-[#2563EB] text-white px-6 py-2 rounded-md hover:bg-[#1d4ed8] transition-colors whitespace-nowrap">
                      <Eye className="w-4 h-4" />
                      View Ticket
                    </button>
                    {(booking.status === 'confirmed' || booking.status === 'pending') && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="flex items-center justify-center gap-2 bg-white border-2 border-[#EF4444] text-[#EF4444] px-6 py-2 rounded-md hover:bg-red-50 transition-colors whitespace-nowrap"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
