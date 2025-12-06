import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Filter,
  Calendar,
  Clock,
  DollarSign,
  Bus,
  Users,
  CheckCircle,
  XCircle,
  PlayCircle,
  Eye,
} from 'lucide-react';

interface Trip {
  id: string;
  routeId: string;
  routeName: string;
  busId: string;
  busInfo: string;
  departureTime: string;
  arrivalTime: string;
  basePrice: number;
  seatsBooked: number;
  totalSeats: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
}

export default function TripManagementPage() {
  const navigate = useNavigate();
  
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: '1',
      routeId: 'r1',
      routeName: 'HCMC - Da Lat Express',
      busId: 'b1',
      busInfo: '59A-12345 - Mercedes Sprinter (45 seats)',
      departureTime: '2024-12-01T08:00:00',
      arrivalTime: '2024-12-01T14:30:00',
      basePrice: 350000,
      seatsBooked: 33,
      totalSeats: 45,
      status: 'completed',
    },
    {
      id: '2',
      routeId: 'r2',
      routeName: 'Hanoi - Ha Long Bay Route',
      busId: 'b2',
      busInfo: '51B-67890 - Hyundai Universe (40 seats)',
      departureTime: '2024-12-15T09:00:00',
      arrivalTime: '2024-12-15T12:45:00',
      basePrice: 180000,
      seatsBooked: 28,
      totalSeats: 40,
      status: 'active',
    },
    {
      id: '3',
      routeId: 'r1',
      routeName: 'HCMC - Da Lat Express',
      busId: 'b1',
      busInfo: '59A-12345 - Mercedes Sprinter (45 seats)',
      departureTime: '2024-12-20T14:00:00',
      arrivalTime: '2024-12-20T20:30:00',
      basePrice: 350000,
      seatsBooked: 12,
      totalSeats: 45,
      status: 'scheduled',
    },
    {
      id: '4',
      routeId: 'r3',
      routeName: 'Da Nang - Hue Coastal',
      busId: 'b3',
      busInfo: '29C-11111 - Thaco TB120S (35 seats)',
      departureTime: '2024-12-18T07:30:00',
      arrivalTime: '2024-12-18T10:00:00',
      basePrice: 120000,
      seatsBooked: 0,
      totalSeats: 35,
      status: 'cancelled',
    },
  ]);

  const [routes] = useState([
    { id: 'r1', name: 'HCMC - Da Lat Express' },
    { id: 'r2', name: 'Hanoi - Ha Long Bay Route' },
    { id: 'r3', name: 'Da Nang - Hue Coastal' },
  ]);

  const [buses] = useState([
    { id: 'b1', info: '59A-12345 - Mercedes Sprinter (45 seats)', capacity: 45 },
    { id: 'b2', info: '51B-67890 - Hyundai Universe (40 seats)', capacity: 40 },
    { id: 'b3', info: '29C-11111 - Thaco TB120S (35 seats)', capacity: 35 },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [formData, setFormData] = useState({
    routeId: '',
    busId: '',
    departureTime: '',
    arrivalTime: '',
    basePrice: 0,
    status: 'scheduled' as 'scheduled' | 'active' | 'completed' | 'cancelled',
  });

  const handleOpenModal = (trip?: Trip) => {
    if (trip) {
      setEditingTrip(trip);
      setFormData({
        routeId: trip.routeId,
        busId: trip.busId,
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        basePrice: trip.basePrice,
        status: trip.status,
      });
    } else {
      setEditingTrip(null);
      setFormData({
        routeId: '',
        busId: '',
        departureTime: '',
        arrivalTime: '',
        basePrice: 0,
        status: 'scheduled',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTrip(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const route = routes.find((r) => r.id === formData.routeId);
    const bus = buses.find((b) => b.id === formData.busId);

    if (editingTrip) {
      setTrips(
        trips.map((trip) =>
          trip.id === editingTrip.id
            ? {
                ...trip,
                ...formData,
                routeName: route?.name || '',
                busInfo: bus?.info || '',
                totalSeats: bus?.capacity || 0,
              }
            : trip
        )
      );
    } else {
      const newTrip: Trip = {
        id: Date.now().toString(),
        ...formData,
        routeName: route?.name || '',
        busInfo: bus?.info || '',
        seatsBooked: 0,
        totalSeats: bus?.capacity || 0,
      };
      setTrips([...trips, newTrip]);
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      setTrips(trips.filter((trip) => trip.id !== id));
    }
  };

  const filteredTrips = trips.filter(
    (trip) => filterStatus === 'all' || trip.status === filterStatus
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
            <Calendar className="w-4 h-4" />
            Scheduled
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
            <PlayCircle className="w-4 h-4" />
            Active
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
            <CheckCircle className="w-4 h-4" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">
            <XCircle className="w-4 h-4" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 80) return 'text-red-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-gray-900 mb-2">Trip Management</h1>
            <p className="text-gray-600">Schedule and manage bus trips</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#2563EB] text-white px-6 py-3 rounded-lg hover:bg-[#1d4ed8] transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Schedule Trip
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Trips</p>
                <p className="text-gray-900 text-2xl">{trips.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Bus className="w-6 h-6 text-[#2563EB]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Scheduled</p>
                <p className="text-gray-900 text-2xl">
                  {trips.filter((t) => t.status === 'scheduled').length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-[#2563EB]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Active</p>
                <p className="text-gray-900 text-2xl">
                  {trips.filter((t) => t.status === 'active').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <PlayCircle className="w-6 h-6 text-[#10B981]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
                <p className="text-gray-900 text-2xl">
                  ₫
                  {(
                    trips.reduce((acc, t) => acc + t.basePrice * t.seatsBooked, 0) / 1000000
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

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex gap-2 p-4 border-b border-gray-200">
            {[
              { value: 'all', label: 'All Trips' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'active', label: 'Active' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterStatus === filter.value
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Trips Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Route</th>
                  <th className="px-6 py-3 text-left text-gray-700">Bus</th>
                  <th className="px-6 py-3 text-left text-gray-700">Departure</th>
                  <th className="px-6 py-3 text-left text-gray-700">Arrival</th>
                  <th className="px-6 py-3 text-left text-gray-700">Price</th>
                  <th className="px-6 py-3 text-left text-gray-700">Occupancy</th>
                  <th className="px-6 py-3 text-left text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTrips.map((trip) => {
                  const occupancyPercentage = (trip.seatsBooked / trip.totalSeats) * 100;
                  return (
                    <tr key={trip.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="text-gray-900">{trip.routeName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600 text-sm">{trip.busInfo}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-900">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(trip.departureTime).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {new Date(trip.departureTime).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-900">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(trip.arrivalTime).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {new Date(trip.arrivalTime).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900">₫{trip.basePrice.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900">
                              {trip.seatsBooked}/{trip.totalSeats}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                occupancyPercentage >= 80
                                  ? 'bg-red-500'
                                  : occupancyPercentage >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${occupancyPercentage}%` }}
                            ></div>
                          </div>
                          <span
                            className={`text-sm ${getOccupancyColor(occupancyPercentage)}`}
                          >
                            {occupancyPercentage.toFixed(0)}% full
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(trip.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/trips/${trip.id}`)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleOpenModal(trip)}
                            className="p-2 text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(trip.id)}
                            className="p-2 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-gray-900">
                  {editingTrip ? 'Edit Trip' : 'Schedule New Trip'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Route & Bus */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Route <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.routeId}
                        onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        required
                      >
                        <option value="">Select Route</option>
                        {routes.map((route) => (
                          <option key={route.id} value={route.id}>
                            {route.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">
                        Bus <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.busId}
                        onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        required
                      >
                        <option value="">Select Bus</option>
                        {buses.map((bus) => (
                          <option key={bus.id} value={bus.id}>
                            {bus.info}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Departure & Arrival Times */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Departure Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.departureTime.slice(0, 16)}
                        onChange={(e) =>
                          setFormData({ ...formData, departureTime: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">
                        Arrival Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.arrivalTime.slice(0, 16)}
                        onChange={(e) =>
                          setFormData({ ...formData, arrivalTime: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        required
                      />
                    </div>
                  </div>

                  {/* Price & Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Base Price (VND) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.basePrice}
                        onChange={(e) =>
                          setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        min="0"
                        step="1000"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as 'scheduled' | 'active' | 'completed' | 'cancelled',
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors shadow-md"
                  >
                    {editingTrip ? 'Update Trip' : 'Schedule Trip'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
