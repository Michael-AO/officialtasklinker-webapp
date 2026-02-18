"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Lock, AlertCircle, Shield } from "lucide-react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
        credentials: "same-origin",
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success && data.redirect) {
        // Full page navigation so the cookie set by the response is sent on the next request
        window.location.href = data.redirect
        return
      }
      setError(data.error || "Login failed. Please try again.")
    } catch {
      setError("Something went wrong. Please try again.")
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
            <Shield className="h-12 w-12 text-[#04A466]" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-[#1e293b]">
            Admin sign in
          </CardTitle>
          <CardDescription className="text-center text-[#64748b]">
            Use your admin email and password to access the dashboard.
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
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#04A466] hover:bg-[#039a5c] text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Lock className="mr-2 h-4 w-4 animate-pulse" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Sign in
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-600">
            Not an admin?{" "}
            <Link href="/login" className="text-[#04A466] hover:text-[#039a5c] font-medium">
              Go to login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
