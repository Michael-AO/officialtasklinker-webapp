"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useCallback } from "react"

const NIN_LENGTH = 11
const NIN_DIGITS_ONLY = /^\d*$/

export function DashboardVerificationGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading, refreshUser } = useAuth()
  const [nin, setNin] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\s/g, "").slice(0, NIN_LENGTH)
    if (v === "" || NIN_DIGITS_ONLY.test(v)) setNin(v)
    setError(null)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = nin.trim().replace(/\s/g, "")
      if (trimmed.length !== NIN_LENGTH) {
        setError("NIN must be exactly 11 digits.")
        return
      }
      setSubmitting(true)
      setError(null)
      try {
        const res = await fetch("/api/verification/youverify/nin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ nin: trimmed }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError((data.message ?? data.error) || "Verification failed. Please try again.")
          return
        }
        await refreshUser()
      } catch {
        setError("Something went wrong. Please try again.")
      } finally {
        setSubmitting(false)
      }
    },
    [nin, refreshUser]
  )

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[200px]">
        <div className="animate-spin h-8 w-8 border-2 border-[#04A466] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    return <>{children}</>
  }

  if (user.is_verified) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      <div
        className="fixed inset-0 z-[100] bg-black/60"
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="verification-title"
        aria-describedby="verification-desc"
        className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg"
      >
        <h2 id="verification-title" className="text-lg font-semibold">
          Identity verification required
        </h2>
        <p id="verification-desc" className="mt-1 text-sm text-muted-foreground">
          Enter your 11-digit National Identification Number (NIN) to verify your identity. This step cannot be skipped.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nin-input">NIN (11 digits)</Label>
            <Input
              id="nin-input"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Enter your NIN"
              value={nin}
              onChange={handleNinChange}
              maxLength={NIN_LENGTH}
              className="font-mono text-lg"
              disabled={submitting}
              aria-invalid={!!error}
              aria-describedby={error ? "nin-error" : undefined}
            />
            {error && (
              <p id="nin-error" className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-[#04A466] hover:bg-[#04A466]/90"
            disabled={submitting || nin.trim().replace(/\s/g, "").length !== NIN_LENGTH}
          >
            {submitting ? "Verifying…" : "Verify"}
          </Button>
        </form>
      </div>
    </>
  )
}
