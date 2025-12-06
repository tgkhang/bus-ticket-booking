import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { Plus, Edit, Trash2, X, Wifi, Wind, Droplet, Usb, Eye, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Bus {
  id: string;
  operatorId: string;
  plateNumber: string;
  model: string;
  seatCapacity: number;
  amenities: string[];
  status: 'active' | 'inactive' | 'maintenance';
}

export default function BusManagementPage() {
  const navigate = useNavigate();
  
  // Mock data - Replace with API call
  const [buses, setBuses] = useState<Bus[]>([
    {
      id: '1',
      operatorId: 'op1',
      plateNumber: '59A-12345',
      model: 'Mercedes Sprinter',
      seatCapacity: 45,
      amenities: ['wifi', 'ac', 'usb'],
      status: 'active',
    },
    {
      id: '2',
      operatorId: 'op1',
      plateNumber: '51B-67890',
      model: 'Hyundai Universe',
      seatCapacity: 40,
      amenities: ['wifi', 'ac', 'usb', 'toilet'],
      status: 'active',
    },
    {
      id: '3',
      operatorId: 'op2',
      plateNumber: '29C-11111',
      model: 'Thaco TB120S',
      seatCapacity: 35,
      amenities: ['wifi', 'ac'],
      status: 'maintenance',
    },
    {
      id: '4',
      operatorId: 'op1',
      plateNumber: '30D-22222',
      model: 'Isuzu Samco',
      seatCapacity: 29,
      amenities: ['wifi', 'ac', 'usb'],
      status: 'active',
    },
    {
      id: '5',
      operatorId: 'op2',
      plateNumber: '31E-33333',
      model: 'Thaco Universe',
      seatCapacity: 47,
      amenities: ['wifi', 'ac', 'toilet', 'usb'],
      status: 'active',
    },
    {
      id: '6',
      operatorId: 'op3',
      plateNumber: '32F-44444',
      model: 'Hyundai County',
      seatCapacity: 25,
      amenities: ['ac'],
      status: 'inactive',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const [formData, setFormData] = useState({
    operatorId: '',
    plateNumber: '',
    model: '',
    seatCapacity: 0,
    amenities: [] as string[],
    status: 'active' as 'active' | 'inactive' | 'maintenance',
  });

  const amenityOptions = [
    { value: 'wifi', label: 'WiFi', icon: Wifi },
    { value: 'ac', label: 'AC', icon: Wind },
    { value: 'toilet', label: 'Toilet', icon: Droplet },
    { value: 'usb', label: 'USB', icon: Usb },
  ];

  const handleOpenModal = (bus?: Bus) => {
    if (bus) {
      setEditingBus(bus);
      setFormData({
        operatorId: bus.operatorId,
        plateNumber: bus.plateNumber,
        model: bus.model,
        seatCapacity: bus.seatCapacity,
        amenities: bus.amenities,
        status: bus.status,
      });
    } else {
      setEditingBus(null);
      setFormData({
        operatorId: '',
        plateNumber: '',
        model: '',
        seatCapacity: 0,
        amenities: [],
        status: 'active',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBus(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingBus) {
      setBuses(
        buses.map((bus) =>
          bus.id === editingBus.id ? { ...bus, ...formData } : bus
        )
      );
    } else {
      const newBus: Bus = {
        id: Date.now().toString(),
        ...formData,
      };
      setBuses([...buses, newBus]);
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      setBuses(buses.filter((bus) => bus.id !== id));
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter((a) => a !== amenity),
      });
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity],
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[#10B981] text-white';
      case 'inactive':
        return 'bg-gray-500 text-white';
      case 'maintenance':
        return 'bg-[#F59E0B] text-white';
      default:
        return 'bg-gray-300 text-gray-700';
    }
  };

  // Filter buses by search query
  const filteredBuses = buses.filter((bus) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      bus.plateNumber.toLowerCase().includes(query) ||
      bus.model.toLowerCase().includes(query)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredBuses.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBuses = filteredBuses.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-gray-900 mb-2">Bus Management</h1>
            <p className="text-gray-600">Manage your fleet of buses</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#2563EB] text-white px-6 py-3 rounded-lg hover:bg-[#1d4ed8] transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add New Bus
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by plate number or model..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
            />
          </div>
        </div>

        {/* Bus Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Plate Number</th>
                <th className="px-6 py-3 text-left text-gray-700">Model</th>
                <th className="px-6 py-3 text-left text-gray-700">Capacity</th>
                <th className="px-6 py-3 text-left text-gray-700">Amenities</th>
                <th className="px-6 py-3 text-left text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentBuses.map((bus) => (
                <tr key={bus.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-gray-900">{bus.plateNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900">{bus.model}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900">{bus.seatCapacity} seats</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {bus.amenities.map((amenity) => {
                        const option = amenityOptions.find((a) => a.value === amenity);
                        if (!option) return null;
                        const Icon = option.icon;
                        return (
                          <div
                            key={amenity}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                            title={option.label}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                        bus.status
                      )}`}
                    >
                      {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/admin/buses/${bus.id}`)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(bus)}
                        className="p-2 text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(bus.id)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredBuses.length)} of{' '}
                {filteredBuses.length} buses
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-[#2563EB] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-gray-900">
                  {editingBus ? 'Edit Bus' : 'Add New Bus'}
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Plate Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.plateNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, plateNumber: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        placeholder="e.g., 59A-12345"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">
                        Model <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        placeholder="e.g., Mercedes Sprinter"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Seat Capacity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.seatCapacity}
                        onChange={(e) =>
                          setFormData({ ...formData, seatCapacity: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        min="1"
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
                            status: e.target.value as 'active' | 'inactive' | 'maintenance',
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Amenities</label>
                    <div className="grid grid-cols-2 gap-3">
                      {amenityOptions.map((amenity) => {
                        const Icon = amenity.icon;
                        return (
                          <button
                            key={amenity.value}
                            type="button"
                            onClick={() => toggleAmenity(amenity.value)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                              formData.amenities.includes(amenity.value)
                                ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span>{amenity.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

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
                    {editingBus ? 'Update Bus' : 'Add Bus'}
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
