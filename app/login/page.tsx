"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { sendMagicLink } from "@/lib/auth-helpers"
import Link from "next/link"
import { Mail, CheckCircle2, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [userType, setUserType] = useState<'freelancer' | 'client' | 'admin'>('freelancer')

  // Check for error from magic link verification
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(errorParam)
    }
  }, [searchParams])

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await sendMagicLink(email, userType)
      
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error || 'Failed to send magic link')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            {success ? (
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            ) : (
              <Mail className="h-12 w-12 text-blue-500" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {success ? 'Check Your Email!' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-center">
            {success 
              ? `We've sent a magic link to ${email}. Click the link in your email to login.`
              : 'Enter your email to receive a secure login link'
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <div className="space-y-4">
              <Alert className="bg-green-50 text-green-900 border-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <strong>Magic link sent!</strong> Check your inbox and spam folder.
                </AlertDescription>
              </Alert>

              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-medium">What to do next:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Open your email inbox</li>
                  <li>Look for an email from TaskLinker</li>
                  <li>Click the "Log In Now" button</li>
                  <li>You'll be automatically logged in!</li>
                </ol>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-3">Didn't receive the email?</p>
                <Button
                  onClick={() => {
                    setSuccess(false)
                    setError(null)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userType">I am a</Label>
                <select
                  id="userType"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value as 'freelancer' | 'client' | 'admin')}
                  className="w-full p-2 border rounded-md"
                  disabled={loading}
                >
                  <option value="freelancer">Freelancer</option>
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Mail className="mr-2 h-4 w-4 animate-pulse" />
                    Sending Magic Link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Magic Link
                  </>
                )}
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
                <p className="font-medium mb-1">🔒 What's a magic link?</p>
                <p>A secure, one-time login link sent to your email. No passwords to remember!</p>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline font-medium">
              Sign Up
            </Link>
          </div>

          <div className="text-xs text-center text-gray-500">
            🔒 Passwordless authentication - more secure, easier to use
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

