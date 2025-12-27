'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function OAuthSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isInitialized, user } = useAuth()

  useEffect(() => {
    // Wait for auth to initialize
    if (!isInitialized) {
      return
    }

    // Add a small delay to allow browser/extensions to complete async operations
    // This prevents "Unchecked runtime.lastError" warnings from Chrome extensions
    const timer = setTimeout(() => {
      // Once initialized, check if authenticated
      if (isAuthenticated && user) {
        // Get callback URL from search params
        const callbackUrl = searchParams.get('callbackUrl')

        // Role-based routing
        if (callbackUrl) {
          router.push(decodeURIComponent(callbackUrl))
        } else if (user.role === 'admin') {
          router.push('/admin')
        } else if (user.role === 'staff') {
          router.push('/staff')
        } else if (user.role === 'operator') {
          router.push('/operator')
        } else {
          router.push('/')
        }
      } else {
        // Not authenticated, redirect to login
        router.push('/login?error=oauth_auth_failed')
      }
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [isAuthenticated, isInitialized, user, router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Completing your login...</p>
      </div>
    </div>
  )
}
