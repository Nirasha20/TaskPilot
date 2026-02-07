'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { DashboardHeader } from '@/components/dashboard/header'
import { Analytics } from '@/components/dashboard/analytics'
import { TimeDistributionChart } from '@/components/dashboard/time-distribution-chart'
import { DailyProgressChart } from '@/components/dashboard/daily-progress-chart'
import { InlineTaskForm } from '@/components/tasks/inline-task-form'
import { AdvancedTaskList } from '@/components/tasks/advanced-task-list'

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-violet-50/20 dark:to-violet-950/20">
      <DashboardHeader />
      <main className="container mx-auto px-4 lg:px-6 py-6 space-y-8 animate-fade-in">
        {/* Task Creation Section - Top */}
        <section className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="mb-4">
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Create New Task</h2>
            <p className="text-sm text-muted-foreground mt-1">Add a new task to your list and start tracking</p>
          </div>
          <InlineTaskForm />
        </section>

        {/* Tasks List Section */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">My Tasks</h2>
            <p className="text-sm text-muted-foreground mt-1">Track, manage, and complete your daily tasks</p>
          </div>
          <AdvancedTaskList />
        </section>

        {/* Analytics Section - Bottom */}
        <section className="space-y-6 mt-12 pt-8 border-t border-border/50">
          <div>
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text text-transparent">Analytics & Insights</h2>
            <p className="text-sm text-muted-foreground mt-1">Your productivity overview</p>
          </div>
          
          {/* Stats Cards */}
          <Analytics />

          {/* Charts Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <TimeDistributionChart />
            <DailyProgressChart />
          </div>
        </section>
      </main>
    </div>
    )
}