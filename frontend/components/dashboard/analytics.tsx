'use client'

import { useTask } from '@/lib/task-context'
import { StatsCard } from './stats-card'
import { formatTime } from '@/lib/time-utils'
import {
  getTimeSpentToday,
  getTimeSpentThisWeek,
  getCompletedTasksToday,
  getCompletedTasksThisWeek,
} from '@/lib/time-utils'
import { Clock, CheckCircle, TrendingUp, Target } from 'lucide-react'

export function Analytics() {
  const { tasks } = useTask()

  const timeToday = getTimeSpentToday(tasks)
  const timeThisWeek = getTimeSpentThisWeek(tasks)
  const completedToday = getCompletedTasksToday(tasks)
  const completedThisWeek = getCompletedTasksThisWeek(tasks)

  const avgTimePerTask =
    tasks.length > 0
      ? Math.round((tasks.reduce((sum, t) => sum + t.totalTime, 0) / tasks.length) * 100) /
        100
      : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Time Tracked Today"
        value={formatTime(timeToday)}
        icon={<Clock className="h-4 w-4" />}
        description={`${formatTime(timeThisWeek)} this week`}
      />
      <StatsCard
        title="Completed Today"
        value={completedToday}
        icon={<CheckCircle className="h-4 w-4" />}
        description={`${completedThisWeek} this week`}
      />
      <StatsCard
        title="Total Tasks"
        value={tasks.length}
        icon={<Target className="h-4 w-4" />}
        description={`${tasks.filter((t) => t.status === 'completed').length} completed`}
      />
      <StatsCard
        title="Average Time/Task"
        value={formatTime(avgTimePerTask)}
        icon={<TrendingUp className="h-4 w-4" />}
        description={`From ${tasks.length} tasks`}
      />
    </div>
  )
}
