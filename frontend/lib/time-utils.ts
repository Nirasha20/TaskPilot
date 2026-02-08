export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

export function formatTimeHMS(seconds: number): { hours: number; minutes: number; seconds: number } {
  return {
    hours: Math.floor(seconds / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  }
}

export function getTimeSpentToday(tasks: any[]): number {
  const today = new Date().toDateString()
  return tasks
    .filter((task) => new Date(task.createdAt).toDateString() === today)
    .reduce((sum, task) => sum + task.totalTime, 0)
}

export function getTimeSpentThisWeek(tasks: any[]): number {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  return tasks
    .filter((task) => new Date(task.createdAt) >= weekAgo)
    .reduce((sum, task) => sum + task.totalTime, 0)
}

export function getCompletedTasksToday(tasks: any[]): number {
  const today = new Date().toDateString()
  return tasks.filter(
    (task) => task.status === 'completed' && new Date(task.completedAt).toDateString() === today
  ).length
}

export function getCompletedTasksThisWeek(tasks: any[]): number {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  return tasks.filter(
    (task) =>
      task.status === 'completed' &&
      task.completedAt &&
      new Date(task.completedAt) >= weekAgo
  ).length
}
