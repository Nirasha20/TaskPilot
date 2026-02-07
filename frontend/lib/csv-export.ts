import { Task } from '@/lib/task-context'
import { formatTime } from './time-utils'

export function exportTasksToCSV(tasks: Task[], filename = 'tasks.csv') {
  const headers = ['Title', 'Description', 'Category', 'Priority', 'Status', 'Time Spent', 'Tags', 'Created At']

  const rows = tasks.map((task) => [
    `"${task.title.replace(/"/g, '""')}"`,
    `"${task.description.replace(/"/g, '""')}"`,
    task.category,
    task.priority,
    task.status,
    formatTime(task.totalTime),
    `"${task.tags.join(', ')}"`,
    new Date(task.createdAt).toLocaleString(),
  ])

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)

  link.click()

  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
