"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Mail, AlertCircle, UserPlus, Lock } from "lucide-react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState<"freelancer" | "client">("freelancer")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    if (!agreedToTerms) {
      setError("Please accept the Terms and Privacy Policy")
      setLoading(false)
      return
    }
    try {
      const res = await fetch("/api/auth/signup-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password || "tasklinkers",
          user_type: userType,
          first_name: firstName.trim() || undefined,
          last_name: lastName.trim() || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (data.success && data.redirect) {
        window.location.href = data.redirect
        return
      }
      setError(data.error || "Failed to create account. Please try again.")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#0d1f17] to-[#052e1f] p-4">
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
            <UserPlus className="h-12 w-12 text-[#04A466]" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-[#1e293b]">
            Create Your Account
          </CardTitle>
          <CardDescription className="text-center text-[#64748b]">
            Join Tasklinkers to connect and collaborate
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="tasklinkers"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label>I want to</Label>
              <RadioGroup
                value={userType}
                onValueChange={(value) => setUserType(value as "freelancer" | "client")}
              >
                <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-[#04A466]/5 hover:border-[#04A466]/30 cursor-pointer transition-colors">
                  <RadioGroupItem value="freelancer" id="freelancer" />
                  <Label htmlFor="freelancer" className="flex-1 cursor-pointer">
                    <div className="font-medium">Find Work</div>
                    <div className="text-sm text-gray-500">I&apos;m a freelancer looking for projects</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-[#04A466]/5 hover:border-[#04A466]/30 cursor-pointer transition-colors">
                  <RadioGroupItem value="client" id="client" />
                  <Label htmlFor="client" className="flex-1 cursor-pointer">
                    <div className="font-medium">Hire Talent</div>
                    <div className="text-sm text-gray-500">I&apos;m a client looking to hire</div>
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
                I agree to the{" "}
                <Link href="/legal" className="text-[#04A466] hover:text-[#039a5c]">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/legal" className="text-[#04A466] hover:text-[#039a5c]">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#04A466] hover:bg-[#039a5c] text-white"
              disabled={loading || !agreedToTerms}
            >
              {loading ? (
                <>
                  <Lock className="mr-2 h-4 w-4 animate-pulse" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-[#04A466] hover:text-[#039a5c] font-medium">
              Log In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
