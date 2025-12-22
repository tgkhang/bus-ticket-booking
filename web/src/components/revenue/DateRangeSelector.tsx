// components/DateRangeSelector.tsx (phiên bản fallback - chạy ngay)
"use client"

import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"

export default function DateRangeSelector({ value, onChange }: { 
  value: { from?: string; to?: string }
  onChange: (range: { from?: string; to?: string }) => void 
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <input
          type="date"
          value={value.from || ''}
          onChange={(e) => onChange({ ...value, from: e.target.value || undefined })}
          className="pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-sm"
        />
      </div>
      <span className="text-gray-500">→</span>
      <div className="relative">
        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <input
          type="date"
          value={value.to || ''}
          onChange={(e) => onChange({ ...value, to: e.target.value || undefined })}
          className="pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-sm"
        />
      </div>
    </div>
  )
}