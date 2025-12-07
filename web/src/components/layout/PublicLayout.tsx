'use client'

import { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

interface PublicLayoutProps {
  children: ReactNode
}

/**
 * Public layout component for guest pages (home, login, register, etc.)
 * Includes Header and Footer with responsive design
 */
export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
