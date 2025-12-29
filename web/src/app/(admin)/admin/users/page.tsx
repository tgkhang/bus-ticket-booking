/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useEffect, useState } from 'react'
import type { User } from '@/types/user'
import { fetchUsers, createUser, updateUser, deleteUser, toggleUserStatus } from '@/lib/api/user'
import { toast } from 'sonner'
import {
  Plus,
  Edit,
  Trash2,
  X,
  Users,
  CheckCircle,
  Shield,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  LogIn,
  Ticket,
  Search,
} from 'lucide-react'
import { ITEMS_PER_PAGE } from '@/utils/constants'
import { listOperatorsAPI } from '@/lib/api'
import type { Operator } from '@/types/operator'

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'client', label: 'Clients' },
  { value: 'operator', label: 'Operators' },
  { value: 'admin', label: 'Admins' },
]
const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
]

function RoleBadge({ role }: { role: string }) {
  const lower = role.toLowerCase()
  if (lower === 'admin')
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
        <Shield className="w-3.5 h-3.5" />
        Admin
      </span>
    )
  if (lower === 'operator')
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
        <UserIcon className="w-3.5 h-3.5" />
        Operator
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded-full text-xs font-medium">
      <Users className="w-3.5 h-3.5" />
      Client
    </span>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
      <CheckCircle className="w-3.5 h-3.5" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
      <X className="w-3.5 h-3.5" />
      Inactive
    </span>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [operators, setOperators] = useState<Operator[]>([])
  const [loadingOperators, setLoadingOperators] = useState(false)

  const [showAddEdit, setShowAddEdit] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [detailUser, setDetailUser] = useState<User | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<User | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const filtered = users.filter((u) => (status ? (u.isActive ? 'Active' : 'Inactive') === status : true))
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const currentUsers = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const [form, setForm] = useState<{
    displayName: string
    username: string
    email: string
    password: string
    role: 'client' | 'operator' | 'admin'
    active: boolean
    operatorId: string
  }>({
    displayName: '',
    username: '',
    email: '',
    password: '',
    role: 'client',
    active: true,
    operatorId: '',
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [search, roleFilter, status])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await fetchUsers({ search, role: roleFilter || undefined })
        setUsers(data.users || data)
      } catch (err: any) {
        toast.error(err?.message || 'Failed to load users')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [search, roleFilter])

  useEffect(() => {
    const loadOperators = async () => {
      setLoadingOperators(true)
      try {
        const response = await listOperatorsAPI({ status: 'approved' }, { page: 1, limit: 100 })
        setOperators(response.data)
      } catch (err: any) {
        console.error('Failed to load operators:', err)
      } finally {
        setLoadingOperators(false)
      }
    }
    loadOperators()
  }, [])

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    admins: users.filter((u) => u.role === 'admin').length,
    operators: users.filter((u) => u.role === 'operator').length,
  }

  const openAdd = () => {
    setEditingUser(null)
    setForm({ displayName: '', username: '', email: '', password: '', role: 'client', active: true, operatorId: '' })
    setShowAddEdit(true)
  }

  const openEdit = (user: User) => {
    setEditingUser(user)
    setForm({
      displayName: user.displayName,
      username: user.username,
      email: user.email,
      password: '',
      role: user.role as any,
      active: user.isActive,
      operatorId: (user as any).operatorId || '',
    })
    setShowAddEdit(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser && !form.password) return toast.error('Password required')

    // Validate operator selection for operator role
    if (form.role === 'operator' && !form.operatorId) {
      return toast.error('Please select an operator company for operator users')
    }

    try {
      const payload: any = {
        displayName: form.displayName,
        username: form.username,
        email: form.email,
        role: form.role,
        isActive: form.active,
      }
      if (form.password) payload.password = form.password

      // Add operatorId only if role is operator
      if (form.role === 'operator' && form.operatorId) {
        payload.operatorId = form.operatorId
      }

      console.log('Submitting payload:', payload)
      console.log('Edit mode:', !!editingUser, 'User ID:', editingUser?.id)

      if (editingUser) {
        const updated = await updateUser(editingUser.id, payload)
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updated : u)))
        toast.success('User updated')
      } else {
        const created = await createUser(payload)
        setUsers((prev) => [...prev, created])
        toast.success('User created')
      }
      setShowAddEdit(false)
    } catch (err: any) {
      console.error('Submit error:', err)
      console.error('Response data:', err?.response?.data)
      toast.error(err?.response?.data?.message || 'Save failed')
    }
  }

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = !user.isActive
      console.log('Toggling status for user:', user.id, 'to:', newStatus)
      await toggleUserStatus(user.id, newStatus)
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: newStatus } : u)))
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`)
    } catch (err: any) {
      console.error('Toggle status error:', err)
      console.error('Response data:', err?.response?.data)
      toast.error(err?.response?.data?.message || 'Failed to toggle user status')
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog) return
    try {
      await deleteUser(deleteDialog.id)
      setUsers((prev) => prev.filter((u) => u.id !== deleteDialog.id))
      toast.success('User deleted')
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleteDialog(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all users, roles, and permissions</p>
        </div>
        <Button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-5 h-5" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: 'blue' },
          { label: 'Active Users', value: stats.active, icon: CheckCircle, color: 'green' },
          { label: 'Admins', value: stats.admins, icon: Shield, color: 'purple' },
          { label: 'Operators', value: stats.operators, icon: UserIcon, color: 'yellow' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email, username, or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-w-[140px]"
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-w-[140px]"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">Loading users...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      Auth Type
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            {user.avatar ? (
                              <AvatarImage src={user.avatar} />
                            ) : (
                              <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{user.displayName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-[200px] truncate"
                        title={user.email}
                      >
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge active={user.isActive} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {user.googleId ? 'Google OAuth' : 'Email/Password'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-center">
                        {user.bookingCount ?? '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setDetailUser(user)
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleStatus(user)
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive ? (
                              <UserX className="w-4 h-4 text-red-600" />
                            ) : (
                              <UserCheck className="w-4 h-4 text-green-600" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openEdit(user)
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteDialog(user)
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} users
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page = i + 1
                  if (currentPage > 3 && totalPages > 5) page = currentPage - 2 + i
                  if (page > totalPages) return null
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        currentPage === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={!!detailUser} onOpenChange={() => setDetailUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {detailUser && (
            <div className="py-4">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-20 h-20">
                  {detailUser.avatar ? (
                    <AvatarImage src={detailUser.avatar} />
                  ) : (
                    <AvatarFallback className="text-2xl">{detailUser.displayName[0]}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold">{detailUser.displayName}</h3>
                  <p className="text-gray-500">@{detailUser.username}</p>
                </div>
              </div>
              <hr className="my-4" />
              <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-sm mb-6">
                <div>
                  <p className="text-gray-500 flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4" /> Email
                  </p>
                  <p className="font-medium">{detailUser.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Role</p>
                  <RoleBadge role={detailUser.role} />
                </div>
                <div>
                  <p className="text-gray-500 flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4" /> Status
                  </p>
                  <StatusBadge active={detailUser.isActive} />
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Authentication</p>
                  <p className="font-medium">{detailUser.googleId ? 'Google OAuth' : 'Email/Password'}</p>
                </div>
                <div>
                  <p className="text-gray-500 flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4" /> Member Since
                  </p>
                  <p className="font-medium">{new Date(detailUser.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 flex items-center gap-2 mb-1">
                    <LogIn className="w-4 h-4" /> Last Login
                  </p>
                  <p className="font-medium">
                    {detailUser.lastLogin ? new Date(detailUser.lastLogin).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div className="col-span-2 mt-2">
                  <p className="text-gray-500 flex items-center gap-2 mb-1">
                    <Ticket className="w-4 h-4" /> Total Bookings
                  </p>
                  <p className="text-3xl font-bold">{detailUser.bookingCount ?? 0}</p>
                </div>
              </div>
              <hr className="my-4" />
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setDetailUser(null)}>
                  Close
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    openEdit(detailUser)
                    setDetailUser(null)
                  }}
                >
                  Edit User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Modal & Delete Dialog */}
      {showAddEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-2xl font-bold">{editingUser ? 'Edit User' : 'Add New User'}</h2>
              <button
                onClick={() => setShowAddEdit(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                type="button"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Display Name</label>
                  <input
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800"
                  />
                </div>
                {/* Only show password field when adding a user */}
                {!editingUser && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800"
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={form.role}
                    onChange={(e) => {
                      const newRole = e.target.value as 'client' | 'operator' | 'admin'
                      setForm({ ...form, role: newRole, operatorId: newRole === 'operator' ? form.operatorId : '' })
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800"
                  >
                    <option value="client">Client</option>
                    <option value="operator">Operator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={form.active ? 'Active' : 'Inactive'}
                    onChange={(e) => setForm({ ...form, active: e.target.value === 'Active' })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              {/* Operator Company Selection - Only visible when role is operator */}
              {form.role === 'operator' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Operator Company <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={form.operatorId}
                    onChange={(e) => setForm({ ...form, operatorId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800"
                    disabled={loadingOperators}
                  >
                    <option value="">Select an operator company</option>
                    {operators.map((operator) => (
                      <option key={operator.id} value={operator.id}>
                        {operator.name} - {operator.contactEmail}
                      </option>
                    ))}
                  </select>
                  {loadingOperators && <p className="text-sm text-gray-500 mt-2">Loading operators...</p>}
                  {!loadingOperators && operators.length === 0 && (
                    <p className="text-sm text-amber-600 mt-2">
                      No approved operators found. Please create an approved operator first.
                    </p>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2 border-t mt-6">
                <Button type="button" variant="outline" onClick={() => setShowAddEdit(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  {editingUser ? 'Update User' : 'Create User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteDialog?.displayName}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
