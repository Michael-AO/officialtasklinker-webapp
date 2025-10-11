"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { signUpWithMagicLink } from "@/lib/auth-helpers"
import Link from "next/link"
import { Mail, CheckCircle2, AlertCircle, UserPlus } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  
  // User details
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [userType, setUserType] = useState<'freelancer' | 'client'>('freelancer')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (!agreedToTerms) {
      setError('Please accept the Terms and Privacy Policy')
      setLoading(false)
      return
    }

    try {
      const result = await signUpWithMagicLink(email, firstName, lastName, userType)
      
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error || 'Failed to create account')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
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
              <UserPlus className="h-12 w-12 text-blue-500" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {success ? 'Check Your Email!' : 'Create Your Account'}
          </CardTitle>
          <CardDescription className="text-center">
            {success 
              ? `We've sent a magic link to ${email}. Click the link to complete your signup!`
              : 'Join TaskLinker to connect and collaborate'
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
                  <li>Click the "Complete Signup" button</li>
                  <li>You'll be automatically logged in!</li>
                </ol>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
                <p className="font-medium mb-1">Welcome to TaskLinker! 🎉</p>
                <p>We're excited to have you as a {userType === 'freelancer' ? 'Freelancer' : 'Client'}.</p>
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
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

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
                />
              </div>

              <div className="space-y-2">
                <Label>I want to</Label>
                <RadioGroup value={userType} onValueChange={(value) => setUserType(value as 'freelancer' | 'client')}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="freelancer" id="freelancer" />
                    <Label htmlFor="freelancer" className="flex-1 cursor-pointer">
                      <div className="font-medium">Find Work</div>
                      <div className="text-sm text-gray-500">I'm a freelancer looking for projects</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="client" id="client" />
                    <Label htmlFor="client" className="flex-1 cursor-pointer">
                      <div className="font-medium">Hire Talent</div>
                      <div className="text-sm text-gray-500">I'm a client looking to hire</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  disabled={loading}
                />
                <label htmlFor="terms" className="text-sm text-gray-600 leading-tight cursor-pointer">
                  I agree to the{' '}
                  <Link href="/legal" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/legal" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !agreedToTerms}>
                {loading ? (
                  <>
                    <Mail className="mr-2 h-4 w-4 animate-pulse" />
                    Sending Magic Link...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
                <p className="font-medium mb-1">🔒 Secure & Passwordless</p>
                <p>We'll send you a magic link to complete signup. No passwords to remember!</p>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Login
            </Link>
          </div>

          <div className="text-xs text-center text-gray-500">
            🔒 Passwordless authentication - no passwords to remember
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

