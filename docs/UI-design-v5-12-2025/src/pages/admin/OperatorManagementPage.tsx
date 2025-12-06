import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Plus, Edit, Trash2, X, CheckCircle, XCircle, Clock, Mail, Phone, Building } from 'lucide-react';

interface Operator {
  id: string;
  name: string;
  contact_email: string;
  contact_phone: string | null;
  status: 'pending' | 'approved' | 'suspended';
  approved_at: string | null;
  routes_count: number;
  buses_count: number;
}

export default function OperatorManagementPage() {
  const [operators, setOperators] = useState<Operator[]>([
    {
      id: '1',
      name: 'National Express Vietnam',
      contact_email: 'contact@nationalexpress.vn',
      contact_phone: '+84 123 456 789',
      status: 'approved',
      approved_at: '2024-01-15T10:30:00Z',
      routes_count: 12,
      buses_count: 25,
    },
    {
      id: '2',
      name: 'Futa Bus Lines',
      contact_email: 'info@futabus.vn',
      contact_phone: '+84 987 654 321',
      status: 'approved',
      approved_at: '2024-02-20T14:20:00Z',
      routes_count: 8,
      buses_count: 18,
    },
    {
      id: '3',
      name: 'Mai Linh Express',
      contact_email: 'support@mailinh.vn',
      contact_phone: '+84 456 789 012',
      status: 'pending',
      approved_at: null,
      routes_count: 0,
      buses_count: 5,
    },
    {
      id: '4',
      name: 'Phuong Trang (Futa)',
      contact_email: 'contact@phuongtrang.vn',
      contact_phone: '+84 345 678 901',
      status: 'suspended',
      approved_at: '2024-03-10T09:15:00Z',
      routes_count: 6,
      buses_count: 12,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_email: '',
    contact_phone: '',
    status: 'pending' as 'pending' | 'approved' | 'suspended',
  });

  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleOpenModal = (operator?: Operator) => {
    if (operator) {
      setEditingOperator(operator);
      setFormData({
        name: operator.name,
        contact_email: operator.contact_email,
        contact_phone: operator.contact_phone || '',
        status: operator.status,
      });
    } else {
      setEditingOperator(null);
      setFormData({
        name: '',
        contact_email: '',
        contact_phone: '',
        status: 'pending',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingOperator(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingOperator) {
      setOperators(
        operators.map((op) =>
          op.id === editingOperator.id
            ? {
                ...op,
                ...formData,
                approved_at:
                  formData.status === 'approved' && !op.approved_at
                    ? new Date().toISOString()
                    : op.approved_at,
              }
            : op
        )
      );
    } else {
      const newOperator: Operator = {
        id: Date.now().toString(),
        ...formData,
        contact_phone: formData.contact_phone || null,
        approved_at: formData.status === 'approved' ? new Date().toISOString() : null,
        routes_count: 0,
        buses_count: 0,
      };
      setOperators([...operators, newOperator]);
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this operator?')) {
      setOperators(operators.filter((op) => op.id !== id));
    }
  };

  const handleStatusChange = (id: string, newStatus: 'approved' | 'suspended') => {
    setOperators(
      operators.map((op) =>
        op.id === id
          ? {
              ...op,
              status: newStatus,
              approved_at: newStatus === 'approved' && !op.approved_at ? new Date().toISOString() : op.approved_at,
            }
          : op
      )
    );
  };

  const filteredOperators = operators.filter(
    (op) => filterStatus === 'all' || op.status === filterStatus
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
            <CheckCircle className="w-4 h-4" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm">
            <Clock className="w-4 h-4" />
            Pending
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">
            <XCircle className="w-4 h-4" />
            Suspended
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
            <h1 className="text-gray-900 mb-2">Operator Management</h1>
            <p className="text-gray-600">Manage bus operators and their permissions</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#2563EB] text-white px-6 py-3 rounded-lg hover:bg-[#1d4ed8] transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add Operator
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Operators</p>
                <p className="text-gray-900 text-2xl">{operators.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Building className="w-6 h-6 text-[#2563EB]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Approved</p>
                <p className="text-gray-900 text-2xl">
                  {operators.filter((op) => op.status === 'approved').length}
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
                  {operators.filter((op) => op.status === 'pending').length}
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
                <p className="text-gray-600 text-sm mb-1">Suspended</p>
                <p className="text-gray-900 text-2xl">
                  {operators.filter((op) => op.status === 'suspended').length}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="w-6 h-6 text-[#EF4444]" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex gap-2 p-4 border-b border-gray-200">
            {[
              { value: 'all', label: 'All Operators' },
              { value: 'approved', label: 'Approved' },
              { value: 'pending', label: 'Pending' },
              { value: 'suspended', label: 'Suspended' },
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

          {/* Operators Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Operator Name</th>
                  <th className="px-6 py-3 text-left text-gray-700">Contact</th>
                  <th className="px-6 py-3 text-left text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-gray-700">Routes/Buses</th>
                  <th className="px-6 py-3 text-left text-gray-700">Approved Date</th>
                  <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOperators.map((operator) => (
                  <tr key={operator.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Building className="w-5 h-5 text-[#2563EB]" />
                        </div>
                        <span className="text-gray-900">{operator.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {operator.contact_email}
                        </div>
                        {operator.contact_phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {operator.contact_phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(operator.status)}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {operator.routes_count} routes / {operator.buses_count} buses
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {operator.approved_at
                          ? new Date(operator.approved_at).toLocaleDateString()
                          : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {operator.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(operator.id, 'approved')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {operator.status === 'approved' && (
                          <button
                            onClick={() => handleStatusChange(operator.id, 'suspended')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Suspend"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                        {operator.status === 'suspended' && (
                          <button
                            onClick={() => handleStatusChange(operator.id, 'approved')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Reactivate"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenModal(operator)}
                          className="p-2 text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(operator.id)}
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

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-gray-900">
                  {editingOperator ? 'Edit Operator' : 'Add New Operator'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Operator Name */}
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Operator Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                      placeholder="e.g., National Express Vietnam"
                      required
                    />
                  </div>

                  {/* Contact Email */}
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Contact Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                      placeholder="contact@operator.com"
                      required
                    />
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <label className="block text-gray-700 mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                      placeholder="+84 123 456 789"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as 'pending' | 'approved' | 'suspended',
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                {/* Modal Footer */}
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
                    {editingOperator ? 'Update Operator' : 'Add Operator'}
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
