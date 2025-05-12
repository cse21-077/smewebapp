import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2, CheckCircle2 } from "lucide-react"

export default function SignUpSuccess() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Account Created Successfully!</CardTitle>
          <CardDescription>Thank you for signing up for PredictIQ</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-4 flex items-center justify-center">
            <BarChart2 className="mr-2 h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">PredictIQ</span>
          </div>
          <p className="mb-4">
            We've sent a confirmation email to your inbox. Please verify your email address to complete the registration
            process.
          </p>
          <p className="text-sm text-muted-foreground">
            If you don't see the email, please check your spam folder or contact support.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/dashboard">Continue to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Back to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
