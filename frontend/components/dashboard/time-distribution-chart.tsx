'use client'

import { useTask } from '@/lib/task-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

export function TimeDistributionChart() {
  const { tasks } = useTask()

  // Group by category and sum time
  const categoryData = tasks.reduce(
    (acc: Record<string, number>, task) => {
      if (!acc[task.category]) {
        acc[task.category] = 0
      }
      acc[task.category] += task.totalTime
      return acc
    },
    {}
  )

  const chartData = Object.entries(categoryData).map(([category, time]) => ({
    name: category,
    value: Math.round(time / 60), // Convert to minutes
  }))

  if (chartData.length === 0) {
    return (
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-border/50">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Time Distribution by Category</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <div className="text-center space-y-2">
            <div className="text-4xl">📊</div>
            <p>No data yet. Start tracking to see your productivity breakdown.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-border/50">
      <CardHeader>
        <CardTitle className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Time Distribution by Category</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}m`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}m`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
