'use client'

import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from './store'
import { loadUser } from './slices/authSlice'
import { fetchTasks, incrementTimer } from './slices/tasksSlice'
import { useAppDispatch, useAppSelector } from './hooks'

// Timer component to handle timer increments
function TimerManager() {
  const dispatch = useAppDispatch()
  const tasks = useAppSelector((state) => state.tasks.tasks)
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      tasks.forEach((task) => {
        if (task.isTracking) {
          dispatch(incrementTimer(task.id))
          
          // Sync with backend every 10 seconds
          if ((task.totalTime + 1) % 10 === 0) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/tasks/${task.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify({ total_time: task.totalTime + 1 }),
            }).catch((err) => console.error('Failed to sync time:', err))
          }
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [dispatch, tasks, isAuthenticated])

  return null
}

// Auth loader component
function AuthLoader({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    dispatch(loadUser())
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      dispatch(fetchTasks())
    }
  }, [dispatch, isAuthenticated, isLoading])

  return (
    <>
      <TimerManager />
      {children}
    </>
  )
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthLoader>{children}</AuthLoader>
    </Provider>
  )
}
