import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  category: string
  totalTime: number
  createdAt: string
  completedAt?: string
  tags: string[]
  isTracking: boolean
}

interface TasksState {
  tasks: Task[]
  isLoading: boolean
  error: string | null
}

const initialState: TasksState = {
  tasks: [],
  isLoading: false,
  error: null,
}

// Helper functions
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

const toBackendFormat = (task: any) => {
  const backendTask: any = {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    category: task.category,
    tags: task.tags,
  }

  if (task.totalTime !== undefined) backendTask.total_time = task.totalTime
  if (task.isTracking !== undefined) backendTask.is_tracking = task.isTracking
  if (task.completedAt) backendTask.completed_at = task.completedAt

  return backendTask
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  console.log('getAuthHeaders - Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null/undefined')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

// Async thunks
export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      return rejectWithValue('Failed to fetch tasks')
    }

    const data = await response.json()
    const tasksArray = data.data?.tasks || data.tasks || data
    return tasksArray.map(transformTask)
  } catch (error: any) {
    return rejectWithValue(error.message || 'Network error')
  }
})

export const addTask = createAsyncThunk(
  'tasks/addTask',
  async (task: Omit<Task, 'id' | 'createdAt' | 'isTracking'>, { rejectWithValue }) => {
    try {
      const backendTask = toBackendFormat({ ...task, totalTime: 0, isTracking: false })
      
      console.log('Adding task - Frontend format:', task)
      console.log('Adding task - Backend format:', backendTask)
      console.log('API URL:', `${API_URL}/tasks`)
      console.log('Auth headers:', getAuthHeaders())

      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(backendTask),
      })

      const data = await response.json()
      console.log('Add task response:', { ok: response.ok, status: response.status, data })

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to create task')
      }

      return transformTask(data.data?.task || data.task || data)
    } catch (error: any) {
      console.error('Add task error:', error)
      return rejectWithValue(error.message || 'Network error')
    }
  }
)

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, updates }: { id: string; updates: Partial<Task> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(toBackendFormat(updates)),
      })

      if (!response.ok) {
        return rejectWithValue('Failed to update task')
      }

      const data = await response.json()
      return transformTask(data.data?.task || data.task || data)
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error')
    }
  }
)

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        return rejectWithValue('Failed to delete task')
      }

      return id
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error')
    }
  }
)

export const startTimer = createAsyncThunk(
  'tasks/startTimer',
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}/start`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        return rejectWithValue('Failed to start timer')
      }

      const data = await response.json()
      return transformTask(data.data?.task || data.task || data)
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error')
    }
  }
)

export const stopTimer = createAsyncThunk(
  'tasks/stopTimer',
  async ({ taskId, totalTime }: { taskId: string; totalTime: number }, { rejectWithValue }) => {
    try {
      // First sync the current time
      await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ total_time: totalTime }),
      })

      // Then stop the timer
      const response = await fetch(`${API_URL}/tasks/${taskId}/stop`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        return rejectWithValue('Failed to stop timer')
      }

      const data = await response.json()
      return transformTask(data.data?.task || data.task || data)
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error')
    }
  }
)

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    incrementTimer: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find((t) => t.id === action.payload)
      if (task && task.isTracking) {
        task.totalTime += 1
      }
    },
    syncTaskTime: (state, action: PayloadAction<{ id: string; time: number }>) => {
      const task = state.tasks.find((t) => t.id === action.payload.id)
      if (task) {
        task.totalTime = action.payload.time
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false
        state.tasks = action.payload
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Add task
    builder
      .addCase(addTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload)
      })
      .addCase(addTask.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Update task
    builder
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t.id === action.payload.id)
        if (index !== -1) {
          state.tasks[index] = action.payload
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Delete task
    builder
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t.id !== action.payload)
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Start timer
    builder
      .addCase(startTimer.fulfilled, (state, action) => {
        // Stop all other tracking tasks
        state.tasks.forEach((task) => {
          task.isTracking = false
        })
        // Update the started task
        const index = state.tasks.findIndex((t) => t.id === action.payload.id)
        if (index !== -1) {
          state.tasks[index] = action.payload
        }
      })
      .addCase(startTimer.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Stop timer
    builder
      .addCase(stopTimer.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t.id === action.payload.id)
        if (index !== -1) {
          state.tasks[index] = action.payload
        }
      })
      .addCase(stopTimer.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { incrementTimer, syncTaskTime } = tasksSlice.actions
export default tasksSlice.reducer
