'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Edit,
  Trash2,
  X,
  MapPin,
  Navigation,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Building2,
  Eye,
  Upload,
  Download,
} from 'lucide-react'
import { listStopsAPI, createStopAPI, updateStopAPI, deleteStopAPI, bulkImportStopsAPI, exportStopsAPI } from '@/lib/api'
import type { Stop } from '@/types/routeAndStop'
import { toast } from 'sonner'
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
import { ITEMS_PER_PAGE } from '@/utils/constants'

interface StopFormData {
  name: string
  latitude: number
  longitude: number
  address: string
  active: boolean
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
      <CheckCircle className="w-3.5 h-3.5" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
      <XCircle className="w-3.5 h-3.5" />
      Inactive
    </span>
  )
}

export default function StopsPage() {
  const [stops, setStops] = useState<Stop[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddEdit, setShowAddEdit] = useState(false)
  const [editingStop, setEditingStop] = useState<Stop | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<Stop | null>(null)
  const [detailStop, setDetailStop] = useState<Stop | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [formData, setFormData] = useState<StopFormData>({
    name: '',
    latitude: 0,
    longitude: 0,
    address: '',
    active: true,
  })

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof StopFormData, string>>>({})
  const [importing, setImporting] = useState(false)
  const [importDialog, setImportDialog] = useState(false)

  useEffect(() => {
    fetchStops()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const fetchStops = async () => {
    try {
      setLoading(true)
      const response = await listStopsAPI({}, { page: 1, limit: 500 })
      setStops(response.data)
    } catch (error) {
      toast.error('Failed to fetch stops')
      console.error('Error fetching stops:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter stops
  const filtered = stops.filter((stop) => {
    const matchesSearch =
      !searchQuery ||
      stop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stop.address?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      !statusFilter || (statusFilter === 'active' ? stop.active : !stop.active)
    return matchesSearch && matchesStatus
  })

  // Calculate stats
  const stats = {
    total: stops.length,
    active: stops.filter((s) => s.active).length,
    inactive: stops.filter((s) => !s.active).length,
    terminals: stops.filter((s) => s.name.toLowerCase().includes('terminal')).length,
  }

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const currentStops = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const openAdd = () => {
    setEditingStop(null)
    setFormData({
      name: '',
      latitude: 0,
      longitude: 0,
      address: '',
      active: true,
    })
    setFormErrors({})
    setShowAddEdit(true)
  }

  const openEdit = (stop: Stop) => {
    setEditingStop(stop)
    setFormData({
      name: stop.name,
      latitude: stop.latitude,
      longitude: stop.longitude,
      address: stop.address || '',
      active: stop.active,
    })
    setFormErrors({})
    setShowAddEdit(true)
  }

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof StopFormData, string>> = {}

    if (!formData.name.trim()) {
      errors.name = 'Stop name is required'
    }

    if (!formData.latitude || formData.latitude < -90 || formData.latitude > 90) {
      errors.latitude = 'Valid latitude is required (-90 to 90)'
    }

    if (!formData.longitude || formData.longitude < -180 || formData.longitude > 180) {
      errors.longitude = 'Valid longitude is required (-180 to 180)'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      if (editingStop) {
        await updateStopAPI(editingStop.id, formData)
        toast.success('Stop updated successfully')
      } else {
        await createStopAPI(formData)
        toast.success('Stop created successfully')
      }
      await fetchStops()
      setShowAddEdit(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save stop')
      console.error('Error saving stop:', error)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog) return

    try {
      await deleteStopAPI(deleteDialog.id)
      toast.success('Stop deleted successfully')
      await fetchStops()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete stop')
    } finally {
      setDeleteDialog(null)
    }
  }

  const handleExport = async () => {
    try {
      const filters = {
        name: searchQuery || undefined,
        active: statusFilter ? (statusFilter === 'active' ? true : false) : undefined,
      }
      
      const blob = await exportStopsAPI(filters)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `stops_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Exported stops successfully')
    } catch (error) {
      toast.error('Failed to export stops')
      console.error('Export error:', error)
    }
  }

  const handleImportClick = () => {
    setImportDialog(true)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }

    setImporting(true)
    try {
      const text = await file.text()
      const lines = text.split('\n').filter((line) => line.trim())
      if (lines.length < 2) {
        toast.error('CSV file is empty or invalid')
        setImporting(false)
        return
      }

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
      const nameIdx = headers.findIndex((h) => h.toLowerCase().includes('name'))
      const latIdx = headers.findIndex((h) => h.toLowerCase().includes('lat'))
      const lonIdx = headers.findIndex((h) => h.toLowerCase().includes('lon'))
      const addressIdx = headers.findIndex((h) => h.toLowerCase().includes('address'))
      const activeIdx = headers.findIndex((h) => h.toLowerCase().includes('active'))

      if (nameIdx === -1 || latIdx === -1 || lonIdx === -1) {
        toast.error('CSV must have Name, Latitude, and Longitude columns')
        setImporting(false)
        return
      }

      const stopsToImport = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
        const name = values[nameIdx]
        const latitude = parseFloat(values[latIdx])
        const longitude = parseFloat(values[lonIdx])
        const address = addressIdx !== -1 ? values[addressIdx] : ''
        const active = activeIdx !== -1 ? values[activeIdx].toLowerCase() === 'yes' : true

        if (name && !isNaN(latitude) && !isNaN(longitude)) {
          stopsToImport.push({ name, latitude, longitude, address, active })
        }
      }

      if (stopsToImport.length === 0) {
        toast.error('No valid stops found in CSV file')
        setImporting(false)
        return
      }

      const result = await bulkImportStopsAPI(stopsToImport)
      await fetchStops()
      
      if (result.errorCount > 0) {
        toast.success(`Imported ${result.successCount} stops successfully, ${result.errorCount} failed`)
      } else {
        toast.success(`Imported ${result.successCount} stops successfully`)
      }
      
      setImportDialog(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to import stops')
      console.error('Import error:', error)
    } finally {
      setImporting(false)
      if (e.target) e.target.value = ''
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Stop Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage bus stops, terminals, and pickup points
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Stops', value: stats.total, icon: MapPin, color: 'blue' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'green' },
          { label: 'Inactive', value: stats.inactive, icon: XCircle, color: 'red' },
          { label: 'Terminals', value: stats.terminals, icon: Building2, color: 'purple' },
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

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search stops by name, address, city, or province..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-w-[140px]"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Button
          onClick={handleImportClick}
          variant="outline"
          className="flex items-center gap-2 border-gray-300 dark:border-gray-700 h-[50px] px-4"
        >
          <Upload className="w-4 h-4" />
          Import
        </Button>
        <Button
          onClick={handleExport}
          variant="outline"
          className="flex items-center gap-2 border-gray-300 dark:border-gray-700 h-[50px] px-4"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
        <Button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 h-[50px] px-4">
          <Plus className="w-5 h-5" />
          Add Stop
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">Loading stops...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">No stops found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      Stop Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      Coordinates
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {currentStops.map((stop) => (
                    <tr
                      key={stop.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{stop.name}</p>
                          </div>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-[250px] truncate"
                        title={stop.address || 'No address'}
                      >
                        {stop.address || 'No address'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Navigation className="w-4 h-4" />
                          <span>
                            <span className="font-medium">Lat:</span> {stop.latitude.toFixed(4)}, <span className="font-medium">Long:</span> {stop.longitude.toFixed(4)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge active={stop.active} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {new Date(stop.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation()
                              try {
                                await updateStopAPI(stop.id, { active: !stop.active })
                                toast.success(`Stop ${!stop.active ? 'activated' : 'deactivated'} successfully`)
                                await fetchStops()
                              } catch (error: any) {
                                toast.error(error?.response?.data?.message || 'Failed to update stop status')
                              }
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              stop.active
                                ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/50'
                                : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/50'
                            }`}
                            title={stop.active ? 'Deactivate' : 'Activate'}
                          >
                            {stop.active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setDetailStop(stop)
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openEdit(stop)
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteDialog(stop)
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
                {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} stops
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
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white'
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

      {/* Add/Edit Dialog */}
      <Dialog open={showAddEdit} onOpenChange={setShowAddEdit}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingStop ? 'Edit Stop' : 'Add New Stop'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stop Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="e.g., Ben Thanh Market"
              />
              {formErrors.name && <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })
                  }
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.latitude ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="10.772"
                />
                {formErrors.latitude && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.latitude}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })
                  }
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.longitude ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="106.698"
                />
                {formErrors.longitude && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.longitude}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., District 1, Ho Chi Minh City"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="active" className="text-sm text-gray-700 dark:text-gray-300">
                Active
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button type="button" variant="outline" onClick={() => setShowAddEdit(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingStop ? 'Update Stop' : 'Create Stop'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailStop} onOpenChange={() => setDetailStop(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Stop Details</DialogTitle>
          </DialogHeader>
          {detailStop && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Stop Name</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {detailStop.name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Latitude</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {detailStop.latitude.toFixed(6)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Longitude</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {detailStop.longitude.toFixed(6)}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Address</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {detailStop.address || 'No address provided'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Status</p>
                <StatusBadge active={detailStop.active} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Created At</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {new Date(detailStop.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Updated</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {new Date(detailStop.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setDetailStop(null)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setDetailStop(null)
                    openEdit(detailStop)
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Stop
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stop</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteDialog?.name}&quot;? This action cannot
              be undone and may affect routes using this stop.
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

      {/* Import Dialog */}
      <Dialog open={importDialog} onOpenChange={setImportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Stops from CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                CSV file should have columns: <strong>Name</strong>, <strong>Latitude</strong>,{' '}
                <strong>Longitude</strong>, Address (optional), Active (optional)
              </p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                disabled={importing}
                className="block w-full text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-white dark:bg-gray-800 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-200"
              />
            </div>
            {importing && (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span className="text-sm">Importing stops...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
