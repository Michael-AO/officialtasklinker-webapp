"use client"

import { useAuth } from "@/contexts/auth-context"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useCallback, useEffect } from "react"
import { CheckCircle2 } from "lucide-react"

const NIN_LENGTH = 11
const NIN_DIGITS_ONLY = /^\d*$/
const SUCCESS_DELAY_MS = 2000

// YouVerify branding: NIN verification is API-only (no pre-built modal from them). vForm/Liveness SDK have their own UI; we add logo + "Powered by" for clarity.

/** Dev only: ?simulate_unverified=1 forces the verification modal to show for testing. */
function useForceUnverified() {
  const searchParams = useSearchParams()
  return typeof window !== "undefined" && searchParams.get("simulate_unverified") === "1"
}

export function DashboardVerificationGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading, refreshUser } = useAuth()
  const forceUnverified = useForceUnverified()
  const [nin, setNin] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [logoError, setLogoError] = useState(false)

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
        setShowSuccess(true)
      } catch {
        setError("Something went wrong. Please try again.")
      } finally {
        setSubmitting(false)
      }
    },
    [nin]
  )

  useEffect(() => {
    if (!showSuccess) return
    const t = setTimeout(() => {
      refreshUser()
    }, SUCCESS_DELAY_MS)
    return () => clearTimeout(t)
  }, [showSuccess, refreshUser])

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

  const showVerificationModal = !user.is_verified || forceUnverified
  if (!showVerificationModal) {
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
        aria-labelledby={showSuccess ? "success-title" : "verification-title"}
        aria-describedby={showSuccess ? "success-desc" : "verification-desc"}
        className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg"
      >
        {/* YouVerify branding: they provide API/SDK for NIN and Liveness, not a ready-made NIN modal; we built this UI and add their branding. */}
        <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
          <a
            href="https://youverify.co"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="YouVerify"
          >
            {!logoError && (
              <img
                src="https://youverify.co/favicon.ico"
                alt=""
                className="h-6 w-6 rounded"
                width={24}
                height={24}
                onError={() => setLogoError(true)}
              />
            )}
            <span className="text-sm font-medium">YouVerify</span>
          </a>
        </div>

        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <CheckCircle2 className="h-16 w-16 text-[#04A466] animate-in zoom-in-50 duration-300" />
            <h2 id="success-title" className="text-lg font-semibold text-[#04A466]">
              Verification successful
            </h2>
            <p id="success-desc" className="text-sm text-muted-foreground text-center">
              Your identity has been verified. You now have full access to the platform.
            </p>
            <p className="text-xs text-muted-foreground">Taking you to your dashboard...</p>
          </div>
        ) : (
          <>
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
          </>
        )}

        <p className="mt-6 pt-3 border-t border-border text-center text-xs text-muted-foreground">
          <a
            href="https://youverify.co"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Powered by YouVerify
          </a>
        </p>
      </div>
    </>
  )
}
