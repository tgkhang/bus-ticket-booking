'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Route } from 'lucide-react'

export default function RoutesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Route Management</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-center gap-4 py-12">
            <Route className="w-16 h-16 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Route management functionality will be available soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
