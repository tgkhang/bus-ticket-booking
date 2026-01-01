'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { API_ROOT } from '@/lib/utils/constants'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

type StopItem = {
  id: string
  name: string
  address?: string | null
}

type RouteItem = {
  id: string
  name: string
  originStopName?: string | null
  destinationStopName?: string | null
}

export default function RoutesAndStopsPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stops, setStops] = useState<StopItem[]>([])
  const [routes, setRoutes] = useState<RouteItem[]>([])

  const [stopsPage, setStopsPage] = useState(1)
  const [routesPage, setRoutesPage] = useState(1)
  const [stopsTotalPages, setStopsTotalPages] = useState(1)
  const [routesTotalPages, setRoutesTotalPages] = useState(1)

  const trimmed = useMemo(() => query.trim(), [query])

  useEffect(() => {
    setStopsPage(1)
    setRoutesPage(1)
  }, [trimmed])

  useEffect(() => {
    const ac = new AbortController()

    const t = setTimeout(async () => {
      setLoading(true)
      setError(null)

      try {
        const limit = 5

        const stopParams = new URLSearchParams()
        if (trimmed) stopParams.set('q', trimmed)
        stopParams.set('limit', String(limit))
        stopParams.set('page', String(stopsPage))

        const routeParams = new URLSearchParams()
        if (trimmed) routeParams.set('q', trimmed)
        routeParams.set('limit', String(limit))
        routeParams.set('page', String(routesPage))

        const [stopsRes, routesRes] = await Promise.all([
          fetch(`${API_ROOT}/v1/stops/search?${stopParams.toString()}`, {
            cache: 'no-store',
            credentials: 'include',
            signal: ac.signal,
          }),
          fetch(`${API_ROOT}/v1/routes/search?${routeParams.toString()}`, {
            cache: 'no-store',
            credentials: 'include',
            signal: ac.signal,
          }),
        ])

        if (!stopsRes.ok) throw new Error(`Stops search failed (HTTP ${stopsRes.status})`)
        if (!routesRes.ok) throw new Error(`Routes search failed (HTTP ${routesRes.status})`)

        const stopsJson = await stopsRes.json()
        const routesJson = await routesRes.json()

        const stopsData = Array.isArray(stopsJson?.data) ? stopsJson.data : []
        const routesData = Array.isArray(routesJson?.data) ? routesJson.data : []
        const stopsPages = Number(stopsJson?.pagination?.totalPages || 1)
        const routesPages = Number(routesJson?.pagination?.totalPages || 1)

        setStops(stopsData)
        setRoutes(routesData)
        setStopsTotalPages(Number.isFinite(stopsPages) && stopsPages > 0 ? stopsPages : 1)
        setRoutesTotalPages(Number.isFinite(routesPages) && routesPages > 0 ? routesPages : 1)
      } catch (e: any) {
        if (e?.name === 'AbortError') return
        setStops([])
        setRoutes([])
        setStopsTotalPages(1)
        setRoutesTotalPages(1)
        setError(e?.message || 'Failed to load results')
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => {
      ac.abort()
      clearTimeout(t)
    }
  }, [trimmed, stopsPage, routesPage])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Stops & Routes</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Search for stops and routes.</p>
          </div>

          <Button type="button" variant="outline" onClick={() => router.back()} className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        <div className="mb-8">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stop or route (e.g. Ben Thanh, Sai Gon, HCMC...)"
            aria-label="Search stops and routes"
          />
          <div className="mt-2 min-h-5">
            {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Stops</h2>
            {stops.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {trimmed ? `No stops found for “${trimmed}”.` : 'No stops found.'}
              </p>
            ) : (
              <div className="space-y-3">
                {stops.map((s) => (
                  <div
                    key={s.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">{s.name}</p>
                    {s.address && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{s.address}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={loading || stopsPage <= 1}
                onClick={() => setStopsPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Page {Math.min(stopsPage, stopsTotalPages)} of {stopsTotalPages}
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={loading || stopsPage >= stopsTotalPages}
                onClick={() => setStopsPage((p) => Math.min(stopsTotalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Routes</h2>
            {routes.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {trimmed ? `No routes found for “${trimmed}”.` : 'No routes found.'}
              </p>
            ) : (
              <div className="space-y-3">
                {routes.map((r) => (
                  <div
                    key={r.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {(r.originStopName || '—') + ' → ' + (r.destinationStopName || '—')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{r.name}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={loading || routesPage <= 1}
                onClick={() => setRoutesPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Page {Math.min(routesPage, routesTotalPages)} of {routesTotalPages}
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={loading || routesPage >= routesTotalPages}
                onClick={() => setRoutesPage((p) => Math.min(routesTotalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
