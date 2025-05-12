"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SettingsPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    role: "",
  })
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: user } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("first_name, last_name, company_name, role")
          .eq("id", user.user?.id)
          .single()

        if (profileError) {
          setError("Failed to fetch profile data.")
        } else {
          setProfile({
            firstName: profileData.first_name || "",
            lastName: profileData.last_name || "",
            email: user.user?.email || "",
            company: profileData.company_name || "",
            role: profileData.role || "",
          })
        }
      }
    }

    fetchProfile()
  }, [supabase])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setProfile({ ...profile, [id]: value })
  }

  const handleSave = async () => {
    setIsSaved(false)
    setError(null)

    const { data: user } = await supabase.auth.getUser()
    if (!user) {
      setError("User not authenticated.")
      return
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        first_name: profile.firstName,
        last_name: profile.lastName,
        company_name: profile.company,
        role: profile.role,
      })
      .eq("id", user.user?.id)

    if (updateError) {
      setError("Failed to update profile.")
    } else {
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="api">API Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          {isSaved && (
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your profile has been updated successfully.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal and company information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="mt-4 sm:mt-0">
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 1MB.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={profile.firstName} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={profile.lastName} onChange={handleInputChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile.email} disabled />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" value={profile.company} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Job Title</Label>
                <Input id="role" value={profile.role} onChange={handleInputChange} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave}>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Update your password to maintain security.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave}>Update Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage your API keys for integrations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-medium">Production API Key</h3>
                    <p className="text-sm text-muted-foreground">Use this key for your production environment.</p>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <Badge variant="outline" className="font-mono text-xs">
                      ••••••••••••••••4289
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    Show Key
                  </Button>
                  <Button variant="outline" size="sm">
                    Regenerate
                  </Button>
                </div>
              </div>

              <div className="rounded-md border p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-medium">Development API Key</h3>
                    <p className="text-sm text-muted-foreground">Use this key for testing and development.</p>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <Badge variant="outline" className="font-mono text-xs">
                      ••••••••••••••••7531
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    Show Key
                  </Button>
                  <Button variant="outline" size="sm">
                    Regenerate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>Configure webhooks for real-time data updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input id="webhook-url" placeholder="https://your-app.com/webhook" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="webhook-events">Events</Label>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="event-data-upload" />
                    <Label htmlFor="event-data-upload">Data Upload</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="event-prediction" />
                    <Label htmlFor="event-prediction">New Prediction</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="event-alert" />
                    <Label htmlFor="event-alert">Stock Alert</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave}>Save Webhook</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how and when you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-4 text-sm font-medium">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-alerts">Stock Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive alerts when stock levels are low.</p>
                    </div>
                    <Switch id="email-alerts" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-reports">Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">Receive weekly summary reports.</p>
                    </div>
                    <Switch id="email-reports" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-predictions">New Predictions</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications for new predictions.</p>
                    </div>
                    <Switch id="email-predictions" />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-4 text-sm font-medium">In-App Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="app-alerts">Stock Alerts</Label>
                      <p className="text-sm text-muted-foreground">Show alerts when stock levels are low.</p>
                    </div>
                    <Switch id="app-alerts" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="app-reports">Report Updates</Label>
                      <p className="text-sm text-muted-foreground">Show notifications when reports are updated.</p>
                    </div>
                    <Switch id="app-reports" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="app-predictions">New Predictions</Label>
                      <p className="text-sm text-muted-foreground">Show notifications for new predictions.</p>
                    </div>
                    <Switch id="app-predictions" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
