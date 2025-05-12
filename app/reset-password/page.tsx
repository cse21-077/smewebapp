"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart2, AlertCircle, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ResetPassword() {
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })

      if (error) throw error

      setSuccess(true)
    } catch (error: any) {
      setError(error.message || "Failed to send reset password email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <BarChart2 className="mr-2 h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">PredictIQ</span>
          </div>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Enter your email to receive a password reset link</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-2 text-lg font-medium">Check your email</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to <span className="font-medium">{email}</span>
              </p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
