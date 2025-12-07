import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  Eye,
  X,
  Search,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Users,
  Ticket,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
} from 'lucide-react';

interface PassengerDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  seatNumber: string;
}

interface Booking {
  id: string;
  bookingRef: string;
  userId: string;
  userName: string;
  userEmail: string;
  tripId: string;
  routeName: string;
  departureTime: string;
  arrivalTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: number;
  bookedAt: string;
  passengers: PassengerDetail[];
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
}

export default function BookingManagementPage() {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      bookingRef: 'BUS-2024-001234',
      userId: 'u1',
      userName: 'John Doe',
      userEmail: 'john.doe@example.com',
      tripId: 't1',
      routeName: 'HCMC - Da Lat Express',
      departureTime: '2024-12-15T08:00:00',
      arrivalTime: '2024-12-15T14:30:00',
      status: 'confirmed',
      totalAmount: 700000,
      bookedAt: '2024-12-10T14:23:00',
      paymentStatus: 'paid',
      paymentMethod: 'Credit Card',
      passengers: [
        {
          id: 'p1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+84 123 456 789',
          seatNumber: 'A12',
        },
        {
          id: 'p2',
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          phone: '+84 123 456 790',
          seatNumber: 'A13',
        },
      ],
    },
    {
      id: '2',
      bookingRef: 'BUS-2024-001235',
      userId: 'u2',
      userName: 'Sarah Johnson',
      userEmail: 'sarah.j@example.com',
      tripId: 't2',
      routeName: 'Hanoi - Ha Long Bay Route',
      departureTime: '2024-12-16T09:00:00',
      arrivalTime: '2024-12-16T12:45:00',
      status: 'pending',
      totalAmount: 180000,
      bookedAt: '2024-12-11T10:15:00',
      paymentStatus: 'pending',
      passengers: [
        {
          id: 'p3',
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          phone: '+84 987 654 321',
          seatNumber: 'B05',
        },
      ],
    },
    {
      id: '3',
      bookingRef: 'BUS-2024-001236',
      userId: 'u3',
      userName: 'Michael Chen',
      userEmail: 'michael.c@example.com',
      tripId: 't1',
      routeName: 'HCMC - Da Lat Express',
      departureTime: '2024-12-20T14:00:00',
      arrivalTime: '2024-12-20T20:30:00',
      status: 'confirmed',
      totalAmount: 1050000,
      bookedAt: '2024-12-12T16:45:00',
      paymentStatus: 'paid',
      paymentMethod: 'MoMo',
      passengers: [
        {
          id: 'p4',
          name: 'Michael Chen',
          email: 'michael.c@example.com',
          phone: '+84 345 678 901',
          seatNumber: 'C10',
        },
        {
          id: 'p5',
          name: 'Lisa Chen',
          email: 'lisa.c@example.com',
          phone: '+84 345 678 902',
          seatNumber: 'C11',
        },
        {
          id: 'p6',
          name: 'Tom Chen',
          email: 'tom.c@example.com',
          phone: '+84 345 678 903',
          seatNumber: 'C12',
        },
      ],
    },
    {
      id: '4',
      bookingRef: 'BUS-2024-001237',
      userId: 'u4',
      userName: 'Emily Rodriguez',
      userEmail: 'emily.r@example.com',
      tripId: 't3',
      routeName: 'Da Nang - Hue Coastal',
      departureTime: '2024-12-05T07:30:00',
      arrivalTime: '2024-12-05T10:00:00',
      status: 'completed',
      totalAmount: 240000,
      bookedAt: '2024-11-30T09:20:00',
      paymentStatus: 'paid',
      paymentMethod: 'ZaloPay',
      passengers: [
        {
          id: 'p7',
          name: 'Emily Rodriguez',
          email: 'emily.r@example.com',
          phone: '+84 456 789 012',
          seatNumber: 'D08',
        },
        {
          id: 'p8',
          name: 'David Rodriguez',
          email: 'david.r@example.com',
          phone: '+84 456 789 013',
          seatNumber: 'D09',
        },
      ],
    },
    {
      id: '5',
      bookingRef: 'BUS-2024-001238',
      userId: 'u5',
      userName: 'Alex Thompson',
      userEmail: 'alex.t@example.com',
      tripId: 't2',
      routeName: 'Hanoi - Ha Long Bay Route',
      departureTime: '2024-12-18T09:00:00',
      arrivalTime: '2024-12-18T12:45:00',
      status: 'cancelled',
      totalAmount: 360000,
      bookedAt: '2024-12-08T11:30:00',
      paymentStatus: 'refunded',
      paymentMethod: 'Credit Card',
      passengers: [
        {
          id: 'p9',
          name: 'Alex Thompson',
          email: 'alex.t@example.com',
          phone: '+84 567 890 123',
          seatNumber: 'A01',
        },
        {
          id: 'p10',
          name: 'Maria Thompson',
          email: 'maria.t@example.com',
          phone: '+84 567 890 124',
          seatNumber: 'A02',
        },
      ],
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = (
    bookingId: string,
    newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  ) => {
    setBookings(
      bookings.map((booking) =>
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      )
    );
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filterStatus !== 'all' && booking.status !== filterStatus) return false;
    if (filterPaymentStatus !== 'all' && booking.paymentStatus !== filterPaymentStatus)
      return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.bookingRef.toLowerCase().includes(query) ||
        booking.userName.toLowerCase().includes(query) ||
        booking.userEmail.toLowerCase().includes(query) ||
        booking.routeName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
            <CheckCircle className="w-4 h-4" />
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm">
            <Clock className="w-4 h-4" />
            Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">
            <XCircle className="w-4 h-4" />
            Cancelled
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
            <CheckCircle className="w-4 h-4" />
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
            Paid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs">
            Pending
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
            Refunded
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-gray-900 mb-2">Booking Management</h1>
            <p className="text-gray-600">View and manage all customer bookings</p>
          </div>
          <button className="flex items-center gap-2 bg-[#10B981] text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors shadow-md">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Bookings</p>
                <p className="text-gray-900 text-2xl">{bookings.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Ticket className="w-6 h-6 text-[#2563EB]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Confirmed</p>
                <p className="text-gray-900 text-2xl">
                  {bookings.filter((b) => b.status === 'confirmed').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-[#10B981]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Pending</p>
                <p className="text-gray-900 text-2xl">
                  {bookings.filter((b) => b.status === 'pending').length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Revenue</p>
                <p className="text-gray-900 text-2xl">
                  ₫
                  {(
                    bookings
                      .filter((b) => b.paymentStatus === 'paid')
                      .reduce((acc, b) => acc + b.totalAmount, 0) / 1000000
                  ).toFixed(1)}
                  M
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by booking ref, customer, email, or route..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Filter */}
              <div>
                <select
                  value={filterPaymentStatus}
                  onChange={(e) => setFilterPaymentStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                >
                  <option value="all">All Payments</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending Payment</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Booking Ref</th>
                  <th className="px-6 py-3 text-left text-gray-700">Customer</th>
                  <th className="px-6 py-3 text-left text-gray-700">Route</th>
                  <th className="px-6 py-3 text-left text-gray-700">Departure</th>
                  <th className="px-6 py-3 text-left text-gray-700">Passengers</th>
                  <th className="px-6 py-3 text-left text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-gray-700">Payment</th>
                  <th className="px-6 py-3 text-left text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-gray-700">Booked At</th>
                  <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{booking.bookingRef}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-900">{booking.userName}</p>
                        <p className="text-sm text-gray-500">{booking.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{booking.routeName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-900 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(booking.departureTime).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {new Date(booking.departureTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{booking.passengers.length}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">₫{booking.totalAmount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {getPaymentStatusBadge(booking.paymentStatus)}
                        {booking.paymentMethod && (
                          <p className="text-xs text-gray-500">{booking.paymentMethod}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(booking.status)}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(booking.bookedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(booking)}
                        className="p-2 text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                <h2 className="text-gray-900">Booking Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                {/* Booking Info */}
                <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Booking Reference</p>
                    <p className="text-gray-900 text-xl">{selectedBooking.bookingRef}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Booking Status</p>
                    <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Payment Status</p>
                    <div className="mt-1 flex items-center gap-2">
                      {getPaymentStatusBadge(selectedBooking.paymentStatus)}
                      {selectedBooking.paymentMethod && (
                        <span className="text-sm text-gray-600">
                          via {selectedBooking.paymentMethod}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Total Amount</p>
                    <p className="text-gray-900 text-xl">
                      ₫{selectedBooking.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Trip Info */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-gray-900 mb-4">Trip Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Route</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">{selectedBooking.routeName}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Passengers</p>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">{selectedBooking.passengers.length} passengers</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Departure</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">
                          {new Date(selectedBooking.departureTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Arrival</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">
                          {new Date(selectedBooking.arrivalTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-gray-900 mb-4">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Name</p>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">{selectedBooking.userName}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Email</p>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">{selectedBooking.userEmail}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Passenger Details */}
                <div className="mb-6">
                  <h3 className="text-gray-900 mb-4">Passenger Details</h3>
                  <div className="space-y-3">
                    {selectedBooking.passengers.map((passenger, index) => (
                      <div
                        key={passenger.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-gray-900">
                            Passenger {index + 1}
                          </span>
                          <span className="px-3 py-1 bg-[#2563EB] text-white rounded-full text-sm">
                            Seat {passenger.seatNumber}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 mb-1">Name</p>
                            <p className="text-gray-900">{passenger.name}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1">Email</p>
                            <p className="text-gray-900">{passenger.email}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1">Phone</p>
                            <p className="text-gray-900">{passenger.phone}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="flex gap-2">
                    {selectedBooking.status === 'pending' && (
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedBooking.id, 'confirmed');
                          setShowDetailsModal(false);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Confirm Booking
                      </button>
                    )}
                    {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedBooking.id, 'cancelled');
                          setShowDetailsModal(false);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
