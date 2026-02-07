'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function DashboardHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/auth')
  }

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4 lg:py-5">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            TaskFlow
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, <span className="font-semibold text-foreground">{user?.username}</span>
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors bg-transparent"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  )
}
