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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart2, ChevronRight, Check, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    industry: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })

  const [passwordMatch, setPasswordMatch] = useState(true)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target
    setFormData({
      ...formData,
      [id === "first-name"
        ? "firstName"
        : id === "last-name"
          ? "lastName"
          : id === "confirm-password"
            ? "confirmPassword"
            : id === "terms"
              ? "agreeToTerms"
              : id]: type === "checkbox" ? checked : value,
    })

    if (id === "password" || id === "confirm-password") {
      const passwordValue = id === "password" ? value : formData.password
      const confirmValue = id === "confirm-password" ? value : formData.confirmPassword
      setPasswordMatch(passwordValue === confirmValue || confirmValue === "")
    }

    setError(null)
  }

  const handleIndustryChange = (value: string) => {
    setFormData({
      ...formData,
      industry: value,
    })
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create the user in Supabase Auth
      // The metadata will be used by the trigger to create the profile
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            company_name: formData.company,
            industry: formData.industry,
          },
        },
      });

      if (authError) throw authError;

      // If we need to update additional fields after signup:
      if (authData.user) {
        // After the user signs up and the trigger creates the basic profile,
        // we can update with additional fields if needed
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            company_name: formData.company,
            industry: formData.industry,
          })
          .eq("id", authData.user.id);

        if (updateError) throw updateError;
      }

      // Redirect to a confirmation page or dashboard
      router.push("/signup-success");
    } catch (error: any) {
      setError(error.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      setError(error.message || "Failed to sign up with Google")
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
          <h2 className="mb-6 text-4xl font-bold leading-tight">Start making data-driven decisions today</h2>
          <p className="mb-8 text-lg text-blue-100">
            Join thousands of SMEs using predictive analytics to optimize inventory, forecast demand, and increase
            profitability.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="mr-4 rounded-full bg-blue-500 p-2">
                <ChevronRight className="h-4 w-4" />
              </div>
              <p>Free 14-day trial, no credit card required</p>
            </div>
            <div className="flex items-start">
              <div className="mr-4 rounded-full bg-blue-500 p-2">
                <ChevronRight className="h-4 w-4" />
              </div>
              <p>Easy setup with your existing business data</p>
            </div>
            <div className="flex items-start">
              <div className="mr-4 rounded-full bg-blue-500 p-2">
                <ChevronRight className="h-4 w-4" />
              </div>
              <p>Actionable insights in minutes, not days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Up Form Section */}
      <div className="flex flex-col justify-center bg-white p-8 md:w-1/2">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Create your account</h2>
            <p className="text-gray-500">Get started with your free trial</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form className="space-y-5" onSubmit={handleSignUp}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input
                  id="first-name"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  id="last-name"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                placeholder="Acme Inc."
                value={formData.company}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={formData.industry} onValueChange={handleIndustryChange}>
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Create a secure password"
              />
              <div className="flex items-center space-x-2 text-xs">
                <div className="h-1 w-1/3 rounded-full bg-gray-200">
                  <div className={`h-1 rounded-full ${formData.password.length > 0 ? "bg-blue-600" : ""}`}></div>
                </div>
                <div className="h-1 w-1/3 rounded-full bg-gray-200">
                  <div
                    className={`h-1 rounded-full ${
                      formData.password.length >= 8 && /[A-Z]/.test(formData.password) ? "bg-blue-600" : ""
                    }`}
                  ></div>
                </div>
                <div className="h-1 w-1/3 rounded-full bg-gray-200">
                  <div
                    className={`h-1 rounded-full ${
                      formData.password.length >= 8 &&
                      /[A-Z]/.test(formData.password) &&
                      /[0-9!@#$%^&*]/.test(formData.password)
                        ? "bg-blue-600"
                        : ""
                    }`}
                  ></div>
                </div>
                <span className="text-gray-500">Strength</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                placeholder="Confirm your password"
              />
              {formData.confirmPassword && (
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

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terms"
                className="h-4 w-4 rounded border-gray-300"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                required
              />
              <Label htmlFor="terms" className="text-sm font-normal">
                I agree to the{" "}
                <Link href="#" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 flex items-center">
            <Separator className="flex-1" />
            <span className="mx-4 text-sm text-gray-500">OR</span>
            <Separator className="flex-1" />
          </div>

          <Button variant="outline" className="mt-6 w-full" onClick={handleGoogleSignUp} disabled={loading}>
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
            Sign up with Google
          </Button>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
