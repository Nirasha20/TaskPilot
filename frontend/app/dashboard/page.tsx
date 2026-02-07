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
    return ()
}