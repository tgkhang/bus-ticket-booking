'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { getBusDetailsAPI } from '@/lib/api'
import { amenityOptions } from '@/utils/constants'
import { Bus } from '@/types/api'
import Image from 'next/image'
import { organizeSeatsByFloor, organizeSeatsByRows, getSeatTypeBackgroundColor } from '@/utils/seatLayout'

export default function StaffBusDetailPage() {
  const params = useParams()
  const router = useRouter()
  const busId = params.id as string

  const [bus, setBus] = useState<Bus | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedFloor, setSelectedFloor] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const fetchBusDetails = async () => {
      try {
        setLoading(true)
        const response = await getBusDetailsAPI(busId)

        // Parse images if they're stored as JSON string
        if (response.images) {
          if (typeof response.images === 'string') {
            try {
              response.images = JSON.parse(response.images)
            } catch (e) {
              console.error('Failed to parse bus images:', e)
              response.images = []
            }
          }
        }

        setBus(response)
      } catch (error) {
        console.error('Error fetching bus details:', error)
        toast.error('Failed to fetch bus details')
      } finally {
        setLoading(false)
      }
    }

    fetchBusDetails()
  }, [busId])

  const handlePrevImage = () => {
    if (bus?.images && bus.images.length > 0) {
      const imagesLength = bus.images.length
      setCurrentImageIndex((prev) => (prev === 0 ? imagesLength - 1 : prev - 1))
    }
  }

  const handleNextImage = () => {
    if (bus?.images && bus.images.length > 0) {
      const imagesLength = bus.images.length
      setCurrentImageIndex((prev) => (prev === imagesLength - 1 ? 0 : prev + 1))
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

  if (!bus || loading) {
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
            onClick={() => router.push('/staff/buses')}
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Bus Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Plate Number</label>
                  <p className="text-gray-900 dark:text-white px-3 py-2">{bus.plateNumber}</p>
                </div>

                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Model</label>
                  <p className="text-gray-900 dark:text-white px-3 py-2">{bus.model}</p>
                </div>

                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Seat Capacity</label>
                  <p className="text-gray-900 dark:text-white px-3 py-2">{bus.seatCapacity} seats</p>
                </div>

                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Status</label>
                  <p className="text-gray-900 dark:text-white px-3 py-2 capitalize">{bus.status}</p>
                </div>

                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Amenities</label>
                  <div className="flex flex-wrap gap-2 min-h-[200px] content-start">
                    {Object.entries(bus.amenities).map(([key, value]) => {
                      if (!value) return null
                      const option = amenityOptions.find((a) => a.value === key)
                      if (!option) return null
                      const Icon = option.icon
                      return (
                        <div
                          key={key}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg h-fit"
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm">{option.label}</span>
                        </div>
                      )
                    })}
                  </div>
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

        {/* Bus Images Gallery */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  Bus Images
                </h2>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                  {bus.images?.length || 0} images
                </span>
              </div>

              {/* Image Slider */}
              {bus.images && bus.images.length > 0 ? (
                <div className="space-y-4">
                  {/* Main Image Slider */}
                  <div className="relative aspect-2/1 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-lg">
                    <Image
                      src={bus.images[currentImageIndex]}
                      alt={`Bus ${bus.plateNumber} - Image ${currentImageIndex + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 90vw"
                      priority
                    />

                    {/* Navigation Arrows */}
                    {bus.images.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all shadow-lg backdrop-blur-sm"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all shadow-lg backdrop-blur-sm"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 text-white rounded-full text-sm font-medium backdrop-blur-sm">
                      {currentImageIndex + 1} / {bus.images.length}
                    </div>
                  </div>

                  {/* Thumbnail Navigation */}
                  {bus.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {bus.images.map((imageUrl, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex
                              ? 'border-blue-500 ring-2 ring-blue-500/50'
                              : 'border-gray-300 dark:border-gray-700 hover:border-blue-400'
                          }`}
                        >
                          <Image
                            src={imageUrl}
                            alt={`Thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No images available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seat Layout - Read Only */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Seat Layout</h2>

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
          {bus.seats.length > 0 ? (
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
                              const sortedSeats = [...seatsInRow].sort((a, b) => {
                                const colA = a.seatNumber.replace(/\d/g, '')
                                const colB = b.seatNumber.replace(/\d/g, '')
                                return colA.localeCompare(colB)
                              })

                              const leftSeats: typeof bus.seats = []
                              const middleSeats: typeof bus.seats = []
                              const rightSeats: typeof bus.seats = []

                              const columns = [...new Set(sortedSeats.map((s) => s.seatNumber.replace(/\d/g, '')))]
                              const totalColumns = columns.length

                              sortedSeats.forEach((seat) => {
                                const col = seat.seatNumber.replace(/\d/g, '')
                                if (totalColumns === 2) {
                                  if (col === 'A') leftSeats.push(seat)
                                  else rightSeats.push(seat)
                                } else if (totalColumns === 3) {
                                  if (col === 'A') leftSeats.push(seat)
                                  else if (col === 'B') middleSeats.push(seat)
                                  else rightSeats.push(seat)
                                } else if (totalColumns >= 4) {
                                  if (col === 'A' || col === 'B') leftSeats.push(seat)
                                  else rightSeats.push(seat)
                                } else {
                                  leftSeats.push(seat)
                                }
                              })

                              return (
                                <div key={rowNum} className="flex items-center gap-3 justify-center">
                                  {/* Left seats */}
                                  <div className="flex gap-2">
                                    {leftSeats.map((seat) => (
                                      <div key={seat.id} className="relative">
                                        <div
                                          className={`w-12 h-12 rounded-lg text-white text-xs font-semibold flex items-center justify-center ${
                                            seat.isActive
                                              ? getSeatTypeBackgroundColor(seat.seatType)
                                              : 'bg-gray-300 dark:bg-gray-600'
                                          }`}
                                          title={`${seat.seatNumber} - ${seat.seatType} ${
                                            seat.isActive ? '(Active)' : '(Inactive)'
                                          }`}
                                        >
                                          {seat.seatNumber}
                                        </div>
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
                                          <div key={seat.id} className="relative">
                                            <div
                                              className={`w-12 h-12 rounded-lg text-white text-xs font-semibold flex items-center justify-center ${
                                                seat.isActive
                                                  ? getSeatTypeBackgroundColor(seat.seatType)
                                                  : 'bg-gray-300 dark:bg-gray-600'
                                              }`}
                                              title={`${seat.seatNumber} - ${seat.seatType} ${
                                                seat.isActive ? '(Active)' : '(Inactive)'
                                              }`}
                                            >
                                              {seat.seatNumber}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      <div className="w-8 border-l-2 border-r-2 border-dashed border-gray-300 dark:border-gray-600 h-12"></div>
                                    </>
                                  )}

                                  {/* Right seats */}
                                  <div className="flex gap-2">
                                    {rightSeats.map((seat) => (
                                      <div key={seat.id} className="relative">
                                        <div
                                          className={`w-12 h-12 rounded-lg text-white text-xs font-semibold flex items-center justify-center ${
                                            seat.isActive
                                              ? getSeatTypeBackgroundColor(seat.seatType)
                                              : 'bg-gray-300 dark:bg-gray-600'
                                          }`}
                                          title={`${seat.seatNumber} - ${seat.seatType} ${
                                            seat.isActive ? '(Active)' : '(Inactive)'
                                          }`}
                                        >
                                          {seat.seatNumber}
                                        </div>
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
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No seats configured for this bus</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
