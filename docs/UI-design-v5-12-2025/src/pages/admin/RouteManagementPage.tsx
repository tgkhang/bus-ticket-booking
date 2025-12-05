import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import {
  Plus,
  Edit,
  Trash2,
  X,
  MapPin,
  Navigation,
  Clock,
  Map as MapIcon,
  List,
  GripVertical,
  ArrowRight,
  Eye,
} from 'lucide-react';

interface Stop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  active: boolean;
}

interface RouteStop {
  id: string;
  stopId: string;
  stopName: string;
  sequence: number;
  isPickup: boolean;
  isDropoff: boolean;
  note?: string;
}

interface Route {
  id: string;
  name: string;
  operatorId: string;
  operatorName: string;
  originStopId: string;
  originStopName: string;
  destinationStopId: string;
  destinationStopName: string;
  distanceKm: number;
  estimatedMinutes: number;
  active: boolean;
  stops: RouteStop[];
}

export default function RouteManagementPage() {
  const [routes, setRoutes] = useState<Route[]>([
    {
      id: '1',
      name: 'HCMC - Da Lat Express',
      operatorId: '1',
      operatorName: 'National Express Vietnam',
      originStopId: 's1',
      originStopName: 'Ho Chi Minh City Terminal',
      destinationStopId: 's2',
      destinationStopName: 'Da Lat Bus Station',
      distanceKm: 308,
      estimatedMinutes: 390,
      active: true,
      stops: [
        { id: 'rs1', stopId: 's3', stopName: 'Bao Loc Rest Stop', sequence: 1, isPickup: false, isDropoff: false },
        { id: 'rs2', stopId: 's4', stopName: 'Di Linh Stop', sequence: 2, isPickup: true, isDropoff: true },
      ],
    },
    {
      id: '2',
      name: 'Hanoi - Ha Long Bay Route',
      operatorId: '2',
      operatorName: 'Futa Bus Lines',
      originStopId: 's5',
      originStopName: 'Hanoi My Dinh Station',
      destinationStopId: 's6',
      destinationStopName: 'Ha Long Bay Terminal',
      distanceKm: 165,
      estimatedMinutes: 225,
      active: true,
      stops: [
        { id: 'rs3', stopId: 's7', stopName: 'Hai Duong Stop', sequence: 1, isPickup: true, isDropoff: true },
      ],
    },
  ]);

  const [availableStops, setAvailableStops] = useState<Stop[]>([
    {
      id: 's1',
      name: 'Ho Chi Minh City Terminal',
      latitude: 10.7769,
      longitude: 106.7009,
      address: '395 Điện Biên Phủ, Ward 4, District 3, HCMC',
      active: true,
    },
    {
      id: 's2',
      name: 'Da Lat Bus Station',
      latitude: 11.9404,
      longitude: 108.4583,
      address: 'Tô Hiến Thành, Phường 3, Da Lat',
      active: true,
    },
    {
      id: 's3',
      name: 'Bao Loc Rest Stop',
      latitude: 11.5483,
      longitude: 107.8083,
      address: 'National Highway 20, Bao Loc',
      active: true,
    },
    {
      id: 's4',
      name: 'Di Linh Stop',
      latitude: 11.5758,
      longitude: 108.0942,
      address: 'Di Linh Town, Lam Dong',
      active: true,
    },
    {
      id: 's5',
      name: 'Hanoi My Dinh Station',
      latitude: 21.0285,
      longitude: 105.7804,
      address: 'Phạm Hùng, Mỹ Đình, Nam Từ Liêm, Hanoi',
      active: true,
    },
    {
      id: 's6',
      name: 'Ha Long Bay Terminal',
      latitude: 20.9610,
      longitude: 107.0431,
      address: 'Ha Long City, Quang Ninh',
      active: true,
    },
  ]);

  const [operators] = useState([
    { id: '1', name: 'National Express Vietnam' },
    { id: '2', name: 'Futa Bus Lines' },
    { id: '3', name: 'Mai Linh Express' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    operatorId: '',
    originStopId: '',
    destinationStopId: '',
    distanceKm: 0,
    estimatedMinutes: 0,
    active: true,
    stops: [] as RouteStop[],
  });

  const handleOpenModal = (route?: Route) => {
    if (route) {
      setEditingRoute(route);
      setFormData({
        name: route.name,
        operatorId: route.operatorId,
        originStopId: route.originStopId,
        destinationStopId: route.destinationStopId,
        distanceKm: route.distanceKm,
        estimatedMinutes: route.estimatedMinutes,
        active: route.active,
        stops: route.stops,
      });
    } else {
      setEditingRoute(null);
      setFormData({
        name: '',
        operatorId: '',
        originStopId: '',
        destinationStopId: '',
        distanceKm: 0,
        estimatedMinutes: 0,
        active: true,
        stops: [],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRoute(null);
  };

  const handleAddStop = () => {
    const newStop: RouteStop = {
      id: `rs_${Date.now()}`,
      stopId: '',
      stopName: '',
      sequence: formData.stops.length + 1,
      isPickup: true,
      isDropoff: true,
    };
    setFormData({ ...formData, stops: [...formData.stops, newStop] });
  };

  const handleRemoveStop = (index: number) => {
    const newStops = formData.stops.filter((_, i) => i !== index);
    // Resequence
    const resequenced = newStops.map((stop, i) => ({ ...stop, sequence: i + 1 }));
    setFormData({ ...formData, stops: resequenced });
  };

  const handleStopChange = (index: number, field: string, value: any) => {
    const newStops = [...formData.stops];
    if (field === 'stopId') {
      const stop = availableStops.find((s) => s.id === value);
      newStops[index] = { ...newStops[index], stopId: value, stopName: stop?.name || '' };
    } else {
      newStops[index] = { ...newStops[index], [field]: value };
    }
    setFormData({ ...formData, stops: newStops });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const originStop = availableStops.find((s) => s.id === formData.originStopId);
    const destStop = availableStops.find((s) => s.id === formData.destinationStopId);
    const operator = operators.find((o) => o.id === formData.operatorId);

    if (editingRoute) {
      setRoutes(
        routes.map((route) =>
          route.id === editingRoute.id
            ? {
                ...route,
                ...formData,
                originStopName: originStop?.name || '',
                destinationStopName: destStop?.name || '',
                operatorName: operator?.name || '',
              }
            : route
        )
      );
    } else {
      const newRoute: Route = {
        id: Date.now().toString(),
        ...formData,
        originStopName: originStop?.name || '',
        destinationStopName: destStop?.name || '',
        operatorName: operator?.name || '',
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

  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-gray-900 mb-2">Route Management</h1>
            <p className="text-gray-600">Manage routes, stops, and journey details</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-[#2563EB] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white text-[#2563EB] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MapIcon className="w-4 h-4" />
                Map
              </button>
            </div>

            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-[#2563EB] text-white px-6 py-3 rounded-lg hover:bg-[#1d4ed8] transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              Add Route
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Routes</p>
                <p className="text-gray-900 text-2xl">{routes.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Navigation className="w-6 h-6 text-[#2563EB]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Active Routes</p>
                <p className="text-gray-900 text-2xl">
                  {routes.filter((r) => r.active).length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <MapIcon className="w-6 h-6 text-[#10B981]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Stops</p>
                <p className="text-gray-900 text-2xl">{availableStops.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Avg. Distance</p>
                <p className="text-gray-900 text-2xl">
                  {Math.round(routes.reduce((acc, r) => acc + r.distanceKm, 0) / routes.length)} km
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Navigation className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          <div className="bg-white rounded-lg shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-700">Route Name</th>
                    <th className="px-6 py-3 text-left text-gray-700">Operator</th>
                    <th className="px-6 py-3 text-left text-gray-700">Origin → Destination</th>
                    <th className="px-6 py-3 text-left text-gray-700">Stops</th>
                    <th className="px-6 py-3 text-left text-gray-700">Distance</th>
                    <th className="px-6 py-3 text-left text-gray-700">Duration</th>
                    <th className="px-6 py-3 text-left text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {routes.map((route) => (
                    <tr key={route.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="text-gray-900">{route.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{route.operatorName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <span className="text-gray-900">{route.originStopName}</span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <MapPin className="w-4 h-4 text-red-600" />
                          <span className="text-gray-900">{route.destinationStopName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {route.stops.length} stops
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900">{route.distanceKm} km</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-900">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {Math.floor(route.estimatedMinutes / 60)}h{' '}
                          {route.estimatedMinutes % 60}m
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {route.active ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/routes/${route.id}`)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setSelectedRoute(route)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View on Map"
                          >
                            <MapIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleOpenModal(route)}
                            className="p-2 text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(route.id)}
                            className="p-2 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
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
        ) : (
          /* Map View */
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <MapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">Interactive Map View</h3>
                <p className="text-gray-600 mb-4">
                  Map integration with route visualization would be displayed here
                </p>
                <p className="text-sm text-gray-500">
                  {selectedRoute
                    ? `Showing: ${selectedRoute.name}`
                    : 'Select a route to view on map'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                <h2 className="text-gray-900">
                  {editingRoute ? 'Edit Route' : 'Add New Route'}
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
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Route Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        placeholder="e.g., HCMC - Da Lat Express"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">
                        Operator <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.operatorId}
                        onChange={(e) => setFormData({ ...formData, operatorId: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        required
                      >
                        <option value="">Select Operator</option>
                        {operators.map((op) => (
                          <option key={op.id} value={op.id}>
                            {op.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Origin & Destination */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Origin Stop <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.originStopId}
                        onChange={(e) =>
                          setFormData({ ...formData, originStopId: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        required
                      >
                        <option value="">Select Origin</option>
                        {availableStops.map((stop) => (
                          <option key={stop.id} value={stop.id}>
                            {stop.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">
                        Destination Stop <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.destinationStopId}
                        onChange={(e) =>
                          setFormData({ ...formData, destinationStopId: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        required
                      >
                        <option value="">Select Destination</option>
                        {availableStops.map((stop) => (
                          <option key={stop.id} value={stop.id}>
                            {stop.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Distance & Duration */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Distance (km) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.distanceKm}
                        onChange={(e) =>
                          setFormData({ ...formData, distanceKm: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        min="0"
                        step="0.1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">
                        Estimated Duration (minutes) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.estimatedMinutes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            estimatedMinutes: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Status</label>
                      <select
                        value={formData.active ? 'active' : 'inactive'}
                        onChange={(e) =>
                          setFormData({ ...formData, active: e.target.value === 'active' })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Intermediate Stops */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-gray-700">Intermediate Stops</label>
                      <button
                        type="button"
                        onClick={handleAddStop}
                        className="flex items-center gap-2 text-[#2563EB] hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Stop
                      </button>
                    </div>

                    {formData.stops.length === 0 ? (
                      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No intermediate stops added yet</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Click "Add Stop" to add stops along the route
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formData.stops.map((stop, index) => (
                          <div
                            key={stop.id}
                            className="border border-gray-300 rounded-lg p-4 bg-gray-50"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex items-center gap-2 mt-3">
                                <GripVertical className="w-5 h-5 text-gray-400" />
                                <span className="bg-[#2563EB] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
                                  {stop.sequence}
                                </span>
                              </div>

                              <div className="flex-1 grid grid-cols-4 gap-3">
                                <div className="col-span-2">
                                  <select
                                    value={stop.stopId}
                                    onChange={(e) =>
                                      handleStopChange(index, 'stopId', e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                                    required
                                  >
                                    <option value="">Select Stop</option>
                                    {availableStops.map((s) => (
                                      <option key={s.id} value={s.id}>
                                        {s.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="flex items-center gap-3">
                                  <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                      type="checkbox"
                                      checked={stop.isPickup}
                                      onChange={(e) =>
                                        handleStopChange(index, 'isPickup', e.target.checked)
                                      }
                                      className="w-4 h-4 text-[#2563EB] rounded focus:ring-[#2563EB]"
                                    />
                                    Pickup
                                  </label>
                                  <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                      type="checkbox"
                                      checked={stop.isDropoff}
                                      onChange={(e) =>
                                        handleStopChange(index, 'isDropoff', e.target.checked)
                                      }
                                      className="w-4 h-4 text-[#2563EB] rounded focus:ring-[#2563EB]"
                                    />
                                    Drop-off
                                  </label>
                                </div>

                                <div className="flex items-center justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveStop(index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                    {editingRoute ? 'Update Route' : 'Create Route'}
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