"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronRight, BarChart2, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setError(null)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setError(null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Redirect to dashboard on successful login
      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Failed to sign in")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      setError(error.message || "Failed to sign in with Google")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Branding Section */}
      <div className="flex flex-col justify-center bg-blue-600 p-8 text-white md:w-1/2">
        <div className="mx-auto max-w-md">
          <div className="mb-4 flex items-center">
            <BarChart2 className="mr-2 h-8 w-8" />
            <h1 className="text-3xl font-bold">PredictIQ</h1>
          </div>
          <h2 className="mb-6 text-4xl font-bold leading-tight">Transform your business with predictive analytics</h2>
          <p className="mb-8 text-lg text-blue-100">
            Make data-driven decisions with our powerful analytics platform designed specifically for small and medium
            enterprises.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="mr-4 rounded-full bg-blue-500 p-2">
                <ChevronRight className="h-4 w-4" />
              </div>
              <p>Accurate demand forecasting to optimize inventory</p>
            </div>
            <div className="flex items-start">
              <div className="mr-4 rounded-full bg-blue-500 p-2">
                <ChevronRight className="h-4 w-4" />
              </div>
              <p>Identify market trends before your competitors</p>
            </div>
            <div className="flex items-start">
              <div className="mr-4 rounded-full bg-blue-500 p-2">
                <ChevronRight className="h-4 w-4" />
              </div>
              <p>Actionable insights to increase profitability</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex flex-col justify-center bg-white p-8 md:w-1/2">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Welcome back</h2>
            <p className="text-gray-500">Sign in to your account to continue</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={handleEmailChange}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/reset-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" value={password} onChange={handlePasswordChange} required />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 flex items-center">
            <Separator className="flex-1" />
            <span className="mx-4 text-sm text-gray-500">OR</span>
            <Separator className="flex-1" />
          </div>

          <Button variant="outline" className="mt-6 w-full" onClick={handleGoogleLogin} disabled={loading}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
