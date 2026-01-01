'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { env } from '@/config/env'

const BookingSocketContext = createContext<Socket | null>(null)

export function BookingSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const newSocket = io(env.API_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  const value = useMemo(() => socket, [socket])

  return <BookingSocketContext.Provider value={value}>{children}</BookingSocketContext.Provider>
}

export function useBookingSocket() {
  return useContext(BookingSocketContext)
}
