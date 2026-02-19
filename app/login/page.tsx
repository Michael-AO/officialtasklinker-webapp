"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Mail, AlertCircle } from "lucide-react"

function normalizeLoginError(raw: string | null): string {
  if (!raw) return "Something went wrong. Please try again."
  return raw
}

function LoginContent() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) setError(normalizeLoginError(errorParam))
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/auth/login-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const contentType = res.headers.get("Content-Type") ?? ""
      if (res.ok && contentType.includes("text/html")) {
        const redirectTo = res.headers.get("X-Redirect-To") || "/dashboard"
        window.location.href = redirectTo
        return
      }
      const data = await res.json().catch(() => ({}))
      if (data.success && data.redirect) {
        window.location.href = data.redirect
        return
      }
      setError(normalizeLoginError(data.error || "Login failed. Please try again."))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.")
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
            <Mail className="h-12 w-12 text-[#04A466]" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-[#1e293b]">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-[#64748b]">
            Enter your email to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <Button
              type="submit"
              className="w-full bg-[#04A466] hover:bg-[#039a5c] text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Mail className="mr-2 h-4 w-4 animate-pulse" />
                  Signing in...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Log In
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#04A466] hover:text-[#039a5c] font-medium">
              Sign Up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#0d1f17] to-[#052e1f]">
          <div className="animate-pulse text-white/70">Loading...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
