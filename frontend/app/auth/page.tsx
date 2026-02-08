'use client'

import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { login as loginAction, register as registerAction } from '@/lib/redux/slices/authSlice'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const dispatch = useAppDispatch()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await dispatch(loginAction({ email, password })).unwrap()
      } else {
        if (!username.trim()) {
          setError('Username is required')
          setLoading(false)
          return
        }
        await dispatch(registerAction({ email, username, password })).unwrap()
      }
      router.push('/dashboard')
    } catch (err: any) {
      setError(err || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 dark:from-violet-950 dark:via-blue-950 dark:to-cyan-950 p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center animate-fade-in">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-6">
          <div>
            <h1 className="text-6xl font-bold tracking-tighter bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4 animate-gradient">
              TaskPilot
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Your Personal Productivity Hub ✨
            </p>
          </div>

          <div className="space-y-4 pt-8">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg">Smart Task Management</h3>
                <p className="text-muted-foreground">
                  Create, organize, and track your tasks with intuitive controls
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg">Time Tracking</h3>
                <p className="text-muted-foreground">
                  Monitor time spent on each task with built-in timer
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg">Analytics Dashboard</h3>
                <p className="text-muted-foreground">
                  Visualize your productivity with detailed charts and statistics
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg">Advanced Filtering</h3>
                <p className="text-muted-foreground">
                  Search, filter, and sort tasks by multiple criteria
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <Card className="w-full max-w-md mx-auto shadow-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? 'Sign in to your account to continue'
                : 'Register to start tracking your productivity'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Username (Register only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" disabled={loading}>
                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              </Button>

              {/* Toggle Login/Register */}
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setError('')
                  }}
                  className="text-primary hover:underline"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Sign in'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
