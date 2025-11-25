import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface Route {
  id: string;
  origin: string;
  destination: string;
  distance: number;
  duration: string;
  status: 'active' | 'inactive';
}

export default function RouteManagementPage() {
  const [routes, setRoutes] = useState<Route[]>([
    {
      id: '1',
      origin: 'Ho Chi Minh City',
      destination: 'Da Lat',
      distance: 308,
      duration: '6h 30m',
      status: 'active',
    },
    {
      id: '2',
      origin: 'Hanoi',
      destination: 'Ha Long Bay',
      distance: 165,
      duration: '3h 45m',
      status: 'active',
    },
    {
      id: '3',
      origin: 'Da Nang',
      destination: 'Hue',
      distance: 102,
      duration: '2h 30m',
      status: 'active',
    },
    {
      id: '4',
      origin: 'Ho Chi Minh City',
      destination: 'Nha Trang',
      distance: 448,
      duration: '8h 15m',
      status: 'inactive',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    distance: 0,
    duration: '',
    status: 'active' as 'active' | 'inactive',
  });

  const cities = [
    'Ho Chi Minh City',
    'Hanoi',
    'Da Nang',
    'Da Lat',
    'Nha Trang',
    'Can Tho',
    'Hue',
    'Vung Tau',
    'Ha Long Bay',
    'Sapa',
    'Phu Quoc',
  ];

  const handleOpenModal = (route?: Route) => {
    if (route) {
      setEditingRoute(route);
      setFormData({
        origin: route.origin,
        destination: route.destination,
        distance: route.distance,
        duration: route.duration,
        status: route.status,
      });
    } else {
      setEditingRoute(null);
      setFormData({
        origin: '',
        destination: '',
        distance: 0,
        duration: '',
        status: 'active',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRoute(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRoute) {
      setRoutes(
        routes.map((route) =>
          route.id === editingRoute.id ? { ...route, ...formData } : route
        )
      );
    } else {
      const newRoute: Route = {
        id: Date.now().toString(),
        ...formData,
      };
      setRoutes([...routes, newRoute]);
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      setRoutes(routes.filter((route) => route.id !== id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[#10B981] text-white';
      case 'inactive':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-300 text-gray-700';
    }
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-gray-900">Route Management</h1>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#2563EB] text-white px-6 py-3 rounded-md hover:bg-[#1d4ed8] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Route
          </button>
        </div>

        {/* Routes Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Origin</th>
                  <th className="px-6 py-3 text-left text-gray-700">Destination</th>
                  <th className="px-6 py-3 text-left text-gray-700">Distance</th>
                  <th className="px-6 py-3 text-left text-gray-700">Duration</th>
                  <th className="px-6 py-3 text-left text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {routes.map((route) => (
                  <tr key={route.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">{route.origin}</td>
                    <td className="px-6 py-4 text-gray-900">{route.destination}</td>
                    <td className="px-6 py-4 text-gray-900">{route.distance} km</td>
                    <td className="px-6 py-4 text-gray-900">{route.duration}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                          route.status
                        )}`}
                      >
                        {route.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(route)}
                          className="text-[#2563EB] hover:text-[#1d4ed8] transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(route.id)}
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
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-gray-900">
                  {editingRoute ? 'Edit Route' : 'Add New Route'}
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
                      <label className="block text-gray-700 mb-2">Origin</label>
                      <select
                        value={formData.origin}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        required
                      >
                        <option value="">Select origin</option>
                        {cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Destination</label>
                      <select
                        value={formData.destination}
                        onChange={(e) =>
                          setFormData({ ...formData, destination: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        required
                      >
                        <option value="">Select destination</option>
                        {cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Distance (km)</label>
                      <input
                        type="number"
                        value={formData.distance}
                        onChange={(e) =>
                          setFormData({ ...formData, distance: parseInt(e.target.value) || 0 })
                        }
                        min="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Duration (e.g., 6h 30m)</label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="6h 30m"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as 'active' | 'inactive',
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-[#2563EB] text-white py-3 rounded-md hover:bg-[#1d4ed8] transition-colors"
                  >
                    {editingRoute ? 'Update Route' : 'Add Route'}
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
