'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  description?: string
}

export function StatsCard({ title, value, icon, description }: StatsCardProps) {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-violet-50/30 dark:to-violet-950/30 border-border/50 hover:border-violet-500/50 hover:shadow-lg hover:scale-105 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <CardTitle className="text-sm font-semibold tracking-tight text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center">
          <div className="h-5 w-5 text-violet-600 dark:text-violet-400">{icon}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 relative z-10">
        <div className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground font-medium">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
