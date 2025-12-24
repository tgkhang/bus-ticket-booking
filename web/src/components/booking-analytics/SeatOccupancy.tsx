import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CircleGauge } from 'lucide-react'

interface SeatOccupancyProps {
  occupancy: number
}

export default function SeatOccupancy({ occupancy }: SeatOccupancyProps) {
  // Clamp occupancy between 0 and 100
  const percent = Math.max(0, Math.min(occupancy, 100));
  const radius = 110;
  const stroke = 18;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = circumference * (1 - percent / 100);

  return (
    <Card className="flex flex-col h-full justify-between">
      <CardHeader>
        <CardTitle>Seat Occupancy</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center items-center">
        <div className="flex flex-1 flex-col justify-center items-center min-h-[340px]">
          <div className="relative flex items-center justify-center" style={{ minHeight: 240 }}>
            <svg width={radius * 2} height={radius * 2} className="block drop-shadow-md">
              <defs>
                <linearGradient id="occupancy-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#a3e635" />
                  <stop offset="50%" stopColor="#facc15" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              {/* Background circle */}
              <circle
                cx={radius}
                cy={radius}
                r={normalizedRadius}
                fill="none"
                stroke="#f3f4f6"
                strokeWidth={stroke}
              />
              {/* Progress circle */}
              <circle
                cx={radius}
                cy={radius}
                r={normalizedRadius}
                fill="none"
                stroke="url(#occupancy-gradient)"
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={progress}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(.4,2,.6,1)' }}
                transform={`rotate(-90 ${radius} ${radius})`}
                filter="drop-shadow(0 2px 8px #facc1540)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <CircleGauge className="w-16 h-16 text-gray-400 mb-2" />
              <span className="text-6xl font-extrabold text-gray-900 dark:text-white">
                {percent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500 text-center mt-2">
          Based on confirmed and completed bookings
        </div>
      </CardContent>
    </Card>
  );
}