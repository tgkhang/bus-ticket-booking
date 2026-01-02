'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { useEffect, useState } from 'react'
import type { Operator } from '@/types/operator'
import { toast } from 'sonner'
import {
  Plus,
  Edit,
  Trash2,
  X,
  Building2,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar,
  Mail,
  Phone,
  Search,
} from 'lucide-react'
import { ITEMS_PER_PAGE } from '@/utils/constants'
import * as operatorApi from '@/lib/api/operator'

// Helper function to format date
const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  } catch {
    return dateString
  }
}

const TABS = [
  { key: '', label: 'All Operators' },
  { key: 'approved', label: 'Approved' },
  { key: 'pending', label: 'Pending' },
  { key: 'suspended', label: 'Suspended' },
]

function StatusBadge({ status }: { status: Operator['status'] }) {
  const configs = {
    approved: { color: 'green', icon: CheckCircle, label: 'Approved' },
    pending: { color: 'yellow', icon: Clock, label: 'Pending' },
    suspended: { color: 'red', icon: AlertTriangle, label: 'Suspended' },
  }
  const { color, icon: Icon, label } = configs[status] || configs.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 bg-${color}-100 dark:bg-${color}-900 text-${color}-700 dark:text-${color}-300 rounded-full text-sm`}>
      <Icon className="w-4 h-4" />
      {label}
    </span>
  )
}

export default function OperatorsPage() {
  const [operators, setOperators] = useState<Operator[]>([])
  const [tab, setTab] = useState('')
  const [loading, setLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [operatorToDelete, setOperatorToDelete] = useState<Operator | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch operators from API
  const fetchOperators = async () => {
    setLoading(true)
    try {
      const params: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      }
      if (tab) {
        params.status = tab
      }
      if (searchQuery) {
        params.search = searchQuery
      }
      const response = await operatorApi.fetchOperators(params)
      setOperators(response.data || [])
      setTotalItems(response.pagination?.total || 0)
    } catch (error) {
      toast.error('Failed to load operators')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [tab, searchQuery])

  useEffect(() => {
    fetchOperators()
  }, [currentPage, tab, searchQuery])

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE

  const stats = {
    total: totalItems,
    approved: operators.filter((op) => op.status === 'approved').length, // Update with actual counts if needed
    pending: operators.filter((op) => op.status === 'pending').length,
    suspended: operators.filter((op) => op.status === 'suspended').length,
  }

  const handleOpenModal = (operator?: Operator) => {
    setEditingOperator(operator || null)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingOperator(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const payload = {
      name: formData.get('name') as string,
      contactEmail: formData.get('contactEmail') as string,
      contactPhone: (formData.get('contactPhone') as string) || undefined,
      status: formData.get('status') as Operator['status'],
    }

    try {
      if (editingOperator) {
        await operatorApi.updateOperator(editingOperator.id, payload)
        toast.success('Operator updated successfully')
      } else {
        await operatorApi.createOperator(payload)
        toast.success('Operator created successfully')
      }
      handleCloseModal()
      fetchOperators()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save operator')
    }
  }

  const handleToggleStatus = async (operator: Operator, newStatus: Operator['status']) => {
    try {
      if (newStatus === 'approved') {
        await operatorApi.approveOperator(operator.id)
        toast.success('Operator approved')
      } else if (newStatus === 'suspended') {
        await operatorApi.suspendOperator(operator.id)
        toast.success('Operator suspended')
      } else {
        await operatorApi.updateOperator(operator.id, { status: newStatus })
        toast.success(`Operator status updated to ${newStatus}`)
      }
      fetchOperators()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to change status')
    }
  }

  const handleDeleteClick = (operator: Operator) => {
    setOperatorToDelete(operator)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!operatorToDelete) return
    try {
      await operatorApi.deleteOperator(operatorToDelete.id)
      toast.success('Operator deleted successfully')
      fetchOperators()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete operator')
    } finally {
      setDeleteDialogOpen(false)
      setOperatorToDelete(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Operator Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage bus operators and their permissions</p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-6 text-base"
        >
          <Plus className="w-6 h-6" />
          Add Operator
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Operators</p>
                <p className="text-gray-900 dark:text-white text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Approved</p>
                <p className="text-gray-900 dark:text-white text-2xl font-bold">{stats.approved}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Pending</p>
                <p className="text-gray-900 dark:text-white text-2xl font-bold">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Suspended</p>
                <p className="text-gray-900 dark:text-white text-2xl font-bold">{stats.suspended}</p>
              </div>
              <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Panel */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by operator name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-6 py-3 rounded-lg transition-colors font-medium ${
              tab === t.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500 dark:text-gray-400">Loading operators...</div>
            </div>
          ) : operators.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500 dark:text-gray-400">No operators found. Add one to get started!</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[20%]" />
                  <col className="w-[25%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[18%]" />
                  <col className="w-[13%]" />
                </colgroup>
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Operator Name
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Routes / Buses
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Approved Date
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {operators.map((operator) => (
                    <tr
                      key={operator.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-base text-gray-900 dark:text-white font-medium">{operator.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {operator.contactEmail}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Phone className="w-4 h-4" />
                            {operator.contactPhone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={operator.status} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-base text-gray-900 dark:text-white whitespace-nowrap">
                          0 / 0
                        </span> {/* Mock, replace with actual */}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-base text-gray-900 dark:text-white whitespace-nowrap">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(operator.approvedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {operator.status === 'pending' && (
                            <button
                              onClick={() => handleToggleStatus(operator, 'approved')}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                          )}
                          {operator.status === 'approved' && (
                            <button
                              onClick={() => handleToggleStatus(operator, 'suspended')}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                              title="Suspend"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                          {operator.status === 'suspended' && (
                            <button
                              onClick={() => handleToggleStatus(operator, 'approved')}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                              title="Reactivate"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenModal(operator)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(operator)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
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
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} operators
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingOperator ? 'Edit Operator' : 'Add New Operator'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Operator Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingOperator?.name || ''}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="e.g., National Express Vietnam"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      defaultValue={editingOperator?.contactEmail || ''}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="contact@operator.vn"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      defaultValue={editingOperator?.contactPhone || ''}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="+84 123 456 789"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingOperator?.status || 'pending'}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="px-6 py-3 bg-white dark:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700">
                  {editingOperator ? 'Update Operator' : 'Create Operator'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Operator</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{operatorToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}