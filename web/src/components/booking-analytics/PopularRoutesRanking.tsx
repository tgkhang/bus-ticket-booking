import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PopularRoutesRankingProps {
  routes: Array<{ route: string; count: number }>
}

export default function PopularRoutesRanking({ routes }: PopularRoutesRankingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Routes Ranking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {routes.map((item, index) => (
            <div key={item.route} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                <span className="text-sm font-medium">{item.route}</span>
              </div>
              <span className="text-sm text-gray-600">{item.count} bookings</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}