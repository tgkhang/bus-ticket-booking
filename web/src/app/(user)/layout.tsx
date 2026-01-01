'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import ChatWidget from '@/components/chat/ChatWidget'

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isInitialized && isAuthenticated && user) {
      // Redirect staff to staff portal
      if (user.role === 'staff') {
        router.push('/staff')
        return
      }
      // Redirect operator to operator portal
      if (user.role === 'operator') {
        router.push('/operator')
        return
      }
      // Redirect admin to admin portal if accessing booking/profile pages
      if (user.role === 'admin' && (pathname.startsWith('/booking') || pathname.startsWith('/profile'))) {
        router.push('/admin')
        return
      }
    }
  }, [isAuthenticated, isInitialized, user, router, pathname])

  // Show loading state while checking auth
  if (isInitialized && isAuthenticated && user && (user.role === 'staff' || user.role === 'operator')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}
