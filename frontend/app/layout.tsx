import React from "react"
import type { Metadata } from 'next'

import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { TaskProvider } from '@/lib/task-context'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'TaskPilot - Productivity Tracker',
  description: 'Track your time, manage your tasks, and boost your productivity',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <TaskProvider>
            {children}
            <Toaster />
          </TaskProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
