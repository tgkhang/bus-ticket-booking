'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, X, Wifi, Wind, Droplet, Usb } from 'lucide-react'

interface Bus {
  id: string
  plateNumber: string
  model: string
  capacity: number
  amenities: string[]
  status: 'active' | 'inactive' | 'maintenance'
}

export default function BusManagementPage() {
  const [buses, setBuses] = useState<Bus[]>([
    {
      id: '1',
      plateNumber: '59A-12345',
      model: 'Mercedes Sprinter',
      capacity: 45,
      amenities: ['wifi', 'ac', 'usb'],
      status: 'active',
    },
    {
      id: '2',
      plateNumber: '51B-67890',
      model: 'Hyundai Universe',
      capacity: 40,
      amenities: ['wifi', 'ac', 'usb', 'toilet'],
      status: 'active',
    },
    {
      id: '3',
      plateNumber: '29C-11111',
      model: 'Thaco TB120S',
      capacity: 35,
      amenities: ['wifi', 'ac'],
      status: 'maintenance',
    },
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingBus, setEditingBus] = useState<Bus | null>(null)
  const [formData, setFormData] = useState({
    plateNumber: '',
    model: '',
    capacity: 0,
    amenities: [] as string[],
    status: 'active' as 'active' | 'inactive' | 'maintenance',
  })

  const amenityOptions = [
    { value: 'wifi', label: 'WiFi', icon: Wifi },
    { value: 'ac', label: 'AC', icon: Wind },
    { value: 'toilet', label: 'Toilet', icon: Droplet },
    { value: 'usb', label: 'USB', icon: Usb },
  ]

  const handleOpenModal = (bus?: Bus) => {
    if (bus) {
      setEditingBus(bus)
      setFormData({
        plateNumber: bus.plateNumber,
        model: bus.model,
        capacity: bus.capacity,
        amenities: bus.amenities,
        status: bus.status,
      })
    } else {
      setEditingBus(null)
      setFormData({
        plateNumber: '',
        model: '',
        capacity: 0,
        amenities: [],
        status: 'active',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingBus(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingBus) {
      setBuses(buses.map((bus) => (bus.id === editingBus.id ? { ...bus, ...formData } : bus)))
    } else {
      const newBus: Bus = {
        id: Date.now().toString(),
        ...formData,
      }
      setBuses([...buses, newBus])
    }

    handleCloseModal()
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      setBuses(buses.filter((bus) => bus.id !== id))
    }
  }

  const toggleAmenity = (amenity: string) => {
    if (formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter((a) => a !== amenity),
      })
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity],
      })
    }
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bus Management</h1>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add New Bus
        </Button>
      </div>

      {/* Buses Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Plate Number
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Amenities
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {buses.map((bus) => (
                  <tr
                    key={bus.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {bus.plateNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {bus.model}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {bus.capacity} seats
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {bus.amenities.map((amenity) => {
                          const option = amenityOptions.find((a) => a.value === amenity)
                          if (!option) return null
                          const Icon = option.icon
                          return (
                            <div
                              key={amenity}
                              className="text-gray-500 dark:text-gray-400"
                              title={option.label}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                          )
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          bus.status
                        )}`}
                      >
                        {bus.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(bus)}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(bus.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
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
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingBus ? 'Edit Bus' : 'Add New Bus'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Plate Number
                    </label>
                    <input
                      type="text"
                      value={formData.plateNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, plateNumber: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Model
                    </label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Capacity (seats)
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })
                      }
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as 'active' | 'inactive' | 'maintenance',
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Amenities
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {amenityOptions.map((amenity) => {
                      const Icon = amenity.icon
                      return (
                        <label
                          key={amenity.value}
                          className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.amenities.includes(amenity.value)}
                            onChange={() => toggleAmenity(amenity.value)}
                            className="rounded text-blue-600 focus:ring-blue-600"
                          />
                          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {amenity.label}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button type="submit" className="flex-1">
                  {editingBus ? 'Update Bus' : 'Add Bus'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1"
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
