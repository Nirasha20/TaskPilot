'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './auth-context'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Helper to convert backend task to frontend format
const transformTask = (backendTask: any): Task => ({
  id: backendTask.id?.toString() || '',
  title: backendTask.title || '',
  description: backendTask.description || '',
  status: backendTask.status || 'todo',
  priority: backendTask.priority || 'medium',
  category: backendTask.category || 'general',
  totalTime: backendTask.total_time || 0,
  createdAt: backendTask.created_at || new Date().toISOString(),
  completedAt: backendTask.completed_at,
  tags: backendTask.tags || [],
  isTracking: backendTask.is_tracking || false,
})

// Helper to convert frontend task to backend format
const toBackendFormat = (task: any) => {
  const backendTask: any = {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    category: task.category,
    tags: task.tags,
  }
  
  // Only include these fields if they are defined
  if (task.totalTime !== undefined) backendTask.total_time = task.totalTime
  if (task.isTracking !== undefined) backendTask.is_tracking = task.isTracking
  if (task.completedAt) backendTask.completed_at = task.completedAt
  
  return backendTask
}

export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  category: string
  totalTime: number // in seconds
  createdAt: string
  completedAt?: string
  tags: string[]
  isTracking: boolean
}

interface TaskContextType {
  tasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'isTracking'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  startTimer: (taskId: string) => Promise<void>
  stopTimer: (taskId: string) => Promise<void>
  toggleTaskStatus: (taskId: string) => Promise<void>
  isLoading: boolean
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    console.log('Token from localStorage:', token ? 'exists' : 'missing')
    
    if (!token) {
      console.error('No authentication token found in localStorage')
    }
    
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }

  // Fetch tasks from backend
  const fetchTasks = useCallback(async () => {
    if (!user) {
      console.log('No user logged in, skipping task fetch')
      return
    }

    try {
      setIsLoading(true)
      console.log('Fetching tasks from:', `${API_URL}/tasks`)
      
      const headers = getAuthHeaders()
      console.log('Request headers:', headers)
      
      const response = await fetch(`${API_URL}/tasks`, {
        headers,
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Response data:', data)
        // Backend returns: { status: 'success', data: { tasks: [...] } }
        const tasksArray = data.data?.tasks || data.tasks || data
        setTasks(tasksArray.map(transformTask))
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        console.error('Failed to fetch tasks. Status:', response.status, 'Error:', errorData)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Load tasks when user logs in
  useEffect(() => {
    if (user) {
      fetchTasks()
    } else {
      setTasks([])
    }
  }, [user, fetchTasks])

  // Timer effect - update locally and sync with backend periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.isTracking) {
            const newTime = task.totalTime + 1
            // Sync with backend every 10 seconds
            if (newTime % 10 === 0) {
              fetch(`${API_URL}/tasks/${task.id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ total_time: newTime }),
              }).catch((err) => console.error('Failed to sync time:', err))
            }
            return {
              ...task,
              totalTime: newTime,
            }
          }
          return task
        })
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'isTracking'>) => {
    try {
      const backendTask = toBackendFormat({ ...task, totalTime: 0, isTracking: false })
      console.log('Creating task:', backendTask)
      
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(backendTask),
      })

      const data = await response.json()
      console.log('Server response:', data)

      if (!response.ok) {
        console.error('Failed to create task:', data)
        throw new Error(data.message || 'Failed to create task')
      }

      const newTask = transformTask(data.data?.task || data.task || data)
      console.log('Transformed task:', newTask)
      setTasks([...tasks, newTask])
    } catch (error) {
      console.error('Error adding task:', error)
      throw error
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(toBackendFormat(updates)),
      })

      if (response.ok) {
        const data = await response.json()
        const updatedTask = transformTask(data.data?.task || data.task || data)
        setTasks(tasks.map((task) => (task.id === id ? updatedTask : task)))
      } else {
        throw new Error('Failed to update task')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        setTasks(tasks.filter((task) => task.id !== id))
      } else {
        throw new Error('Failed to delete task')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  const startTimer = async (taskId: string) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}/start`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        setTasks(
          tasks.map((task) =>
            task.id === taskId ? { ...task, isTracking: true } : { ...task, isTracking: false }
          )
        )
      }
    } catch (error) {
      console.error('Error starting timer:', error)
    }
  }

  const stopTimer = async (taskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      const response = await fetch(`${API_URL}/tasks/${taskId}/stop`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ total_time: task.totalTime }),
      })

      if (response.ok) {
        setTasks(tasks.map((task) => (task.id === taskId ? { ...task, isTracking: false } : task)))
      }
    } catch (error) {
      console.error('Error stopping timer:', error)
    }
  }

  const toggleTaskStatus = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const newStatus =
      task.status === 'completed'
        ? 'todo'
        : task.status === 'todo'
          ? 'in-progress'
          : 'completed'

    await updateTask(taskId, {
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
    })
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        startTimer,
        stopTimer,
        toggleTaskStatus,
        isLoading,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTask() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error('useTask must be used within TaskProvider')
  }
  return context
}
