'use client'

import { useEffect } from 'react'
import { unlockSeatsAPI } from '@/lib/api'
import { BookingSocketProvider } from '@/contexts/BookingSocketContext'
import { API_ROOT } from '@/lib/utils/constants'

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const unlockAllPendingSeatsBestEffort = () => {
      try {
        Object.keys(sessionStorage).forEach((key) => {
          if (!key.startsWith('pending_seats_')) return

          const tripId = key.replace('pending_seats_', '')
          const seatIds = JSON.parse(sessionStorage.getItem(key) || '[]')
          if (!Array.isArray(seatIds) || seatIds.length === 0) return

          // Best-effort request that can survive page close
          // (cookies are httpOnly; credentials: 'include' is required)
          fetch(`${API_ROOT}/v1/seats/unlock`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tripId, seatIds }),
            keepalive: true,
          }).catch(() => {})
        })
      } catch {
        // ignore
      }
    }

    // Fires on tab close / page navigation (more reliable than React unmount cleanup)
    window.addEventListener('pagehide', unlockAllPendingSeatsBestEffort)

    // Cleanup function when the component unmounts
    return () => {
      window.removeEventListener('pagehide', unlockAllPendingSeatsBestEffort)

      // We need to check if we are navigating away from the booking flow
      // Since we can't easily know the next path in the cleanup function,
      // we rely on the fact that this layout unmounts when leaving the booking section.
      
      // Check for any pending seats in session storage
      // We iterate through all keys to find pending seats
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('pending_seats_')) {
          const tripId = key.replace('pending_seats_', '')
          try {
            const seatIds = JSON.parse(sessionStorage.getItem(key) || '[]')
            if (seatIds.length > 0) {
              // Use sendBeacon for reliable execution during unload/navigation
              // But sendBeacon requires a different payload format or a specific endpoint that accepts text/plain or FormData
              // Since our API expects JSON, we can try fetch with keepalive
              
              // However, we need the auth token. 
              // If we use the API client, it might be cancelled.
              // Let's try to use the API client first.
              unlockSeatsAPI(tripId, seatIds).catch(err => console.error('Failed to unlock seats on exit', err))
              
              // Clear the storage
              sessionStorage.removeItem(key)
            }
          } catch (e) {
            console.error('Error parsing pending seats', e)
          }
        }
      })
    }
  }, []) // Empty dependency array means this runs once on mount and cleanup on unmount

  return <BookingSocketProvider>{children}</BookingSocketProvider>
}
