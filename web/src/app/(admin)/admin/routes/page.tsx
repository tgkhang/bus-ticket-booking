'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Edit,
  Trash2,
  X,
  MapPin,
  Navigation,
  Clock,
  GripVertical,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronsUpDown,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useEffect, useState } from 'react'
import type { Route, RouteStop, Stop, CreateRouteData } from '@/types/routeAndStop'
import {
  createRouteAPI,
  deleteRouteAPI,
  listOperatorsAPI,
  listRoutesAPI,
  listStopsAPI,
  updateRouteAPI,
} from '@/lib/api'
import { toast } from 'sonner'
import type { Operator } from '@/types/operator'
import { useRouter } from 'next/navigation'
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
import { ITEMS_PER_PAGE } from '@/utils/constants'

export default function RoutesPage() {
  const router = useRouter()
  const [availableStops, setAvailableStops] = useState<Stop[]>([])
  const [operators, setOperators] = useState<Operator[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [routeToDelete, setRouteToDelete] = useState<Route | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [operatorComboboxOpen, setOperatorComboboxOpen] = useState(false)
  const [originComboboxOpen, setOriginComboboxOpen] = useState(false)
  const [destinationComboboxOpen, setDestinationComboboxOpen] = useState(false)
  const [stopComboboxOpen, setStopComboboxOpen] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter routes based on search query
  const filteredRoutes = routes?.filter((route) => {
    const query = searchQuery.toLowerCase()
    const operatorName = route.operator?.name?.toLowerCase() || ''
    const originName = route.originStop?.name?.toLowerCase() || ''
    const destName = route.destinationStop?.name?.toLowerCase() || ''

    return (
      route.name.toLowerCase().includes(query) ||
      operatorName.includes(query) ||
      originName.includes(query) ||
      destName.includes(query)
    )
  }) || []

  // Pagination calculations
  const totalPages = Math.ceil((filteredRoutes?.length || 0) / ITEMS_PER_PAGE)
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE
  const currentRoutes = filteredRoutes?.slice(indexOfFirstItem, indexOfLastItem) || []

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const [formData, setFormData] = useState({
    name: '',
    operatorId: '',
    originStopId: '',
    destinationStopId: '',
    distanceKm: 0,
    estimatedMinutes: 0,
    active: true,
    stops: [] as RouteStop[],
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [operatorsResponse, stopsResponse, routesResponse] = await Promise.all([
          listOperatorsAPI({ status: 'approved' }, { page: 1, limit: 100 }),
          listStopsAPI({ active: true }, { page: 1, limit: 500 }),
          listRoutesAPI({}, { page: 1, limit: 500 })
        ])
        setOperators(operatorsResponse.data)
        setAvailableStops(stopsResponse.data)
        setRoutes(routesResponse.data)
      } catch (error) {
        toast.error('Failed to fetch data')
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleOpenModal = (route?: Route) => {
    if (route) {
      setEditingRoute(route)
      setFormData({
        name: route.name,
        operatorId: route.operatorId,
        originStopId: route.originStopId,
        destinationStopId: route.destinationStopId,
        distanceKm: route.distanceKm,
        estimatedMinutes: route.estimatedMinutes,
        active: route.active,
        stops: route.stops.map((s) => ({
          id: s.id,
          routeId: s.routeId,
          stopId: s.stopId,
          sequence: s.sequence,
          isPickup: s.isPickup,
          isDropoff: s.isDropoff,
          note: s.note,
        })),
      })
    } else {
      setEditingRoute(null)
      setFormData({
        name: '',
        operatorId: '',
        originStopId: '',
        destinationStopId: '',
        distanceKm: 0,
        estimatedMinutes: 0,
        active: true,
        stops: [],
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingRoute(null)
  }

  const handleAddStop = () => {
    const newStop: RouteStop = {
      id: `rs_${Date.now()}`,
      routeId: editingRoute?.id || '',
      stopId: '',
      sequence: formData.stops.length + 1,
      isPickup: true,
      isDropoff: true,
    }
    setFormData({ ...formData, stops: [...formData.stops, newStop] })
  }

  const handleRemoveStop = (index: number) => {
    const newStops = formData.stops.filter((_, i) => i !== index)
    const resequenced = newStops.map((stop, i) => ({ ...stop, sequence: i + 1 }))
    setFormData({ ...formData, stops: resequenced })
  }

  const handleStopChange = (index: number, field: string, value: string | boolean) => {
    const newStops = [...formData.stops]
    newStops[index] = { ...newStops[index], [field]: value }
    setFormData({ ...formData, stops: newStops })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validate that origin and destination are different
      if (formData.originStopId === formData.destinationStopId) {
        toast.error('Origin and destination must be different stops')
        return
      }

      // Ensure origin and destination are included in stops array
      let stopsArray = [...formData.stops]

      // Check if origin is in stops array
      const hasOrigin = stopsArray.some((s) => s.stopId === formData.originStopId)
      // Check if destination is in stops array
      const hasDestination = stopsArray.some((s) => s.stopId === formData.destinationStopId)

      // If stops array is empty or doesn't include origin/destination, create a minimal valid array
      if (stopsArray.length === 0 || !hasOrigin || !hasDestination) {
        stopsArray = []
        // Add origin as first stop
        stopsArray.push({
          id: `temp_origin_${Date.now()}`,
          routeId: editingRoute?.id || '',
          stopId: formData.originStopId,
          sequence: 1,
          isPickup: true,
          isDropoff: false,
        })

        // Add any intermediate stops (that are not origin or destination)
        const intermediateStops = formData.stops.filter(
          (s) => s.stopId !== formData.originStopId && s.stopId !== formData.destinationStopId
        )
        intermediateStops.forEach((stop, index) => {
          stopsArray.push({
            ...stop,
            sequence: index + 2,
          })
        })

        // Add destination as last stop
        stopsArray.push({
          id: `temp_dest_${Date.now()}`,
          routeId: editingRoute?.id || '',
          stopId: formData.destinationStopId,
          sequence: intermediateStops.length + 2,
          isPickup: false,
          isDropoff: true,
        })
      }

      // Format the payload to match API requirements
      const payload: CreateRouteData = {
        name: formData.name,
        operatorId: formData.operatorId,
        originStopId: formData.originStopId,
        destinationStopId: formData.destinationStopId,
        distanceKm: formData.distanceKm,
        estimatedMinutes: formData.estimatedMinutes,
        active: formData.active,
        stops: stopsArray.map((stop) => ({
          stopId: stop.stopId,
          sequence: stop.sequence,
          isPickup: stop.isPickup,
          isDropoff: stop.isDropoff,
          note: stop.note || undefined, // Convert null to undefined
        })),
      }

      if (editingRoute) {
        const response = await updateRouteAPI(editingRoute.id, payload)
        setRoutes(routes.map((r) => (r.id === editingRoute.id ? response : r)))
        toast.success('Route updated successfully')
      } else {
        const response = await createRouteAPI(payload)
        setRoutes([...routes, response])
        toast.success('Route created successfully')
      }

      handleCloseModal()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error saving route:', error)
      toast.error(error?.response?.data?.message || 'Failed to save route')
    }
  }

  const handleDeleteClick = (route: Route) => {
    setRouteToDelete(route)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!routeToDelete) return

    try {
      await deleteRouteAPI(routeToDelete.id)
      setRoutes(routes.filter((route) => route.id !== routeToDelete.id))
      toast.success('Route deleted successfully')
    } catch (error) {
      toast.error('Failed to delete route')
      console.error('Error deleting route:', error)
    } finally {
      setDeleteDialogOpen(false)
      setRouteToDelete(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Route Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage routes, stops, and journey details</p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-6 text-base"
        >
          <Plus className="w-6 h-6" />
          Add Route
        </Button>
      </div>

      {/* Search Panel */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by route name, operator, origin, or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Routes</p>
                <p className="text-gray-900 dark:text-white text-2xl font-bold">{routes?.length || 0}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <Navigation className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Active Routes</p>
                <p className="text-gray-900 dark:text-white text-2xl font-bold">
                  {routes?.filter((r) => r.active).length || 0}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <Navigation className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Stops</p>
                <p className="text-gray-900 dark:text-white text-2xl font-bold">{availableStops?.length || 0}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Avg. Distance</p>
                <p className="text-gray-900 dark:text-white text-2xl font-bold">
                  {routes?.length > 0 ? Math.round(routes.reduce((acc, r) => acc + r.distanceKm, 0) / routes.length) : 0}{' '}
                  km
                </p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                <Navigation className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500 dark:text-gray-400">Loading routes...</div>
            </div>
          ) : !routes || routes.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500 dark:text-gray-400">No routes found. Add one to get started!</div>
            </div>
          ) : filteredRoutes.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                No routes match your search criteria. Try a different search term.
              </div>
            </div>
          ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[15%]" />
                    {/* Route Name */}
                    <col className="w-[15%]" />
                    {/* Operator */}
                    <col className="w-[20%]" />
                    {/* Origin → Destination */}
                    <col className="w-[10%]" />
                    {/* Stops */}
                    <col className="w-[8%]" />
                    {/* Distance */}
                    <col className="w-[10%]" />
                    {/* Duration */}
                    <col className="w-[8%]" />
                    {/* Status */}
                    <col className="w-[14%]" />
                    {/* Actions */}
                  </colgroup>
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                        Route Name
                      </th>
                      <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                        Operator
                      </th>
                      <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                        Origin → Destination
                      </th>
                      <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                        Stops
                      </th>
                      <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                        Distance
                      </th>
                      <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {currentRoutes.map((route) => (
                      <tr
                        key={route.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => router.push(`/admin/routes/${route.id}`)}
                      >
                        <td className="px-6 py-4">
                          <span className="text-base text-gray-900 dark:text-white font-medium">{route.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400 truncate block">
                            {route.operator.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1 min-w-0">
                              <MapPin className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                              <span className="text-sm text-gray-900 dark:text-white truncate">
                                {route.originStop.name}
                              </span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                            <div className="flex items-center gap-1 min-w-0">
                              <MapPin className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                              <span className="text-sm text-gray-900 dark:text-white truncate">
                                {route.destinationStop.name}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm whitespace-nowrap">
                            {route.stops.length} stops
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-base text-gray-900 dark:text-white whitespace-nowrap">
                            {route.distanceKm} km
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-base text-gray-900 dark:text-white whitespace-nowrap">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {Math.floor(route.estimatedMinutes / 60)}h {route.estimatedMinutes % 60}m
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {route.active ? (
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm whitespace-nowrap">
                              Active
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded-full text-sm whitespace-nowrap">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenModal(route)
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteClick(route)
                              }}
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
            {!loading && filteredRoutes && filteredRoutes.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRoutes?.length || 0)} of {filteredRoutes?.length || 0} routes
                  {searchQuery && ` (filtered from ${routes?.length || 0} total)`}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
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
                    onClick={() => handlePageChange(currentPage + 1)}
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
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingRoute ? 'Edit Route' : 'Add New Route'}
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
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Route Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="e.g., HCMC - Da Lat Express"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Operator <span className="text-red-500">*</span>
                    </label>
                    <Popover open={operatorComboboxOpen} onOpenChange={setOperatorComboboxOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={operatorComboboxOpen}
                          className="w-full justify-between px-4 py-3 h-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          {formData.operatorId
                            ? operators?.find((op) => op.id === formData.operatorId)?.name
                            : 'Select or type operator name...'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search operator..." className="h-9" />
                          <CommandList>
                            <CommandEmpty>No operator found.</CommandEmpty>
                            <CommandGroup>
                              {operators?.map((operator) => (
                                <CommandItem
                                  key={operator.id}
                                  value={operator.name}
                                  onSelect={() => {
                                    setFormData({ ...formData, operatorId: operator.id })
                                    setOperatorComboboxOpen(false)
                                  }}
                                >
                                  {operator.name}
                                  <Check
                                    className={cn(
                                      'ml-auto h-4 w-4',
                                      formData.operatorId === operator.id ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Origin & Destination */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Origin Stop <span className="text-red-500">*</span>
                    </label>
                    <Popover open={originComboboxOpen} onOpenChange={setOriginComboboxOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={originComboboxOpen}
                          className="w-full justify-between px-4 py-3 h-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          {formData.originStopId
                            ? availableStops?.find((stop) => stop.id === formData.originStopId)?.name
                            : 'Select or type origin stop...'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search stop..." className="h-9" />
                          <CommandList>
                            <CommandEmpty>No stop found.</CommandEmpty>
                            <CommandGroup>
                              {availableStops?.map((stop) => (
                                <CommandItem
                                  key={stop.id}
                                  value={stop.name}
                                  onSelect={() => {
                                    setFormData({ ...formData, originStopId: stop.id })
                                    setOriginComboboxOpen(false)
                                  }}
                                >
                                  {stop.name}
                                  <Check
                                    className={cn(
                                      'ml-auto h-4 w-4',
                                      formData.originStopId === stop.id ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Destination Stop <span className="text-red-500">*</span>
                    </label>
                    <Popover open={destinationComboboxOpen} onOpenChange={setDestinationComboboxOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={destinationComboboxOpen}
                          className="w-full justify-between px-4 py-3 h-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          {formData.destinationStopId
                            ? availableStops?.find((stop) => stop.id === formData.destinationStopId)?.name
                            : 'Select or type destination stop...'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search stop..." className="h-9" />
                          <CommandList>
                            <CommandEmpty>No stop found.</CommandEmpty>
                            <CommandGroup>
                              {availableStops?.map((stop) => (
                                <CommandItem
                                  key={stop.id}
                                  value={stop.name}
                                  onSelect={() => {
                                    setFormData({ ...formData, destinationStopId: stop.id })
                                    setDestinationComboboxOpen(false)
                                  }}
                                >
                                  {stop.name}
                                  <Check
                                    className={cn(
                                      'ml-auto h-4 w-4',
                                      formData.destinationStopId === stop.id ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Distance & Duration */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Distance (km) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.distanceKm}
                      onChange={(e) => setFormData({ ...formData, distanceKm: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      min="0"
                      step="0.1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estimated Duration (minutes) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedMinutes}
                      onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                    <select
                      value={formData.active ? 'active' : 'inactive'}
                      onChange={(e) => setFormData({ ...formData, active: e.target.value === 'active' })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Intermediate Stops */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Intermediate Stops
                    </label>
                    <button
                      type="button"
                      onClick={handleAddStop}
                      className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 px-3 py-2 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Stop
                    </button>
                  </div>

                  {formData.stops.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400">No intermediate stops added yet</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Click &quot;Add Stop&quot; to add stops along the route
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.stops.map((stop, index) => (
                        <div
                          key={stop.id}
                          className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-2 mt-3">
                              <GripVertical className="w-5 h-5 text-gray-400" />
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                #{stop.sequence}
                              </span>
                            </div>

                            <div className="flex-1 grid grid-cols-4 gap-3">
                              <div className="col-span-2">
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Stop</label>
                                <Popover open={stopComboboxOpen === index} onOpenChange={(open) => setStopComboboxOpen(open ? index : null)}>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      aria-expanded={stopComboboxOpen === index}
                                      className="w-full justify-between px-3 py-2 h-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                      {stop.stopId
                                        ? availableStops?.find((s) => s.id === stop.stopId)?.name
                                        : 'Select or type stop...'}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0" align="start">
                                    <Command>
                                      <CommandInput placeholder="Search stop..." className="h-9" />
                                      <CommandList>
                                        <CommandEmpty>No stop found.</CommandEmpty>
                                        <CommandGroup>
                                          {availableStops?.map((s) => (
                                            <CommandItem
                                              key={s.id}
                                              value={s.name}
                                              onSelect={() => {
                                                handleStopChange(index, 'stopId', s.id)
                                                setStopComboboxOpen(null)
                                              }}
                                            >
                                              {s.name}
                                              <Check
                                                className={cn(
                                                  'ml-auto h-4 w-4',
                                                  stop.stopId === s.id ? 'opacity-100' : 'opacity-0'
                                                )}
                                              />
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                              </div>

                              <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Pickup</label>
                                <input
                                  type="checkbox"
                                  checked={stop.isPickup}
                                  onChange={(e) => handleStopChange(index, 'isPickup', e.target.checked)}
                                  className="w-5 h-5 mt-2 rounded text-blue-600 focus:ring-blue-600"
                                />
                              </div>

                              <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Drop-off</label>
                                <input
                                  type="checkbox"
                                  checked={stop.isDropoff}
                                  onChange={(e) => handleStopChange(index, 'isDropoff', e.target.checked)}
                                  className="w-5 h-5 mt-2 rounded text-blue-600 focus:ring-blue-600"
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveStop(index)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors mt-6"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                  {editingRoute ? 'Update Route' : 'Create Route'}
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
            <AlertDialogTitle>Delete Route</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the route &quot;{routeToDelete?.name}&quot;? This action cannot be undone.
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
