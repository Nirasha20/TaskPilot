'use client'

import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { logout } from '@/lib/redux/slices/authSlice'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function DashboardHeader() {
  const user = useAppSelector((state) => state.auth.user)
  const dispatch = useAppDispatch()
  const router = useRouter()

  const handleLogout = () => {
    dispatch(logout())
    router.push('/auth')
  }

  return (
    <header className="border-b border-border/50 bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-cyan-500/10 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4 lg:py-5">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent animate-gradient">
            TaskPilot
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, <span className="font-semibold text-foreground">{user?.username}</span> 👋
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="gap-2 hover:bg-destructive/10 hover:text-destructive transition-all duration-300 bg-transparent border-border/50 hover:scale-105"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  )
}
