'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Edit, Save, X, Plus, Grid, AlertCircle, Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { toast } from 'sonner'
import {
  getBusDetailsAPI,
  updateBusAPI,
  generateSeatsAPI,
  deleteAllSeatsAPI,
  deleteSeatAPI,
  createSeatAPI,
} from '@/lib/api'
import { amenityOptions } from '@/utils/constants'
import { Bus, BusAmenities, Seat } from '@/types/api'
import { useForm, SubmitHandler } from 'react-hook-form'
import { BUS_LAYOUTS_VIETNAM_BRIEF, calculateSeatCount, calculateSuggestedRows } from '@/utils/baseBusType'

type BusFormInputs = {
  plateNumber: string
  model: string
  seatCapacity: number
  amenities: BusAmenities
  status: 'active' | 'inactive' | 'maintenance'
}

export default function BusDetailPage() {
  const params = useParams()
  const router = useRouter()
  const busId = params.id as string

  const [bus, setBus] = useState<Bus | null>(null)
  const [isEditingBus, setIsEditingBus] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showAddSeatModal, setShowAddSeatModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BusFormInputs>({
    defaultValues: {
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

  const amenities = watch('amenities')

  const [generateFormData, setGenerateFormData] = useState({
    layout: '2-2',
    rows: 0,
    seatType: 'regular' as 'regular' | 'premium' | 'sleeper',
    startRow: 1,
  })

  // Auto-calculate rows when layout changes or modal opens
  useEffect(() => {
    if (bus && showGenerateModal) {
      const suggestedRows = calculateSuggestedRows(generateFormData.layout, bus.seatCapacity)
      setGenerateFormData((prev) => ({ ...prev, rows: suggestedRows }))
    }
  }, [showGenerateModal, generateFormData.layout, bus])

  // Calculate expected seat count
  const expectedSeatCount =
    generateFormData.rows > 0 ? calculateSeatCount(generateFormData.layout, generateFormData.rows) : 0
  const exceedsCapacity = bus ? expectedSeatCount > bus.seatCapacity : false

  const [seatFormData, setSeatFormData] = useState({
    seatNumber: '',
    seatType: 'regular' as 'regular' | 'premium' | 'sleeper',
    isActive: true,
  })

  const [selectedFloor, setSelectedFloor] = useState(1)

  // Helper function to organize seats by floor
  const organizeSeatsByFloor = (seats: Seat[]) => {
    const floors: { [key: number]: Seat[] } = {}

    seats.forEach((seat) => {
      // Check if seat number starts with a floor number (e.g., "1A1", "2B3")
      const floorMatch = seat.seatNumber.match(/^(\d)/)
      const floor = floorMatch ? parseInt(floorMatch[1]) : 1

      if (!floors[floor]) {
        floors[floor] = []
      }
      floors[floor].push(seat)
    })

    return floors
  }

  // Helper function to organize seats by rows for better visualization
  const organizeSeatsByRows = (seats: Seat[]) => {
    const rows: { [key: string]: Seat[] } = {}

    seats.forEach((seat) => {
      // Extract row number from seat (e.g., "A1" -> "1", "1A1" -> "1")
      const rowMatch = seat.seatNumber.match(/(\d+)$/)
      const rowNum = rowMatch ? rowMatch[1] : '0'

      if (!rows[rowNum]) {
        rows[rowNum] = []
      }
      rows[rowNum].push(seat)
    })

    // Sort rows by number
    const sortedRows: { [key: string]: Seat[] } = {}
    Object.keys(rows)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach((key) => {
        // Sort seats within each row by column letter
        sortedRows[key] = rows[key].sort((a, b) => {
          const colA = a.seatNumber.replace(/\d/g, '')
          const colB = b.seatNumber.replace(/\d/g, '')
          return colA.localeCompare(colB)
        })
      })

    return sortedRows
  }

  useEffect(() => {
    const fetchBusDetails = async () => {
      try {
        setLoading(true)
        const response = await getBusDetailsAPI(busId)
        setBus(response)
        reset({
          plateNumber: response.plateNumber,
          model: response.model,
          seatCapacity: response.seatCapacity,
          amenities: response.amenities,
          status: response.status,
        })
      } catch (error) {
        console.error('Error fetching bus details:', error)
        toast.error('Failed to fetch bus details')
      } finally {
        setLoading(false)
      }
    }

    fetchBusDetails()
  }, [busId, reset])

  const toggleAmenity = (amenity: keyof BusAmenities) => {
    const currentAmenities = watch('amenities')
    setValue('amenities', {
      ...currentAmenities,
      [amenity]: !currentAmenities[amenity],
    })
  }

  const onSubmit: SubmitHandler<BusFormInputs> = async (data) => {
    if (!bus) return

    try {
      await updateBusAPI(bus.id, data)
      setBus({ ...bus, ...data })
      setIsEditingBus(false)
      toast.success('Bus details updated successfully')
    } catch (error) {
      console.error('Error updating bus:', error)
      toast.error('Failed to update bus details')
    }
  }

  const handleGenerateSeats = async () => {
    if (!bus) return

    try {
      await generateSeatsAPI(bus.id, generateFormData)
      setShowGenerateModal(false)

      // Refresh bus data after generation
      const refreshedBus = await getBusDetailsAPI(bus.id)
      setBus(refreshedBus)
    } catch (error) {
      console.error('Error generating seats:', error)
      // toast.error('Failed to generate seats')
    }
  }

  const handleAddSeat = async () => {
    if (!bus || !seatFormData.seatNumber.trim()) {
      toast.error('Please enter a seat number')
      return
    }

    try {
      await createSeatAPI(bus.id, seatFormData)
      setShowAddSeatModal(false)
      setSeatFormData({
        seatNumber: '',
        seatType: 'regular',
        isActive: true,
      })

      // Refresh bus data after adding seat
      const refreshedBus = await getBusDetailsAPI(bus.id)
      setBus(refreshedBus)
    } catch (error) {
      console.error('Error adding seat:', error)
      // API already shows error toast
    }
  }

  const handleOpenDeleteSeatModal = (seatId: string) => {
    setSeatToDelete(seatId)
    setShowDeleteSeatModal(true)
  }

  const handleConfirmDeleteSeat = async () => {
    if (!bus || !seatToDelete) return

    try {
      await deleteSeatAPI(bus.id, seatToDelete)
      setShowDeleteSeatModal(false)
      setSeatToDelete(null)

      // Refresh bus data after deletion
      const refreshedBus = await getBusDetailsAPI(bus.id)
      setBus(refreshedBus)
    } catch (error) {
      console.error('Error deleting seat:', error)
      // API already shows error toast
    }
  }

  const [showDeleteAllSeatsModal, setShowDeleteAllSeatsModal] = useState(false)
  const [isDeletingSeats, setIsDeletingSeats] = useState(false)
  const [showDeleteSeatModal, setShowDeleteSeatModal] = useState(false)
  const [seatToDelete, setSeatToDelete] = useState<string | null>(null)

  const handleOpenDeleteAllSeatsModal = () => {
    setShowDeleteAllSeatsModal(true)
  }

  const handleDeleteAllSeats = async () => {
    if (!bus) return

    try {
      setIsDeletingSeats(true)
      await deleteAllSeatsAPI(bus.id)
      setShowDeleteAllSeatsModal(false)

      // Refresh bus data after deletion
      const refreshedBus = await getBusDetailsAPI(bus.id)
      setBus(refreshedBus)
    } catch (error) {
      console.error('Error deleting all seats:', error)
      toast.error('Failed to delete all seats')
    } finally {
      setIsDeletingSeats(false)
    }
  }

  const handleToggleSeatStatus = (seatId: string) => {
    if (bus) {
      const seat = bus.seats.find((s) => s.id === seatId)
      setBus({
        ...bus,
        seats: bus.seats.map((s) => (s.id === seatId ? { ...s, isActive: !s.isActive } : s)),
      })
      toast.success(`Seat ${seat?.isActive ? 'deactivated' : 'activated'} successfully`)
      // TODO: Call API to update seat status
    }
  }

  const getSeatTypeColor = (type: string) => {
    switch (type) {
      case 'premium':
        return 'bg-purple-500 hover:bg-purple-600'
      case 'sleeper':
        return 'bg-blue-500 hover:bg-blue-600'
      default:
        return 'bg-green-500 hover:bg-green-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[#10B981]'
      case 'inactive':
        return 'bg-gray-500'
      case 'maintenance':
        return 'bg-[#F59E0B]'
      default:
        return 'bg-gray-300'
    }
  }

  if (!bus) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading bus details...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/busses')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Bus Details - {bus.plateNumber}</h1>
            <p className="text-gray-600 dark:text-gray-400">{bus.model}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full text-white ${getStatusColor(bus.status)}`}>
            {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bus Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bus Information</h2>
                {!isEditingBus ? (
                  <button
                    onClick={() => setIsEditingBus(true)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmit(onSubmit)}
                      disabled={isSubmitting}
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingBus(false)
                        reset({
                          plateNumber: bus.plateNumber,
                          model: bus.model,
                          seatCapacity: bus.seatCapacity,
                          amenities: bus.amenities,
                          status: bus.status,
                        })
                      }}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Plate Number</label>
                  {isEditingBus ? (
                    <input
                      type="text"
                      {...register('plateNumber', { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{bus.plateNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Model</label>
                  {isEditingBus ? (
                    <input
                      type="text"
                      {...register('model', { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{bus.model}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Seat Capacity</label>
                  {isEditingBus ? (
                    <input
                      type="number"
                      {...register('seatCapacity', { required: true, valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{bus.seatCapacity} seats</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Status</label>
                  {isEditingBus ? (
                    <select
                      {...register('status')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 dark:text-white">{bus.status}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Amenities</label>
                  {isEditingBus ? (
                    <div className="grid grid-cols-2 gap-2">
                      {amenityOptions.map((amenity) => {
                        const Icon = amenity.icon
                        const amenityKey = amenity.value as keyof BusAmenities
                        const currentAmenities = watch('amenities')
                        return (
                          <button
                            key={amenity.value}
                            type="button"
                            onClick={() => toggleAmenity(amenityKey)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                              currentAmenities[amenityKey]
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{amenity.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(bus.amenities).map(([key, value]) => {
                        if (!value) return null
                        const option = amenityOptions.find((a) => a.value === key)
                        if (!option) return null
                        const Icon = option.icon
                        return (
                          <div
                            key={key}
                            className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg"
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{option.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Total Seats</span>
                    <span className="text-gray-900 dark:text-white font-semibold">{bus.seats.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Active Seats</span>
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {bus.seats.filter((s) => s.isActive).length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seat Management */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Seat Layout Management</h2>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleOpenDeleteAllSeatsModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700"
                  >
                    <Trash className="w-4 h-4" />
                    Delete all seats
                  </Button>
                  <Button
                    onClick={() => setShowGenerateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <Grid className="w-4 h-4" />
                    Auto Generate
                  </Button>
                  <Button
                    onClick={() => setShowAddSeatModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Seat
                  </Button>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Regular</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-500 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Premium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Sleeper</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Inactive</span>
                </div>
              </div>

              {/* Seat Grid - Bus Layout View */}
              <div className="space-y-4">
                {(() => {
                  const floorSeats = organizeSeatsByFloor(bus.seats)
                  const floorNumbers = Object.keys(floorSeats).map(Number).sort()
                  const hasMultipleFloors = floorNumbers.length > 1

                  return (
                    <>
                      {/* Floor Tabs for multi-floor buses */}
                      {hasMultipleFloors && (
                        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                          {floorNumbers.map((floorNum) => (
                            <button
                              key={floorNum}
                              onClick={() => setSelectedFloor(floorNum)}
                              className={`px-4 py-2 font-medium transition-colors ${
                                selectedFloor === floorNum
                                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                              }`}
                            >
                              Floor {floorNum}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Display seats for selected floor */}
                      {floorNumbers.map((floorNum) => {
                        if (hasMultipleFloors && floorNum !== selectedFloor) return null

                        const seatsOnFloor = floorSeats[floorNum] || []
                        const rowSeats = organizeSeatsByRows(seatsOnFloor)
                        const rowNumbers = Object.keys(rowSeats)

                        return (
                          <div key={floorNum} className="space-y-4">
                            {/* Driver section indicator */}
                            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                🚗 Driver {hasMultipleFloors && `- Floor ${floorNum}`}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">Front of Bus</span>
                            </div>

                            {/* Seat Layout by Rows */}
                            <div className="space-y-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                              {rowNumbers.map((rowNum) => {
                                const seatsInRow = rowSeats[rowNum]

                                // Sort seats by column letter to ensure proper order
                                const sortedSeats = [...seatsInRow].sort((a, b) => {
                                  const colA = a.seatNumber.replace(/\d/g, '')
                                  const colB = b.seatNumber.replace(/\d/g, '')
                                  return colA.localeCompare(colB)
                                })

                                // Organize seats based on their column positions
                                // For 2-2: A, B (left) | Aisle | C, D (right)
                                // For 1-1-1: A (left) | B (middle) | C (right)
                                // For 1-1: A (left) | Aisle | B (right)
                                const leftSeats: Seat[] = []
                                const middleSeats: Seat[] = []
                                const rightSeats: Seat[] = []

                                // Determine the layout type based on columns present
                                const columns = [...new Set(sortedSeats.map((s) => s.seatNumber.replace(/\d/g, '')))]
                                const totalColumns = columns.length

                                sortedSeats.forEach((seat) => {
                                  const col = seat.seatNumber.replace(/\d/g, '')

                                  // Logic based on total number of columns:
                                  // 2 columns (A, B) = 1-1 layout: A | B
                                  // 3 columns (A, B, C) = could be 1-1-1 or 2-1
                                  // 4 columns (A, B, C, D) = 2-2 layout: AB | CD

                                  if (totalColumns === 2) {
                                    // 1-1 layout: A (left) | B (right)
                                    if (col === 'A') {
                                      leftSeats.push(seat)
                                    } else {
                                      rightSeats.push(seat)
                                    }
                                  } else if (totalColumns === 3) {
                                    // 1-1-1 layout: A (left) | B (middle) | C (right)
                                    // OR 2-1 layout: AB (left) | C (right)
                                    // We need to check if it's 1-1-1 (middle exists) or 2-1
                                    // For now, assume 1-1-1 for 3 columns with A, B, C
                                    if (col === 'A') {
                                      leftSeats.push(seat)
                                    } else if (col === 'B') {
                                      middleSeats.push(seat)
                                    } else {
                                      rightSeats.push(seat)
                                    }
                                  } else if (totalColumns >= 4) {
                                    // 2-2 layout: AB (left) | CD (right)
                                    if (col === 'A' || col === 'B') {
                                      leftSeats.push(seat)
                                    } else {
                                      rightSeats.push(seat)
                                    }
                                  } else {
                                    // Single column, put on left
                                    leftSeats.push(seat)
                                  }
                                })

                                return (
                                  <div key={rowNum} className="flex items-center gap-3 justify-center">
                                    {/* Left seats */}
                                    <div className="flex gap-2">
                                      {leftSeats.map((seat) => (
                                        <div key={seat.id} className="relative group">
                                          <button
                                            onClick={() => handleToggleSeatStatus(seat.id)}
                                            className={`w-12 h-12 rounded-lg text-white text-xs font-semibold transition-all ${
                                              seat.isActive
                                                ? getSeatTypeColor(seat.seatType)
                                                : 'bg-gray-300 dark:bg-gray-600'
                                            }`}
                                            title={`${seat.seatNumber} - ${seat.seatType} ${
                                              seat.isActive ? '(Active)' : '(Inactive)'
                                            }`}
                                          >
                                            {seat.seatNumber}
                                          </button>
                                          <button
                                            onClick={() => handleOpenDeleteSeatModal(seat.id)}
                                            className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Delete seat"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Aisle */}
                                    <div className="w-8 border-l-2 border-r-2 border-dashed border-gray-300 dark:border-gray-600 h-12"></div>

                                    {/* Middle seats (for 1-1-1 layouts) */}
                                    {middleSeats.length > 0 && (
                                      <>
                                        <div className="flex gap-2">
                                          {middleSeats.map((seat) => (
                                            <div key={seat.id} className="relative group">
                                              <button
                                                onClick={() => handleToggleSeatStatus(seat.id)}
                                                className={`w-12 h-12 rounded-lg text-white text-xs font-semibold transition-all ${
                                                  seat.isActive
                                                    ? getSeatTypeColor(seat.seatType)
                                                    : 'bg-gray-300 dark:bg-gray-600'
                                                }`}
                                                title={`${seat.seatNumber} - ${seat.seatType} ${
                                                  seat.isActive ? '(Active)' : '(Inactive)'
                                                }`}
                                              >
                                                {seat.seatNumber}
                                              </button>
                                              <button
                                                onClick={() => handleOpenDeleteSeatModal(seat.id)}
                                                className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Delete seat"
                                              >
                                                <X className="w-3 h-3" />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                        {/* Another aisle */}
                                        <div className="w-8 border-l-2 border-r-2 border-dashed border-gray-300 dark:border-gray-600 h-12"></div>
                                      </>
                                    )}

                                    {/* Right seats */}
                                    <div className="flex gap-2">
                                      {rightSeats.map((seat) => (
                                        <div key={seat.id} className="relative group">
                                          <button
                                            onClick={() => handleToggleSeatStatus(seat.id)}
                                            className={`w-12 h-12 rounded-lg text-white text-xs font-semibold transition-all ${
                                              seat.isActive
                                                ? getSeatTypeColor(seat.seatType)
                                                : 'bg-gray-300 dark:bg-gray-600'
                                            }`}
                                            title={`${seat.seatNumber} - ${seat.seatType} ${
                                              seat.isActive ? '(Active)' : '(Inactive)'
                                            }`}
                                          >
                                            {seat.seatNumber}
                                          </button>
                                          <button
                                            onClick={() => handleOpenDeleteSeatModal(seat.id)}
                                            className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Delete seat"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </>
                  )
                })()}
              </div>

              {bus.seats.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No seats configured yet</p>
                  <button onClick={() => setShowGenerateModal(true)} className="text-blue-600 hover:underline">
                    Generate seat layout
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generate Seats Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Auto Generate Seat Layout</h2>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Bus Layout Type</label>
                <select
                  value={generateFormData.layout}
                  onChange={(e) =>
                    setGenerateFormData({
                      ...generateFormData,
                      layout: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {BUS_LAYOUTS_VIETNAM_BRIEF.map((layout) => (
                    <option key={layout.code} value={layout.code}>
                      {layout.name} ({layout.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Capacity Information */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Bus Capacity:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{bus?.seatCapacity} seats</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Auto-calculated Rows:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{generateFormData.rows} rows</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Total Seats to Generate:</span>
                  <span
                    className={`font-semibold ${
                      exceedsCapacity ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}
                  >
                    {expectedSeatCount} seats
                  </span>
                </div>
              </div>

              {/* Warning if exceeds capacity */}
              {exceedsCapacity && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800 dark:text-red-300">
                    <p className="font-semibold mb-1">Bus capacity is not suitable with this layout!</p>
                    <p>
                      The generated layout ({expectedSeatCount} seats) exceeds your bus capacity ({bus?.seatCapacity}{' '}
                      seats). Please adjust your bus capacity or choose a different layout.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Seat Type</label>
                <select
                  value={generateFormData.seatType}
                  onChange={(e) =>
                    setGenerateFormData({
                      ...generateFormData,
                      seatType: e.target.value as 'regular' | 'premium' | 'sleeper',
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="regular">Regular</option>
                  <option value="premium">Premium</option>
                  <option value="sleeper">Sleeper</option>
                </select>
              </div>

              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0" />
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  This will replace all existing seats with the new layout
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
              <Button onClick={() => setShowGenerateModal(false)} variant="outline" className="px-6 py-3">
                Cancel
              </Button>
              <Button
                onClick={handleGenerateSeats}
                disabled={exceedsCapacity}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Layout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Seat Modal */}
      {showAddSeatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Seat</h2>
              <button
                onClick={() => setShowAddSeatModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Seat Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={seatFormData.seatNumber}
                  onChange={(e) => setSeatFormData({ ...seatFormData, seatNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., A1, B2"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Seat Type</label>
                <select
                  value={seatFormData.seatType}
                  onChange={(e) =>
                    setSeatFormData({
                      ...seatFormData,
                      seatType: e.target.value as 'regular' | 'premium' | 'sleeper',
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="regular">Regular</option>
                  <option value="premium">Premium</option>
                  <option value="sleeper">Sleeper</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={seatFormData.isActive}
                    onChange={(e) => setSeatFormData({ ...seatFormData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Active</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
              <Button onClick={() => setShowAddSeatModal(false)} variant="outline" className="px-6 py-3">
                Cancel
              </Button>
              <Button
                onClick={handleAddSeat}
                disabled={!seatFormData.seatNumber.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Seat
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Seats Alert Dialog */}
      <AlertDialog open={showDeleteAllSeatsModal} onOpenChange={setShowDeleteAllSeatsModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Seats?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete all {bus?.seats.length || 0} seat(s) and their associated seat
              statuses for this bus. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingSeats}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllSeats}
              disabled={isDeletingSeats}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingSeats ? 'Deleting...' : 'Delete All Seats'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Single Seat Alert Dialog */}
      <AlertDialog open={showDeleteSeatModal} onOpenChange={setShowDeleteSeatModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Seat?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this seat? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteSeat} className="bg-red-600 hover:bg-red-700">
              Delete Seat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
