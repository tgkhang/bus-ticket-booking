'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Ticket } from 'lucide-react'

export default function BookingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Booking Management</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-center gap-4 py-12">
            <Ticket className="w-16 h-16 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Booking management functionality will be available soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
