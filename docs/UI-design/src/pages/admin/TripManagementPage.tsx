import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Plus, Edit, Trash2, X, Filter } from 'lucide-react';

interface Trip {
  id: string;
  routeId: string;
  route: string;
  busId: string;
  bus: string;
  date: string;
  departure: string;
  arrival: string;
  price: number;
  seatsAvailable: number;
  totalSeats: number;
  status: 'active' | 'cancelled' | 'completed';
}

export default function TripManagementPage() {
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: '1',
      routeId: '1',
      route: 'HCMC → Da Lat',
      busId: '1',
      bus: '59A-12345 (Mercedes)',
      date: '2024-12-15',
      departure: '11:59pm',
      arrival: '6:30am',
      price: 350000,
      seatsAvailable: 12,
      totalSeats: 45,
      status: 'active',
    },
    {
      id: '2',
      routeId: '2',
      route: 'Hanoi → Ha Long',
      busId: '2',
      bus: '51B-67890 (Hyundai)',
      date: '2024-12-16',
      departure: '9:00am',
      arrival: '12:45pm',
      price: 180000,
      seatsAvailable: 8,
      totalSeats: 40,
      status: 'active',
    },
    {
      id: '3',
      routeId: '3',
      route: 'Da Nang → Hue',
      busId: '3',
      bus: '29C-11111 (Thaco)',
      date: '2024-12-14',
      departure: '2:30pm',
      arrival: '5:00pm',
      price: 120000,
      seatsAvailable: 0,
      totalSeats: 35,
      status: 'completed',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [formData, setFormData] = useState({
    routeId: '',
    route: '',
    busId: '',
    bus: '',
    date: '',
    departure: '',
    arrival: '',
    price: 0,
    totalSeats: 0,
    status: 'active' as 'active' | 'cancelled' | 'completed',
  });

  const [filters, setFilters] = useState({
    date: '',
    route: '',
  });

  const routes = [
    { id: '1', name: 'HCMC → Da Lat' },
    { id: '2', name: 'Hanoi → Ha Long' },
    { id: '3', name: 'Da Nang → Hue' },
    { id: '4', name: 'HCMC → Nha Trang' },
  ];

  const buses = [
    { id: '1', name: '59A-12345 (Mercedes)', seats: 45 },
    { id: '2', name: '51B-67890 (Hyundai)', seats: 40 },
    { id: '3', name: '29C-11111 (Thaco)', seats: 35 },
  ];

  const handleOpenModal = (trip?: Trip) => {
    if (trip) {
      setEditingTrip(trip);
      setFormData({
        routeId: trip.routeId,
        route: trip.route,
        busId: trip.busId,
        bus: trip.bus,
        date: trip.date,
        departure: trip.departure,
        arrival: trip.arrival,
        price: trip.price,
        totalSeats: trip.totalSeats,
        status: trip.status,
      });
    } else {
      setEditingTrip(null);
      setFormData({
        routeId: '',
        route: '',
        busId: '',
        bus: '',
        date: '',
        departure: '',
        arrival: '',
        price: 0,
        totalSeats: 0,
        status: 'active',
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

    if (editingTrip) {
      setTrips(
        trips.map((trip) =>
          trip.id === editingTrip.id
            ? { ...trip, ...formData, seatsAvailable: formData.totalSeats }
            : trip
        )
      );
    } else {
      const newTrip: Trip = {
        id: Date.now().toString(),
        ...formData,
        seatsAvailable: formData.totalSeats,
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

  const handleRouteChange = (routeId: string) => {
    const route = routes.find((r) => r.id === routeId);
    if (route) {
      setFormData({ ...formData, routeId, route: route.name });
    }
  };

  const handleBusChange = (busId: string) => {
    const bus = buses.find((b) => b.id === busId);
    if (bus) {
      setFormData({ ...formData, busId, bus: bus.name, totalSeats: bus.seats });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[#10B981] text-white';
      case 'cancelled':
        return 'bg-[#EF4444] text-white';
      case 'completed':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-300 text-gray-700';
    }
  };

  const filteredTrips = trips.filter((trip) => {
    if (filters.date && trip.date !== filters.date) return false;
    if (filters.route && !trip.route.toLowerCase().includes(filters.route.toLowerCase()))
      return false;
    return true;
  });

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-gray-900">Trip Management</h1>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#2563EB] text-white px-6 py-3 rounded-md hover:bg-[#1d4ed8] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Trip
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-gray-900">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Route</label>
              <input
                type="text"
                value={filters.route}
                onChange={(e) => setFilters({ ...filters, route: e.target.value })}
                placeholder="Search route..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Trips Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Route</th>
                  <th className="px-6 py-3 text-left text-gray-700">Bus</th>
                  <th className="px-6 py-3 text-left text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-gray-700">Departure</th>
                  <th className="px-6 py-3 text-left text-gray-700">Price</th>
                  <th className="px-6 py-3 text-left text-gray-700">Seats</th>
                  <th className="px-6 py-3 text-left text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">{trip.route}</td>
                    <td className="px-6 py-4 text-gray-900">{trip.bus}</td>
                    <td className="px-6 py-4 text-gray-900">{trip.date}</td>
                    <td className="px-6 py-4 text-gray-900">{trip.departure}</td>
                    <td className="px-6 py-4 text-gray-900">₫{trip.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-900">
                      {trip.seatsAvailable}/{trip.totalSeats}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                          trip.status
                        )}`}
                      >
                        {trip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(trip)}
                          className="text-[#2563EB] hover:text-[#1d4ed8] transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(trip.id)}
                          className="text-[#EF4444] hover:text-[#dc2626] transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-gray-900">
                  {editingTrip ? 'Edit Trip' : 'Create New Trip'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Route</label>
                      <select
                        value={formData.routeId}
                        onChange={(e) => handleRouteChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        required
                      >
                        <option value="">Select route</option>
                        {routes.map((route) => (
                          <option key={route.id} value={route.id}>
                            {route.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Bus</label>
                      <select
                        value={formData.busId}
                        onChange={(e) => handleBusChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        required
                      >
                        <option value="">Select bus</option>
                        {buses.map((bus) => (
                          <option key={bus.id} value={bus.id}>
                            {bus.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Departure Time</label>
                      <input
                        type="time"
                        value={formData.departure}
                        onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Arrival Time</label>
                      <input
                        type="time"
                        value={formData.arrival}
                        onChange={(e) => setFormData({ ...formData, arrival: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Price (₫)</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: parseInt(e.target.value) || 0 })
                        }
                        min="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as 'active' | 'cancelled' | 'completed',
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                      >
                        <option value="active">Active</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-[#2563EB] text-white py-3 rounded-md hover:bg-[#1d4ed8] transition-colors"
                  >
                    {editingTrip ? 'Update Trip' : 'Create Trip'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
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
