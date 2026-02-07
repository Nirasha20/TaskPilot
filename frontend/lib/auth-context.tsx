'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface User {
  id: string
  email: string
  username: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const register = async (email: string, username: string, password: string) => {
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    if (users.some((u: any) => u.email === email)) {
      throw new Error('User already exists')
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      username,
    }

    // Store hashed password (simplified - in production use proper backend hashing)
    const userWithPassword = {
      ...newUser,
      password: btoa(password), // Basic encoding, not secure for production
    }

    users.push(userWithPassword)
    localStorage.setItem('users', JSON.stringify(users))
    localStorage.setItem('user', JSON.stringify(newUser))
    setUser(newUser)
  }

  const login = async (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const foundUser = users.find(
      (u: any) => u.email === email && u.password === btoa(password)
    )

    if (!foundUser) {
      throw new Error('Invalid email or password')
    }

    const { password: _, ...userWithoutPassword } = foundUser
    setUser(userWithoutPassword)
    localStorage.setItem('user', JSON.stringify(userWithoutPassword))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: user !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
