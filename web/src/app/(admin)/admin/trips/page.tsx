'use client'

import { useState } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  X,
  Calendar,
  Clock,
  DollarSign,
  Bus,
  Users,
  CheckCircle,
  XCircle,
  PlayCircle,
} from 'lucide-react'
import { Trip, TripStatus } from '@/types/trip'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function TripManagementPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: '1',
      routeId: 'r1',
      routeName: 'HCMC - Da Lat Express',
      originStop: 'Ho Chi Minh City Terminal',
      destinationStop: 'Da Lat Bus Station',
      distanceKm: 308,
      busId: 'b1',
      busPlateNumber: '59A-12345',
      busModel: 'Mercedes Sprinter',
      busCapacity: 45,
      busAmenities: ['wifi', 'ac', 'usb'],
      operatorId: 'op1',
      operatorName: 'National Express Vietnam',
      operatorPhone: '+84 123 456 789',
      operatorEmail: 'contact@nationalexpress.vn',
      departureTime: '2024-12-01T08:00:00',
      arrivalTime: '2024-12-01T14:30:00',
      basePrice: 350000,
      seatsBooked: 33,
      totalSeats: 45,
      status: 'completed',
    },
    {
      id: '2',
      routeId: 'r2',
      routeName: 'Hanoi - Ha Long Bay Route',
      originStop: 'Hanoi Central Station',
      destinationStop: 'Ha Long Bay Terminal',
      distanceKm: 165,
      busId: 'b2',
      busPlateNumber: '51B-67890',
      busModel: 'Hyundai Universe',
      busCapacity: 40,
      busAmenities: ['wifi', 'ac'],
      operatorId: 'op2',
      operatorName: 'Vietnam Tours',
      operatorPhone: '+84 987 654 321',
      operatorEmail: 'info@vietnamtours.vn',
      departureTime: '2024-12-15T09:00:00',
      arrivalTime: '2024-12-15T12:45:00',
      basePrice: 180000,
      seatsBooked: 28,
      totalSeats: 40,
      status: 'active',
    },
    {
      id: '3',
      routeId: 'r1',
      routeName: 'HCMC - Da Lat Express',
      originStop: 'Ho Chi Minh City Terminal',
      destinationStop: 'Da Lat Bus Station',
      distanceKm: 308,
      busId: 'b1',
      busPlateNumber: '59A-12345',
      busModel: 'Mercedes Sprinter',
      busCapacity: 45,
      busAmenities: ['wifi', 'ac', 'usb'],
      operatorId: 'op1',
      operatorName: 'National Express Vietnam',
      operatorPhone: '+84 123 456 789',
      operatorEmail: 'contact@nationalexpress.vn',
      departureTime: '2024-12-20T14:00:00',
      arrivalTime: '2024-12-20T20:30:00',
      basePrice: 350000,
      seatsBooked: 12,
      totalSeats: 45,
      status: 'scheduled',
    },
    {
      id: '4',
      routeId: 'r3',
      routeName: 'Da Nang - Hue Coastal',
      originStop: 'Da Nang Station',
      destinationStop: 'Hue Bus Terminal',
      distanceKm: 105,
      busId: 'b3',
      busPlateNumber: '29C-11111',
      busModel: 'Thaco TB120S',
      busCapacity: 35,
      busAmenities: ['ac'],
      operatorId: 'op3',
      operatorName: 'Coastal Express',
      operatorPhone: '+84 555 123 456',
      operatorEmail: 'contact@coastalexpress.vn',
      departureTime: '2024-12-18T07:30:00',
      arrivalTime: '2024-12-18T10:00:00',
      basePrice: 120000,
      seatsBooked: 0,
      totalSeats: 35,
      status: 'cancelled',
    },
  ])

  const [routes] = useState([
    { id: 'r1', name: 'HCMC - Da Lat Express' },
    { id: 'r2', name: 'Hanoi - Ha Long Bay Route' },
    { id: 'r3', name: 'Da Nang - Hue Coastal' },
  ])

  const [buses] = useState([
    { id: 'b1', info: '59A-12345 - Mercedes Sprinter (45 seats)', capacity: 45 },
    { id: 'b2', info: '51B-67890 - Hyundai Universe (40 seats)', capacity: 40 },
    { id: 'b3', info: '29C-11111 - Thaco TB120S (35 seats)', capacity: 35 },
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const [formData, setFormData] = useState({
    routeId: '',
    busId: '',
    departureTime: '',
    arrivalTime: '',
    basePrice: 0,
    status: 'scheduled' as TripStatus,
  })

  const handleOpenModal = (trip?: Trip) => {
    if (trip) {
      setEditingTrip(trip)
      setFormData({
        routeId: trip.routeId,
        busId: trip.busId,
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        basePrice: trip.basePrice,
        status: trip.status,
      })
    } else {
      setEditingTrip(null)
      setFormData({
        routeId: '',
        busId: '',
        departureTime: '',
        arrivalTime: '',
        basePrice: 0,
        status: 'scheduled',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTrip(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const route = routes.find((r) => r.id === formData.routeId)
    const bus = buses.find((b) => b.id === formData.busId)

    if (editingTrip) {
      setTrips(
        trips.map((trip) =>
          trip.id === editingTrip.id
            ? {
                ...trip,
                ...formData,
                routeName: route?.name || '',
                busPlateNumber: bus?.info.split(' - ')[0] || '',
                busModel: bus?.info.split(' - ')[1]?.split(' (')[0] || '',
                totalSeats: bus?.capacity || 0,
                busCapacity: bus?.capacity || 0,
              }
            : trip
        )
      )
    } else {
      const newTrip: Trip = {
        id: Date.now().toString(),
        ...formData,
        routeName: route?.name || '',
        originStop: 'Origin Stop',
        destinationStop: 'Destination Stop',
        distanceKm: 0,
        busPlateNumber: bus?.info.split(' - ')[0] || '',
        busModel: bus?.info.split(' - ')[1]?.split(' (')[0] || '',
        busAmenities: [],
        operatorId: 'op1',
        operatorName: 'Default Operator',
        operatorPhone: '+84 000 000 000',
        operatorEmail: 'operator@example.com',
        seatsBooked: 0,
        totalSeats: bus?.capacity || 0,
        busCapacity: bus?.capacity || 0,
      }
      setTrips([...trips, newTrip])
    }

    handleCloseModal()
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      setTrips(trips.filter((trip) => trip.id !== id))
    }
  }

  const filteredTrips = trips.filter((trip) => filterStatus === 'all' || trip.status === filterStatus)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge
            variant="default"
            className="gap-1 bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
          >
            <Calendar className="w-4 h-4" />
            Scheduled
          </Badge>
        )
      case 'active':
        return (
          <Badge
            variant="default"
            className="gap-1 bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300"
          >
            <PlayCircle className="w-4 h-4" />
            Active
          </Badge>
        )
      case 'completed':
        return (
          <Badge
            variant="default"
            className="gap-1 bg-gray-100 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
          >
            <CheckCircle className="w-4 h-4" />
            Completed
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge
            variant="default"
            className="gap-1 bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900 dark:text-red-300"
          >
            <XCircle className="w-4 h-4" />
            Cancelled
          </Badge>
        )
      default:
        return null
    }
  }

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 80) return 'text-red-600 dark:text-red-400'
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Trip Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Schedule and manage bus trips</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Schedule Trip
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Trips</p>
                <p className="text-gray-900 dark:text-white text-2xl font-bold">{trips.length}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <Bus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Scheduled</p>
                <p className="text-gray-900 dark:text-white text-2xl font-bold">
                  {trips.filter((t) => t.status === 'scheduled').length}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Active</p>
                <p className="text-gray-900 dark:text-white text-2xl font-bold">
                  {trips.filter((t) => t.status === 'active').length}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <PlayCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Revenue</p>
                <p className="text-gray-900 dark:text-white text-2xl font-bold">
                  ₫{(trips.reduce((acc, t) => acc + t.basePrice * t.seatsBooked, 0) / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card className="mb-6">
        <div className="flex gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
          {[
            { value: 'all', label: 'All Trips' },
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
          ].map((filter) => (
            <Button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value)}
              variant={filterStatus === filter.value ? 'default' : 'outline'}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Trips Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Route</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Bus</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Departure</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Arrival</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Price</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Occupancy</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTrips.map((trip) => {
                const occupancyPercentage = (trip.seatsBooked / trip.totalSeats) * 100
                return (
                  <tr
                    key={trip.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => router.push(`/admin/trips/${trip.id}`)}
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/trips/${trip.id}`}
                        className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                      >
                        {trip.routeName}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        {trip.busPlateNumber} - {trip.busModel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(trip.departureTime).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {new Date(trip.departureTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(trip.arrivalTime).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {new Date(trip.arrivalTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 dark:text-white">₫{trip.basePrice.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {trip.seatsBooked}/{trip.totalSeats}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              occupancyPercentage >= 80
                                ? 'bg-red-500'
                                : occupancyPercentage >= 50
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${occupancyPercentage}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm ${getOccupancyColor(occupancyPercentage)}`}>
                          {occupancyPercentage.toFixed(0)}% full
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(trip.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenModal(trip)
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900"
                        >
                          <Edit className="w-5 h-5" />
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(trip.id)
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingTrip ? 'Edit Trip' : 'Schedule New Trip'}
              </h2>
              <Button
                onClick={handleCloseModal}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                {/* Route & Bus */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                      Route <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.routeId}
                      onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                      required
                    >
                      <option value="">Select Route</option>
                      {routes.map((route) => (
                        <option key={route.id} value={route.id}>
                          {route.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                      Bus <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.busId}
                      onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                      required
                    >
                      <option value="">Select Bus</option>
                      {buses.map((bus) => (
                        <option key={bus.id} value={bus.id}>
                          {bus.info}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Departure & Arrival Times */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                      Departure Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.departureTime.slice(0, 16)}
                      onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                      Arrival Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.arrivalTime.slice(0, 16)}
                      onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                      required
                    />
                  </div>
                </div>

                {/* Price & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                      Base Price (VND) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                      min="0"
                      step="1000"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as TripStatus,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button type="button" onClick={handleCloseModal} variant="outline">
                  Cancel
                </Button>
                <Button type="submit">{editingTrip ? 'Update Trip' : 'Schedule Trip'}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
