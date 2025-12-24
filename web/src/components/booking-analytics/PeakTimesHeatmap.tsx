import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResponsiveContainer, Surface, Rectangle } from 'recharts'

interface PeakTimesHeatmapProps {
  peakTimes: Array<{ date: string; hour: number; count: number }>
}

function getCellColor(count: number, max: number) {
  if (max === 0) return 'var(--tw-bg-opacity, 1) * #e5f6d7' // light gray fallback
  const ratio = count / max
  if (ratio < 0.15) return '#e5f6d7' // green-100
  if (ratio < 0.35) return '#a3e635' // green-400
  if (ratio < 0.55) return '#fde047' // yellow-400
  if (ratio < 0.75) return '#fb923c' // orange-500
  return '#ef4444' // red-500
}

export default function PeakTimesHeatmapFixed({ peakTimes }: PeakTimesHeatmapProps) {
  const uniqueDates = Array.from(new Set(peakTimes.map(item => item.date))).sort()
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const minCardWidth = 600
  let cellWidth = 32
  let cellHeight = 22
  let fontSize = 12
  let headerFontSize = 14
  let rotateHeader = false

  if (uniqueDates.length * cellWidth < minCardWidth) {
    cellWidth = Math.max(40, Math.floor((minCardWidth - 0.1) / Math.max(1, uniqueDates.length)))
    cellHeight = 32
    fontSize = 15
    headerFontSize = 18
  } else if (uniqueDates.length <= 20) {
    cellWidth = 36
    cellHeight = 26
    fontSize = 13
    headerFontSize = 15
  } else if (uniqueDates.length <= 40) {
    cellWidth = 20
    cellHeight = 18
    fontSize = 11
    headerFontSize = 12
    rotateHeader = true
  } else {
    cellWidth = 14
    cellHeight = 14
    fontSize = 9
    headerFontSize = 10
    rotateHeader = true
  }

  const matrix = hours.map(hour => uniqueDates.map(date => {
    const found = peakTimes.find(pt => pt.date === date && pt.hour === hour)
    return found ? found.count : 0
  }))

  const max = Math.max(...matrix.flat(), 1)

  const [tooltip, setTooltip] = React.useState<null | { x: number; y: number; value: number; date: string; hour: number }>(null)
  const [hoverCell, setHoverCell] = React.useState<null | { i: number; j: number }>(null)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle>Peak Booking Times (Heatmap)</CardTitle>
      </CardHeader>
      <CardContent>
        {uniqueDates.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">No booking data for the selected date range</div>
        ) : (
          <div className="w-full overflow-x-auto" style={{ position: 'relative' }}>
            <div style={{ minWidth: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Header Dates */}
              <div style={{ marginLeft: 80, width: uniqueDates.length * cellWidth }}>
                {rotateHeader ? (
                  <svg width={uniqueDates.length * cellWidth} height={cellWidth * 1.2} style={{ display: 'block', overflow: 'visible' }}>
                    {uniqueDates.map((date, idx) => (
                      <g key={date} transform={`translate(${idx * cellWidth + cellWidth / 2},${cellWidth * 0.6})`} onMouseEnter={() => setHoverCell({ i: -1, j: idx })} onMouseLeave={() => setHoverCell(null)} style={{ cursor: 'pointer' }}>
                        <text transform="rotate(-65)" fontSize={headerFontSize} fill="currentColor" fontWeight={hoverCell && hoverCell.j === idx ? 700 : 500} textAnchor="middle" className="text-gray-900 dark:text-gray-100" style={{ userSelect: 'none' }}>
                          {date.slice(5)}
                        </text>
                      </g>
                    ))}
                  </svg>
                ) : (
                  <div style={{ display: 'flex', color: 'currentColor' }} className="text-gray-900 dark:text-gray-100">
                    {uniqueDates.map((date, idx) => (
                      <div key={date} title={date} onMouseEnter={() => setHoverCell({ i: -1, j: idx })} onMouseLeave={() => setHoverCell(null)} style={{ width: cellWidth, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: headerFontSize, fontWeight: hoverCell && hoverCell.j === idx ? 700 : 500 }}>
                        {date.slice(5)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Grid */}
              <div style={{ display: 'flex' }}>
                {/* Hours */}
                <div style={{ width: 80, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: rotateHeader ? cellWidth * 1.2 : 2, marginRight: 12 }}>
                  {hours.map((hour, i) => (
                    <div key={hour} onMouseEnter={() => setHoverCell({ i, j: -1 })} onMouseLeave={() => setHoverCell(null)} style={{ height: cellHeight, fontSize: fontSize + 2, color: 'currentColor', lineHeight: `${cellHeight}px`, fontWeight: 500 }} className="text-gray-700 dark:text-gray-300">
                      {hour}
                    </div>
                  ))}
                </div>

                {/* Cells */}
                <div style={{ width: uniqueDates.length * cellWidth, height: cellHeight * 24, position: 'relative', marginTop: rotateHeader ? cellWidth * 1.2 : 0 }}>
                  <ResponsiveContainer width={uniqueDates.length * cellWidth} height={cellHeight * 24}>
                    <Surface width={uniqueDates.length * cellWidth} height={cellHeight * 24}>
                      {matrix.map((row, i) => row.map((count, j) => {
                        const fill = getCellColor(count, max);
                        let textColor = '#222';
                        if (fill === '#ef4444' || fill === '#fb923c') textColor = '#fff';
                        return (
                          <g key={`${i}-${j}`}>
                            <Rectangle
                              x={j * cellWidth}
                              y={i * cellHeight}
                              width={cellWidth - 4}
                              height={cellHeight - 4}
                              fill={fill}
                              rx={5}
                              onMouseEnter={() => { setTooltip({ x: j * cellWidth, y: i * cellHeight, value: count, date: uniqueDates[j], hour: hours[i] }); setHoverCell({ i, j }) }}
                              onMouseLeave={() => { setTooltip(null); setHoverCell(null) }}
                            />
                            <text
                              x={j * cellWidth + (cellWidth - 4) / 2}
                              y={i * cellHeight + (cellHeight - 4) / 2 + fontSize / 2 - 2}
                              textAnchor="middle"
                              fontSize={fontSize}
                              fontWeight={600}
                              fill={textColor}
                              pointerEvents="none"
                            >
                              {count}
                            </text>
                          </g>
                        );
                      }))}

                      {/* Tooltip */}
                      {tooltip && (
                        <g style={{ pointerEvents: 'none' }}>
                          <rect 
                            x={tooltip.x + (tooltip.x + 160 > uniqueDates.length * cellWidth ? -168 : 16)} 
                            y={Math.max(tooltip.y - 2, 4)} 
                            width={160} 
                            height={52} 
                            fill="#ffffff" 
                            stroke="#2563eb" 
                            rx={8} 
                          />
                          <text x={tooltip.x + (tooltip.x + 160 > uniqueDates.length * cellWidth ? -156 : 28)} y={tooltip.y + 18} fontSize={13} fill="#222" fontWeight={600}>
                            {tooltip.date} {tooltip.hour}:00
                          </text>
                          <text x={tooltip.x + (tooltip.x + 160 > uniqueDates.length * cellWidth ? -156 : 28)} y={tooltip.y + 36} fontSize={12} fill="#444">
                            {tooltip.value} bookings
                          </text>
                        </g>
                      )}
                    </Surface>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}