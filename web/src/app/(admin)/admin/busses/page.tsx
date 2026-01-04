'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Edit,
  Trash2,
  X,
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
import { listBusesAPI, createBusAPI, updateBusAPI, deleteBusAPI, listOperatorsAPI } from '@/lib/api'
import type { Bus, CreateBusData, UpdateBusData, BusAmenities } from '@/types/api'
import { toast } from 'sonner'
import { amenityOptions, ITEMS_PER_PAGE } from '@/utils/constants'
import { useRouter } from 'next/navigation'
import { Operator } from '@/types/operator'

interface BusFormData {
  operatorId: string
  plateNumber: string
  model: string
  seatCapacity: number
  amenities: BusAmenities
  status: 'active' | 'inactive' | 'maintenance'
}

export default function BusManagementPage() {
  const [buses, setBuses] = useState<Bus[]>([])
  const [operators, setOperators] = useState<Operator[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingOperators, setLoadingOperators] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingBus, setEditingBus] = useState<Bus | null>(null)
  const [deletingBus, setDeletingBus] = useState<Bus | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [operatorComboboxOpen, setOperatorComboboxOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)

  const {
    register,
    handleSubmit: handleFormSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BusFormData>({
    defaultValues: {
      operatorId: '',
      plateNumber: '',
      model: '',
      seatCapacity: 0,
      amenities: {
        wifi: false,
        ac: false,
        restroom: false,
        entertainment: false,
        usb_charging: false,
        reclining_seats: false,
        reading_light: false,
        blanket: false,
        water: false,
      },
      status: 'active',
    },
  })

  // Watch amenities for checkbox state
  const amenities = watch('amenities')

  // Fetch buses and operators on component mount
  useEffect(() => {
    fetchBuses()
    fetchOperators()
  }, [])

  const fetchOperators = async () => {
    try {
      setLoadingOperators(true)
      const response = await listOperatorsAPI({ status: 'approved' }, { page: 1, limit: 100 })
      setOperators(response.data)
    } catch (error) {
      toast.error('Failed to fetch operators')
      console.error('Error fetching operators:', error)
    } finally {
      setLoadingOperators(false)
    }
  }

  const fetchBuses = async () => {
    try {
      setLoading(true)
      const response = await listBusesAPI({}, { page: 1, limit: 100 })
      console.log('Fetched buses:', response.data)
      setBuses(response.data)
    } catch (error) {
      toast.error('Failed to fetch buses')
      console.error('Error fetching buses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (bus?: Bus) => {
    if (bus) {
      setEditingBus(bus)
      reset({
        operatorId: bus.operatorId,
        plateNumber: bus.plateNumber,
        model: bus.model,
        seatCapacity: bus.seatCapacity,
        amenities: bus.amenities,
        status: bus.status,
      })
    } else {
      setEditingBus(null)
      reset({
        operatorId: '',
        plateNumber: '',
        model: '',
        seatCapacity: 0,
        amenities: {
          wifi: false,
          ac: false,
          restroom: false,
          entertainment: false,
          usb_charging: false,
          reclining_seats: false,
          reading_light: false,
          blanket: false,
          water: false,
        },
        status: 'active',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingBus(null)
    reset()
  }

  const onSubmit = async (data: BusFormData) => {
    try {
      if (editingBus) {
        // Update existing bus
        const updateData: UpdateBusData = {
          plateNumber: data.plateNumber,
          model: data.model,
          seatCapacity: data.seatCapacity,
          amenities: data.amenities,
          status: data.status,
        }
        await updateBusAPI(editingBus.id, updateData)
        toast.success('Bus updated successfully')
      } else {
        // Create new bus
        const createData: CreateBusData = {
          operatorId: data.operatorId,
          plateNumber: data.plateNumber,
          model: data.model,
          seatCapacity: data.seatCapacity,
          amenities: data.amenities,
        }
        await createBusAPI(createData)
      }

      // Refresh the bus list
      await fetchBuses()
      handleCloseModal()
    } catch (error) {
      //toast.error(editingBus ? 'Failed to update bus' : 'Failed to create bus')
      console.error('Error submitting bus:', error)
    }
  }

  const handleOpenDeleteModal = (bus: Bus) => {
    setDeletingBus(bus)
    setShowDeleteModal(true)
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setDeletingBus(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingBus) return

    try {
      setIsDeleting(true)
      await deleteBusAPI(deletingBus.id)
      await fetchBuses()
      handleCloseDeleteModal()
    } catch (error) {
      toast.error('Failed to delete bus')
      console.error('Error deleting bus:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleAmenity = (amenity: keyof BusAmenities) => {
    setValue(`amenities.${amenity}`, !amenities[amenity])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500 text-white'
      case 'inactive':
        return 'bg-gray-500 text-white'
      case 'maintenance':
        return 'bg-yellow-500 text-white'
      default:
        return 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  // Filter buses based on search query
  const filteredBuses = buses.filter((bus) => {
    const query = searchQuery.toLowerCase()
    const operatorName = operators.find((op) => op.id === bus.operatorId)?.name?.toLowerCase() || ''

    return (
      bus.plateNumber.toLowerCase().includes(query) ||
      bus.model.toLowerCase().includes(query) ||
      operatorName.includes(query)
    )
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredBuses.length / ITEMS_PER_PAGE)
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE
  const currentBuses = filteredBuses.slice(indexOfFirstItem, indexOfLastItem)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const router = useRouter()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bus Management</h1>
          <p className="text-gray-600">Manage your fleet of buses</p>
        </div>

        <Button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-6 text-base"
        >
          <Plus className="w-6 h-6" />
          Add New Bus
        </Button>
      </div>

      {/* Search Panel */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by plate number, model, or operator name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Buses Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500 dark:text-gray-400">Loading buses...</div>
            </div>
          ) : buses.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500 dark:text-gray-400">No buses found. Add one to get started!</div>
            </div>
          ) : filteredBuses.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                No buses match your search criteria. Try a different search term.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Plate Number
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Operator
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Model
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300">
                      Amenities
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
                  {currentBuses.map((bus) => {
                    const activeAmenities = Object.entries(bus.amenities)
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      .filter(([_, value]) => value)
                      .map(([key]) => key)

                    const operatorName = operators.find((op) => op.id === bus.operatorId)?.name || 'N/A'

                    return (
                      <tr
                        key={bus.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => router.push(`/admin/busses/${bus.id}`)}
                      >
                        <td className="px-6 py-4 text-base text-gray-900 dark:text-gray-100">{bus.plateNumber}</td>
                        <td className="px-6 py-4 text-base text-gray-900 dark:text-gray-100">{operatorName}</td>
                        <td className="px-6 py-4 text-base text-gray-900 dark:text-gray-100">{bus.model}</td>
                        <td className="px-6 py-4 text-base text-gray-900 dark:text-gray-100">
                          {bus.seatCapacity} seats
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {activeAmenities.map((amenity) => {
                              const option = amenityOptions.find((a) => a.value === amenity)
                              if (!option) return null
                              const Icon = option.icon
                              return (
                                <div key={amenity} className="text-gray-500 dark:text-gray-400" title={option.label}>
                                  <Icon className="w-5 h-5" />
                                </div>
                              )
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bus.status)}`}>
                            {bus.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenModal(bus)
                              }}
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                              title="Edit bus"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenDeleteModal(bus)
                              }}
                              className="text-red-600 hover:text-red-700 transition-colors"
                              title="Delete bus"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredBuses.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredBuses.length)} of {filteredBuses.length} buses
                {searchQuery && ` (filtered from ${buses.length} total)`}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingBus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Delete</h2>
              <button
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">Are you sure you want to delete this bus?</p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                <p className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">Plate Number: </span>
                  <span className="text-gray-700 dark:text-gray-300">{deletingBus.plateNumber}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">Model: </span>
                  <span className="text-gray-700 dark:text-gray-300">{deletingBus.model}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">Capacity: </span>
                  <span className="text-gray-700 dark:text-gray-300">{deletingBus.seatCapacity} seats</span>
                </p>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 mt-4">This action cannot be undone.</p>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
                className="flex-1 bg-white dark:bg-gray-800 py-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 py-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Bus'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingBus ? 'Edit Bus' : 'Add New Bus'}
              </h2>
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit(onSubmit)} className="p-6">
              <div className="space-y-4">
                {!editingBus && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Operator</label>
                    <Popover open={operatorComboboxOpen} onOpenChange={setOperatorComboboxOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={operatorComboboxOpen}
                          className="w-full justify-between px-4 py-2 h-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                          disabled={loadingOperators}
                        >
                          {watch('operatorId')
                            ? operators.find((op) => op.id === watch('operatorId'))?.name
                            : loadingOperators
                            ? 'Loading operators...'
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
                              {operators.map((operator) => (
                                <CommandItem
                                  key={operator.id}
                                  value={operator.name}
                                  onSelect={() => {
                                    setValue('operatorId', operator.id)
                                    setOperatorComboboxOpen(false)
                                  }}
                                >
                                  {operator.name}
                                  <Check
                                    className={cn(
                                      'ml-auto h-4 w-4',
                                      watch('operatorId') === operator.id ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {errors.operatorId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.operatorId.message}</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Plate Number
                    </label>
                    <input
                      type="text"
                      {...register('plateNumber', {
                        required: 'Plate number is required',
                        minLength: { value: 5, message: 'Plate number must be at least 5 characters' },
                        maxLength: { value: 20, message: 'Plate number must not exceed 20 characters' },
                      })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    {errors.plateNumber && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.plateNumber.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Model</label>
                    <input
                      type="text"
                      {...register('model', {
                        required: 'Model is required',
                        minLength: { value: 2, message: 'Model must be at least 2 characters' },
                        maxLength: { value: 100, message: 'Model must not exceed 100 characters' },
                      })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    {errors.model && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.model.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Seat Capacity
                    </label>
                    <input
                      type="number"
                      {...register('seatCapacity', {
                        required: 'Seat capacity is required',
                        min: { value: 1, message: 'Seat capacity must be at least 1' },
                        max: { value: 100, message: 'Seat capacity must not exceed 100' },
                        valueAsNumber: true,
                      })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    {errors.seatCapacity && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.seatCapacity.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                    <select
                      {...register('status')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Amenities</label>
                  <div className="grid grid-cols-2 gap-3">
                    {amenityOptions.map((amenity) => {
                      const Icon = amenity.icon
                      const amenityKey = amenity.value as keyof BusAmenities
                      return (
                        <label
                          key={amenity.value}
                          className="flex text-sm items-center gap-3 p-3 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={amenities?.[amenityKey] || false}
                            onChange={() => toggleAmenity(amenityKey)}
                            className="rounded text-blue-600 focus:ring-blue-600"
                          />
                          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">{amenity.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : editingBus ? 'Update Bus' : 'Add Bus'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="flex-1 bg-white dark:bg-gray-800 py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
