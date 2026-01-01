import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ConversionFunnelProps {
  funnel: { initiated: number; confirmed: number; completed: number }
}

export default function ConversionFunnel({ funnel }: ConversionFunnelProps) {
  const stages = [
    { name: 'Initiated', count: funnel.initiated, color: 'bg-blue-500' },
    { name: 'Confirmed', count: funnel.confirmed, color: 'bg-green-500' },
    { name: 'Completed', count: funnel.completed, color: 'bg-purple-500' },
  ];

  const maxCount = Math.max(...stages.map(s => s.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={stage.name} className="flex items-center space-x-4">
              <div className="w-20 text-sm font-medium">{stage.name}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <div
                    className={`h-8 ${stage.color} rounded`}
                    style={{ width: `${(stage.count / maxCount) * 100}%` }}
                  ></div>
                  <span className="text-sm text-gray-600">{stage.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}