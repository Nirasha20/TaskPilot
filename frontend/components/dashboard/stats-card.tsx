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
    <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-border hover:shadow-md transition-all">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold tracking-tight text-muted-foreground">{title}</CardTitle>
        <div className="h-5 w-5 text-primary/70">{icon}</div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-3xl font-bold tracking-tighter text-foreground">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground font-medium">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
