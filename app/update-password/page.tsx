"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart2, AlertCircle, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function UpdatePassword() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMatch, setPasswordMatch] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    if (confirmPassword) {
      setPasswordMatch(e.target.value === confirmPassword)
    }
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
    setPasswordMatch(e.target.value === password)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      // Redirect to login page after successful password update
      router.push("/password-updated")
    } catch (error: any) {
      setError(error.message || "Failed to update password")
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
          <CardTitle className="text-2xl">Update Your Password</CardTitle>
          <CardDescription>Create a new password for your account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                required
                placeholder="Create a secure password"
              />
              <div className="flex items-center space-x-2 text-xs">
                <div className="h-1 w-1/3 rounded-full bg-gray-200">
                  <div className={`h-1 rounded-full ${password.length > 0 ? "bg-blue-600" : ""}`}></div>
                </div>
                <div className="h-1 w-1/3 rounded-full bg-gray-200">
                  <div
                    className={`h-1 rounded-full ${
                      password.length >= 8 && /[A-Z]/.test(password) ? "bg-blue-600" : ""
                    }`}
                  ></div>
                </div>
                <div className="h-1 w-1/3 rounded-full bg-gray-200">
                  <div
                    className={`h-1 rounded-full ${
                      password.length >= 8 && /[A-Z]/.test(password) && /[0-9!@#$%^&*]/.test(password)
                        ? "bg-blue-600"
                        : ""
                    }`}
                  ></div>
                </div>
                <span className="text-gray-500">Strength</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
                placeholder="Confirm your password"
              />
              {confirmPassword && (
                <div className="flex items-center text-xs">
                  {passwordMatch ? (
                    <div className="flex items-center text-green-600">
                      <Check className="mr-1 h-4 w-4" />
                      <span>Passwords match</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="mr-1 h-4 w-4" />
                      <span>Passwords do not match</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
