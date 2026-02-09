"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { sendMagicLink } from "@/lib/auth-helpers"
import Link from "next/link"
import { Mail, CheckCircle2, AlertCircle } from "lucide-react"

/** Show a user-friendly message instead of raw backend/email provider errors */
function normalizeLoginError(raw: string | null): string {
  if (!raw) return 'Something went wrong. Please try again.'
  const lower = raw.toLowerCase()
  if (lower.includes('api key') || lower.includes('not enabled') || lower.includes('not configured') || lower.includes('brevo') || lower.includes('email service'))
    return "Login emails are temporarily unavailable. Please try again later or contact support."
  return raw
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [userType, setUserType] = useState<'freelancer' | 'client' | 'admin'>('freelancer')

  // Check for error from magic link verification or URL
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(normalizeLoginError(errorParam))
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
        setError(normalizeLoginError(result.error || 'Failed to send magic link'))
      }
    } catch (err: any) {
      setError(normalizeLoginError(err.message || 'Failed to send magic link'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#0d1f17] to-[#052e1f] p-4">
      {/* Gradient accent orbs */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-[#04A466]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-24 w-72 h-72 rounded-full bg-[#04A466]/10 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#04A466]/10 via-transparent to-transparent pointer-events-none" />

      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 z-10">
        <img src="/logo-icon.svg" alt="Tasklinkers" className="h-8 w-8" />
        <span className="text-xl font-bold text-white">Tasklinkers</span>
      </Link>

      <Card className="w-full max-w-md relative bg-white/95 backdrop-blur-sm border-gray-200/50 shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            {success ? (
              <CheckCircle2 className="h-12 w-12 text-[#04A466]" />
            ) : (
              <Mail className="h-12 w-12 text-[#04A466]" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-center text-[#1e293b]">
            {success ? 'Check Your Email!' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-center text-[#64748b]">
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
              <Alert className="bg-[#04A466]/10 text-[#052e1e] border-[#04A466]/30">
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
                  className="w-full border-[#04A466] text-[#04A466] hover:bg-[#04A466]/10"
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
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#04A466]/30 focus:border-[#04A466]"
                  disabled={loading}
                >
                  <option value="freelancer">Freelancer</option>
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <Button type="submit" className="w-full bg-[#04A466] hover:bg-[#039a5c] text-white" disabled={loading}>
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

              <div className="bg-[#04A466]/5 border border-[#04A466]/20 rounded-lg p-3 text-sm text-[#1e293b]">
                <p className="font-medium mb-1 text-[#04A466]">🔒 What's a magic link?</p>
                <p>A secure, one-time login link sent to your email. No passwords to remember!</p>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#04A466] hover:text-[#039a5c] font-medium">
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#0d1f17] to-[#052e1f]">
        <div className="animate-pulse text-white/70">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}

