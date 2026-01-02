'use client'

import { useState, useEffect } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { listBusesAPI, listOperatorsAPI } from '@/lib/api'
import type { Bus } from '@/types/api'
import { toast } from 'sonner'
import { amenityOptions, ITEMS_PER_PAGE } from '@/utils/constants'
import { useRouter } from 'next/navigation'
import { Operator } from '@/types/operator'
import { useAuth } from '@/hooks/useAuth'

export default function BusManagementPage() {
  const [buses, setBuses] = useState<Bus[]>([])
  const [operators, setOperators] = useState<Operator[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingOperators, setLoadingOperators] = useState(false)
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)

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
      const response = await listBusesAPI({ operatorId: user?.operatorId }, { page: 1, limit: 100 })
      setBuses(response.data)
    } catch (error) {
      toast.error('Failed to fetch buses')
      console.error('Error fetching buses:', error)
    } finally {
      setLoading(false)
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

  // Filter buses based on search query
  const filteredBuses = buses.filter((bus) => {
    const query = searchQuery.toLowerCase()
    return bus.plateNumber.toLowerCase().includes(query) || bus.model.toLowerCase().includes(query)
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

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const router = useRouter()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Operator&apos;s Buses</h1>
          <p className="text-gray-600">{user?.operatorName}</p>
        </div>
      </div>

      {/* Search Panel */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by plate number or model..."
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentBuses.map((bus) => {
                    const activeAmenities = Object.entries(bus.amenities)
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      .filter(([_, value]) => value)
                      .map(([key]) => key)

                    return (
                      <tr
                        key={bus.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => router.push(`/staff/buses/${bus.id}`)}
                      >
                        <td className="px-6 py-4 text-base text-gray-900 dark:text-gray-100">{bus.plateNumber}</td>
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
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && buses.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, buses.length)} of {buses.length} buses
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
    </div>
  )
}
