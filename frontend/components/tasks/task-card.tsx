'use client'

import { useState } from 'react'
import { Task, useTask } from '@/lib/task-context'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatTime } from '@/lib/time-utils'
import {
  Play,
  Pause,
  CheckCircle,
  Circle,
  Clock,
  Edit,
  Trash2,
  Tag,
  Calendar,
  AlertCircle,
} from 'lucide-react'

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const { updateTask, deleteTask, startTimer, stopTimer, toggleTaskStatus } = useTask()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  // Edit form state
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description)
  const [editCategory, setEditCategory] = useState(task.category)
  const [editPriority, setEditPriority] = useState(task.priority)
  const [editStatus, setEditStatus] = useState(task.status)
  const [editTags, setEditTags] = useState(task.tags.join(', '))

  const handleSaveEdit = () => {
    updateTask(task.id, {
      title: editTitle,
      description: editDescription,
      category: editCategory,
      priority: editPriority,
      status: editStatus,
      tags: editTags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ''),
    })
    setIsEditing(false)
  }

  const handleDelete = () => {
    deleteTask(task.id)
    setIsDeleteConfirmOpen(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'warning'
      case 'low':
        return 'info'
      default:
        return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'in-progress':
        return 'warning'
      case 'todo':
        return 'secondary'
      default:
        return 'default'
    }
  }

  return (
    <>
      <Card className={`transition-all duration-300 hover:shadow-lg ${task.isTracking ? 'ring-2 ring-violet-500 shadow-violet-500/20' : 'hover:border-violet-200 dark:hover:border-violet-800'} bg-gradient-to-br from-card to-card/50`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              {/* Title and Status */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className="flex-shrink-0"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                <h3
                  className={`text-lg font-semibold ${
                    task.status === 'completed'
                      ? 'line-through text-muted-foreground'
                      : 'text-foreground'
                  }`}
                >
                  {task.title}
                </h3>
              </div>

              {/* Description */}
              {task.description && (
                <p className="text-sm text-muted-foreground ml-7">{task.description}</p>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2 ml-7">
                <Badge variant={getStatusColor(task.status)}>
                  {task.status.replace('-', ' ')}
                </Badge>
                <Badge variant={getPriorityColor(task.priority)}>
                  <AlertCircle className="mr-1 h-3 w-3" />
                  {task.priority}
                </Badge>
                <Badge variant="outline">
                  <Tag className="mr-1 h-3 w-3" />
                  {task.category}
                </Badge>
                {task.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
                disabled={task.isTracking}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsDeleteConfirmOpen(true)}
                disabled={task.isTracking}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Time Display and Timer Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono font-semibold">{formatTime(task.totalTime)}</span>
              </div>

              {task.isTracking ? (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => stopTimer(task.id)}
                  className="shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Stop Timer
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => startTimer(task.id)}
                  disabled={task.status === 'completed'}
                  className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Timer
                </Button>
              )}
            </div>

            {/* Created Date */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(task.createdAt).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent onClose={() => setIsEditing(false)}>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Make changes to your task details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  id="edit-category"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                >
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
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  id="edit-priority"
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as 'low' | 'medium' | 'high')}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                id="edit-status"
                value={editStatus}
                onChange={(e) =>
                  setEditStatus(e.target.value as 'todo' | 'in-progress' | 'completed')
                }
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
              <Input
                id="edit-tags"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent onClose={() => setIsDeleteConfirmOpen(false)}>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
