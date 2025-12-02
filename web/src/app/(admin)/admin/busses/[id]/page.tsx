'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Edit, Save, X, Plus, Grid, Wifi, Wind, Droplet, Usb, AlertCircle } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Seat {
  id: string
  busId: string
  seatNumber: string
  seatType: 'regular' | 'premium' | 'sleeper'
  isActive: boolean
}

interface Bus {
  id: string
  operatorId: string
  plateNumber: string
  model: string
  seatCapacity: number
  amenities: string[]
  status: 'active' | 'inactive' | 'maintenance'
  seats: Seat[]
}

export default function BusDetailPage() {
  const params = useParams()
  const router = useRouter()
  const busId = params.id as string

  const [bus, setBus] = useState<Bus | null>(null)
  const [isEditingBus, setIsEditingBus] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showAddSeatModal, setShowAddSeatModal] = useState(false)

  const [busFormData, setBusFormData] = useState({
    plateNumber: '',
    model: '',
    seatCapacity: 0,
    amenities: [] as string[],
    status: 'active' as 'active' | 'inactive' | 'maintenance',
  })

  const [generateFormData, setGenerateFormData] = useState({
    layout: '2-2' as '2-2' | '2-3' | '1-2' | '2-1',
    rows: 10,
    seatType: 'regular' as 'regular' | 'premium' | 'sleeper',
    startRow: 1,
  })

  const [seatFormData, setSeatFormData] = useState({
    seatNumber: '',
    seatType: 'regular' as 'regular' | 'premium' | 'sleeper',
    isActive: true,
  })

  const amenityOptions = [
    { value: 'wifi', label: 'WiFi', icon: Wifi },
    { value: 'ac', label: 'AC', icon: Wind },
    { value: 'toilet', label: 'Toilet', icon: Droplet },
    { value: 'usb', label: 'USB', icon: Usb },
  ]

  // Mock data - Replace with API call
  useEffect(() => {
    // Simulate API call
    const mockBus: Bus = {
      id: busId || '1',
      operatorId: 'op1',
      plateNumber: '59A-12345',
      model: 'Mercedes Sprinter',
      seatCapacity: 45,
      amenities: ['wifi', 'ac', 'usb'],
      status: 'active',
      seats: [
        { id: 's1', busId: busId || '1', seatNumber: 'A1', seatType: 'premium', isActive: true },
        { id: 's2', busId: busId || '1', seatNumber: 'A2', seatType: 'premium', isActive: true },
        { id: 's3', busId: busId || '1', seatNumber: 'A3', seatType: 'regular', isActive: true },
        { id: 's4', busId: busId || '1', seatNumber: 'A4', seatType: 'regular', isActive: true },
        { id: 's5', busId: busId || '1', seatNumber: 'B1', seatType: 'regular', isActive: true },
        { id: 's6', busId: busId || '1', seatNumber: 'B2', seatType: 'regular', isActive: true },
        { id: 's7', busId: busId || '1', seatNumber: 'B3', seatType: 'regular', isActive: true },
        { id: 's8', busId: busId || '1', seatNumber: 'B4', seatType: 'regular', isActive: false },
      ],
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBus(mockBus)
    setBusFormData({
      plateNumber: mockBus.plateNumber,
      model: mockBus.model,
      seatCapacity: mockBus.seatCapacity,
      amenities: mockBus.amenities,
      status: mockBus.status,
    })
  }, [busId])

  const handleSaveBusDetails = () => {
    if (bus) {
      setBus({ ...bus, ...busFormData })
      setIsEditingBus(false)
      toast.success('Bus details updated successfully')
      // TODO: Call API to update bus
    }
  }

  const toggleAmenity = (amenity: string) => {
    if (busFormData.amenities.includes(amenity)) {
      setBusFormData({
        ...busFormData,
        amenities: busFormData.amenities.filter((a) => a !== amenity),
      })
    } else {
      setBusFormData({
        ...busFormData,
        amenities: [...busFormData.amenities, amenity],
      })
    }
  }

  const handleGenerateSeats = () => {
    // TODO: Call API to generate seats
    console.log('Generating seats:', generateFormData)
    setShowGenerateModal(false)
    toast.success('Seats generated successfully')
    // Refresh bus data after generation
  }

  const handleAddSeat = () => {
    if (bus) {
      const newSeat: Seat = {
        id: `s${Date.now()}`,
        busId: bus.id,
        ...seatFormData,
      }
      setBus({ ...bus, seats: [...bus.seats, newSeat] })
      setShowAddSeatModal(false)
      setSeatFormData({
        seatNumber: '',
        seatType: 'regular',
        isActive: true,
      })
      toast.success('Seat added successfully')
      // TODO: Call API to add seat
    }
  }

  const handleDeleteSeat = (seatId: string) => {
    if (window.confirm('Are you sure you want to delete this seat?')) {
      if (bus) {
        setBus({ ...bus, seats: bus.seats.filter((s) => s.id !== seatId) })
        toast.success('Seat deleted successfully')
        // TODO: Call API to delete seat
      }
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
                      onClick={handleSaveBusDetails}
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingBus(false)
                        setBusFormData({
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
                      value={busFormData.plateNumber}
                      onChange={(e) => setBusFormData({ ...busFormData, plateNumber: e.target.value })}
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
                      value={busFormData.model}
                      onChange={(e) => setBusFormData({ ...busFormData, model: e.target.value })}
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
                      value={busFormData.seatCapacity}
                      onChange={(e) => setBusFormData({ ...busFormData, seatCapacity: parseInt(e.target.value) || 0 })}
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
                      value={busFormData.status}
                      onChange={(e) =>
                        setBusFormData({
                          ...busFormData,
                          status: e.target.value as 'active' | 'inactive' | 'maintenance',
                        })
                      }
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
                        return (
                          <button
                            key={amenity.value}
                            type="button"
                            onClick={() => toggleAmenity(amenity.value)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                              busFormData.amenities.includes(amenity.value)
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
                      {bus.amenities.map((amenity) => {
                        const option = amenityOptions.find((a) => a.value === amenity)
                        if (!option) return null
                        const Icon = option.icon
                        return (
                          <div
                            key={amenity}
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

              {/* Seat Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {bus.seats.map((seat) => (
                  <div key={seat.id} className="relative group">
                    <button
                      onClick={() => handleToggleSeatStatus(seat.id)}
                      className={`w-full aspect-square rounded-lg text-white transition-all ${
                        seat.isActive ? getSeatTypeColor(seat.seatType) : 'bg-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-sm">{seat.seatNumber}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeleteSeat(seat.id)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
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
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Layout Pattern</label>
                <select
                  value={generateFormData.layout}
                  onChange={(e) =>
                    setGenerateFormData({
                      ...generateFormData,
                      layout: e.target.value as '2-2' | '2-3' | '1-2' | '2-1',
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="2-2">2-2 (Standard)</option>
                  <option value="2-3">2-3 (Wide)</option>
                  <option value="1-2">1-2 (VIP)</option>
                  <option value="2-1">2-1 (Luxury)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Number of Rows</label>
                <input
                  type="number"
                  value={generateFormData.rows}
                  onChange={(e) => setGenerateFormData({ ...generateFormData, rows: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  min="1"
                  max="20"
                />
              </div>

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

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Start Row Number</label>
                <input
                  type="number"
                  value={generateFormData.startRow}
                  onChange={(e) =>
                    setGenerateFormData({ ...generateFormData, startRow: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  min="1"
                />
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
              <Button onClick={handleGenerateSeats} className="px-6 py-3 bg-blue-600 hover:bg-blue-700">
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
              <Button onClick={handleAddSeat} className="px-6 py-3 bg-blue-600 hover:bg-blue-700">
                Add Seat
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
