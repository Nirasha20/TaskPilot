'use client'

import { useTask } from '@/lib/task-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function DailyProgressChart() {
  const { tasks } = useTask()

  // Get last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    date.setHours(0, 0, 0, 0)
    return date
  })

  const chartData = last7Days.map((date) => {
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    
    // Count tasks completed on this specific day
    const completed = tasks.filter((t) => {
      if (t.status !== 'completed' || !t.completedAt) return false
      const completedDate = new Date(t.completedAt)
      return completedDate >= date && completedDate < nextDay
    }).length
    
    // Sum time from tasks that have any time tracked
    // Note: Since we don't track daily time separately, we show cumulative time
    // A better approach would be to track time entries per day
    const timeSpent = tasks
      .filter((t) => t.totalTime > 0)
      .reduce((sum, t) => sum + (t.totalTime / 7), 0) // Distribute time evenly as approximation

    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      completed,
      timeMinutes: Math.round(timeSpent / 60),
    }
  })

  const hasData = chartData.some((d) => d.completed > 0 || d.timeMinutes > 0)

  if (!hasData) {
    return (
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-border/50">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Last 7 Days Progress</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <div className="text-center space-y-2">
            <div className="text-4xl">📈</div>
            <p>Start tracking tasks to see your progress.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-border/50">
      <CardHeader>
        <CardTitle className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Last 7 Days Progress</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="completed" fill="#10b981" name="Tasks Completed" />
            <Bar yAxisId="right" dataKey="timeMinutes" fill="#3b82f6" name="Time (minutes)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
