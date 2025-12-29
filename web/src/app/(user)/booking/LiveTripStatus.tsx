'use client'

import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { useBookingSocket } from '@/contexts/BookingSocketContext'

function getTripStatusBadgeClass(status: string) {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-500 text-white'
    case 'active':
      return 'bg-green-500 text-white'
    case 'completed':
      return 'bg-gray-500 text-white'
    case 'cancelled':
      return 'bg-red-500 text-white'
    default:
      return 'bg-gray-400 text-white'
  }
}

export default function LiveTripStatus({
  tripId,
  initialStatus,
}: {
  tripId?: string | null
  initialStatus?: string | null
}) {
  const socket = useBookingSocket()
  const [status, setStatus] = useState<string>(initialStatus || '')

  useEffect(() => {
    setStatus(initialStatus || '')
  }, [initialStatus])

  useEffect(() => {
    if (!socket || !tripId) return

    const onTripStatusUpdated = (payload: { tripId: string; status: string }) => {
      if (!payload || payload.tripId !== tripId) return
      setStatus(payload.status)
    }

    socket.on('trip:statusUpdated', onTripStatusUpdated)

    return () => {
      socket.off('trip:statusUpdated', onTripStatusUpdated)
    }
  }, [socket, tripId])

  const label = useMemo(() => {
    if (!tripId) return '—'
    if (!status) return '—'
    return status
  }, [tripId, status])

  if (label === '—') {
    return <span className="text-gray-700 dark:text-gray-300">—</span>
  }

  return (
    <Badge className={`${getTripStatusBadgeClass(label)} px-3 py-1 rounded-full text-sm font-medium capitalize`}>
      {label}
    </Badge>
  )
}
