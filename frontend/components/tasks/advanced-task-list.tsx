'use client'

import { useState, useMemo } from 'react'
import { useTask } from '@/lib/task-context'
import { TaskCard } from './task-card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Search, Filter, Download } from 'lucide-react'
import { exportTasksToCSV } from '@/lib/csv-export'

export function AdvancedTaskList() {
  const { tasks } = useTask()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('createdAt')

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((task) => task.status === filterStatus)
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter((task) => task.priority === filterPriority)
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter((task) => task.category === filterCategory)
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'time':
          return b.totalTime - a.totalTime
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    return sorted
  }, [tasks, searchQuery, filterStatus, filterPriority, filterCategory, sortBy])

  const handleExportCSV = () => {
    exportTasksToCSV(filteredAndSortedTasks)
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-4 space-y-4 shadow-md">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search tasks by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="filter-status" className="text-xs">Status</Label>
            <Select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9"
            >
              <option value="all">All</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-priority" className="text-xs">Priority</Label>
            <Select
              id="filter-priority"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="h-9"
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-category" className="text-xs">Category</Label>
            <Select
              id="filter-category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="h-9"
            >
              <option value="all">All</option>
              <option value="general">General</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="study">Study</option>
              <option value="fitness">Fitness</option>
              <option value="shopping">Shopping</option>
              <option value="other">Other</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort-by" className="text-xs">Sort By</Label>
            <Select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9"
            >
              <option value="createdAt">Date Created</option>
              <option value="priority">Priority</option>
              <option value="time">Time Spent</option>
              <option value="title">Title</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs opacity-0">Export</Label>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="w-full h-9 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-300 dark:hover:bg-violet-950 dark:hover:text-violet-400 transition-all duration-300"
              disabled={filteredAndSortedTasks.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredAndSortedTasks.length === 0 ? (
          <div className=\"text-center py-12 bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl shadow-md\">
            <div className=\"text-6xl mb-4\">✨</div>
            <p className=\"text-muted-foreground text-lg\">
              {tasks.length === 0
                ? 'No tasks yet. Create your first task above!'
                : 'No tasks match your filters.'}
            </p>
          </div>
        ) : (
          filteredAndSortedTasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  )
}
