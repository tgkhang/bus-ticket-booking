import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Phone,
  Calendar,
  Eye,
  Lock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  role: 'client' | 'admin' | 'operator';
  isActive: boolean;
  isOauthUser: boolean;
  oauthProvider: string | null;
  createdAt: string;
  lastLogin: string | null;
  bookingsCount: number;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'john.doe@example.com',
      username: 'johndoe',
      displayName: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      role: 'client',
      isActive: true,
      isOauthUser: false,
      oauthProvider: null,
      createdAt: '2024-01-15T10:30:00Z',
      lastLogin: '2024-11-28T15:45:00Z',
      bookingsCount: 12,
    },
    {
      id: '2',
      email: 'admin@busbook.com',
      username: 'admin',
      displayName: 'Admin User',
      avatar: null,
      role: 'admin',
      isActive: true,
      isOauthUser: false,
      oauthProvider: null,
      createdAt: '2024-01-01T00:00:00Z',
      lastLogin: '2024-11-30T10:20:00Z',
      bookingsCount: 0,
    },
    {
      id: '3',
      email: 'operator@express.com',
      username: 'expressoperator',
      displayName: 'Express Operator',
      avatar: null,
      role: 'operator',
      isActive: true,
      isOauthUser: false,
      oauthProvider: null,
      createdAt: '2024-02-10T08:15:00Z',
      lastLogin: '2024-11-29T14:30:00Z',
      bookingsCount: 0,
    },
    {
      id: '4',
      email: 'sarah.johnson@gmail.com',
      username: 'sarahjohnson',
      displayName: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      role: 'client',
      isActive: true,
      isOauthUser: true,
      oauthProvider: 'google',
      createdAt: '2024-03-20T12:00:00Z',
      lastLogin: '2024-11-30T09:15:00Z',
      bookingsCount: 8,
    },
    {
      id: '5',
      email: 'michael.chen@example.com',
      username: 'michaelchen',
      displayName: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      role: 'client',
      isActive: false,
      isOauthUser: false,
      oauthProvider: null,
      createdAt: '2024-02-28T16:45:00Z',
      lastLogin: '2024-10-15T11:20:00Z',
      bookingsCount: 3,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    displayName: '',
    role: 'client' as 'client' | 'admin' | 'operator',
    isActive: true,
    password: '',
  });

  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        username: user.username,
        displayName: user.displayName || '',
        role: user.role,
        isActive: user.isActive,
        password: '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        username: '',
        displayName: '',
        role: 'client',
        isActive: true,
        password: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleViewDetails = (user: User) => {
    setViewingUser(user);
    setShowDetailsModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      setUsers(
        users.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                email: formData.email,
                username: formData.username,
                displayName: formData.displayName || null,
                role: formData.role,
                isActive: formData.isActive,
              }
            : user
        )
      );
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        email: formData.email,
        username: formData.username,
        displayName: formData.displayName || null,
        avatar: null,
        role: formData.role,
        isActive: formData.isActive,
        isOauthUser: false,
        oauthProvider: null,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        bookingsCount: 0,
      };
      setUsers([...users, newUser]);
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((user) => user.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setUsers(
      users.map((user) => (user.id === id ? { ...user, isActive: !user.isActive } : user))
    );
  };

  const filteredUsers = users.filter((user) => {
    if (filterRole !== 'all' && user.role !== filterRole) return false;
    if (filterStatus === 'active' && !user.isActive) return false;
    if (filterStatus === 'inactive' && user.isActive) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.email.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        user.displayName?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm">
            <Shield className="w-4 h-4" />
            Admin
          </span>
        );
      case 'operator':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
            <UserCheck className="w-4 h-4" />
            Operator
          </span>
        );
      case 'client':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
            <UserCheck className="w-4 h-4" />
            Client
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
            <h1 className="text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">Manage all users, roles, and permissions</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#2563EB] text-white px-6 py-3 rounded-lg hover:bg-[#1d4ed8] transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add User
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Users</p>
                <p className="text-gray-900 text-2xl">{users.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <UserCheck className="w-6 h-6 text-[#2563EB]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Active Users</p>
                <p className="text-gray-900 text-2xl">
                  {users.filter((u) => u.isActive).length}
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
                <p className="text-gray-600 text-sm mb-1">Admins</p>
                <p className="text-gray-900 text-2xl">
                  {users.filter((u) => u.role === 'admin').length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Operators</p>
                <p className="text-gray-900 text-2xl">
                  {users.filter((u) => u.role === 'operator').length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <UserCheck className="w-6 h-6 text-yellow-600" />
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
                    placeholder="Search by email, username, or name..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                >
                  <option value="all">All Roles</option>
                  <option value="client">Clients</option>
                  <option value="operator">Operators</option>
                  <option value="admin">Admins</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">User</th>
                  <th className="px-6 py-3 text-left text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-gray-700">Role</th>
                  <th className="px-6 py-3 text-left text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-gray-700">Auth Type</th>
                  <th className="px-6 py-3 text-left text-gray-700">Bookings</th>
                  <th className="px-6 py-3 text-left text-gray-700">Joined</th>
                  <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.displayName || user.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-600">
                              {(user.displayName || user.username).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-900">{user.displayName || user.username}</p>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">
                          <XCircle className="w-4 h-4" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.isOauthUser ? (
                        <span className="text-sm text-gray-600 capitalize">
                          {user.oauthProvider} OAuth
                        </span>
                      ) : (
                        <span className="text-sm text-gray-600">Email/Password</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{user.bookingsCount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.isActive
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="p-2 text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
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
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-gray-900">{editingUser ? 'Edit User' : 'Add New User'}</h2>
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
                    {/* Email */}
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        required
                      />
                    </div>

                    {/* Username */}
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        required
                      />
                    </div>
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="block text-gray-700 mb-2">Display Name</label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                    />
                  </div>

                  {/* Password */}
                  {!editingUser && (
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        required={!editingUser}
                        minLength={8}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {/* Role */}
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            role: e.target.value as 'client' | 'admin' | 'operator',
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                      >
                        <option value="client">Client</option>
                        <option value="operator">Operator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-gray-700 mb-2">Status</label>
                      <select
                        value={formData.isActive ? 'active' : 'inactive'}
                        onChange={(e) =>
                          setFormData({ ...formData, isActive: e.target.value === 'active' })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
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
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {showDetailsModal && viewingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-gray-900">User Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                  {viewingUser.avatar ? (
                    <img
                      src={viewingUser.avatar}
                      alt={viewingUser.displayName || viewingUser.username}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 text-2xl">
                        {(viewingUser.displayName || viewingUser.username).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-gray-900 mb-1">
                      {viewingUser.displayName || viewingUser.username}
                    </h3>
                    <p className="text-gray-600">@{viewingUser.username}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Email</p>
                      <p className="text-gray-900">{viewingUser.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Role</p>
                      <div>{getRoleBadge(viewingUser.role)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Status</p>
                      <div>
                        {viewingUser.isActive ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">
                            <XCircle className="w-4 h-4" />
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Authentication</p>
                      <p className="text-gray-900">
                        {viewingUser.isOauthUser
                          ? `${viewingUser.oauthProvider} OAuth`
                          : 'Email/Password'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Member Since</p>
                      <p className="text-gray-900">
                        {new Date(viewingUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Last Login</p>
                      <p className="text-gray-900">
                        {viewingUser.lastLogin
                          ? new Date(viewingUser.lastLogin).toLocaleDateString()
                          : 'Never'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm mb-1">Total Bookings</p>
                    <p className="text-gray-900 text-2xl">{viewingUser.bookingsCount}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleOpenModal(viewingUser);
                    }}
                    className="px-6 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors shadow-md"
                  >
                    Edit User
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
