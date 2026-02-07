'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './auth-context'

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
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'isTracking'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  startTimer: (taskId: string) => void
  stopTimer: (taskId: string) => void
  toggleTaskStatus: (taskId: string) => void
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])

  // Load tasks from localStorage
  useEffect(() => {
    if (user) {
      const storedTasks = localStorage.getItem(`tasks_${user.id}`)
      if (storedTasks) {
        try {
          setTasks(JSON.parse(storedTasks))
        } catch (error) {
          console.error('Failed to parse stored tasks:', error)
        }
      }
    }
  }, [user])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (user && tasks.length > 0) {
      localStorage.setItem(`tasks_${user.id}`, JSON.stringify(tasks))
    }
  }, [tasks, user])

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.isTracking) {
            return {
              ...task,
              totalTime: task.totalTime + 1,
            }
          }
          return task
        })
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'isTracking'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isTracking: false,
    }
    setTasks([...tasks, newTask])
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const startTimer = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, isTracking: true } : { ...task, isTracking: false }
      )
    )
  }

  const stopTimer = (taskId: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, isTracking: false } : task)))
  }

  const toggleTaskStatus = (taskId: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const newStatus =
            task.status === 'completed'
              ? 'todo'
              : task.status === 'todo'
                ? 'in-progress'
                : 'completed'
          return {
            ...task,
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
          }
        }
        return task
      })
    )
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
