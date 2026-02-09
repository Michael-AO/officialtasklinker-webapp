"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { CheckCircle2 } from "lucide-react"

const YOUVERIFY_LIVENESS_SCRIPT = "https://cdn.jsdelivr.net/npm/youverify-liveness-web@1.0.1/dist/index.umd.cjs"
const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS = 30000
const SUCCESS_DELAY_MS = 1500

declare global {
  interface Window {
    YouVerifyLiveness?: {
      init: (options: { sessionId: string; container: HTMLElement }) => void
    }
  }
}

type StartResult = { sessionId?: string; error?: string; message?: string } | null
type Phase = "idle" | "sdk" | "processing" | "verified" | "timeout" | "error"

export function YouVerifyModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<StartResult>(null)
  const [phase, setPhase] = useState<Phase>("idle")

  const loadScript = useCallback((): Promise<void> => {
    if (typeof document === "undefined") return Promise.resolve()
    const existing = document.querySelector(`script[src="${YOUVERIFY_LIVENESS_SCRIPT}"]`)
    if (existing) return Promise.resolve()
    return new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = YOUVERIFY_LIVENESS_SCRIPT
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Failed to load YouVerify SDK"))
      document.head.appendChild(script)
    })
  }, [])

  const startSession = useCallback(async () => {
    setLoading(true)
    setResult(null)
    setPhase("idle")
    try {
      const res = await fetch("/api/verification/youverify/start", {
        method: "POST",
        credentials: "include",
      })
      const data = (await res.json().catch(() => ({}))) || {}
      const message = data.error || data.message || "Verification session could not be started."
      if (!res.ok) {
        setResult({ error: message, message })
        setPhase("error")
        return
      }
      if (!data.sessionId) {
        setResult({ error: message, message })
        setPhase("error")
        return
      }
      setResult({ sessionId: data.sessionId, message: data.message })
    } catch {
      setResult({ error: "Could not reach server. Please try again.", message: "Could not reach server. Please try again." })
      setPhase("error")
    } finally {
      setLoading(false)
    }
  }, [])

  const startPolling = useCallback(() => {
    setPhase("processing")
    const stopPolling = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current)
        pollTimeoutRef.current = null
      }
    }
    pollTimeoutRef.current = setTimeout(() => {
      stopPolling()
      setPhase("timeout")
    }, POLL_TIMEOUT_MS)
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/verification/status", { credentials: "include" })
        const data = await res.json().catch(() => ({}))
        const verified = data?.is_verified === true || data?.status?.status === "verified"
        if (verified) {
          stopPolling()
          await refreshUser()
          setPhase("verified")
          setTimeout(() => {
            onOpenChange(false)
            setResult(null)
            setPhase("idle")
            router.push("/dashboard/browse")
          }, SUCCESS_DELAY_MS)
        }
      } catch {
        // ignore single poll failure
      }
    }, POLL_INTERVAL_MS)
  }, [refreshUser, onOpenChange, router])

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current)
    }
  }, [])

  const handleCompletedVerification = useCallback(() => {
    startPolling()
  }, [startPolling])

  // When modal opens, start session
  useEffect(() => {
    if (open && !result && !loading) {
      startSession()
    }
  }, [open])

  useEffect(() => {
    if (open && result?.sessionId) {
      setPhase("sdk")
    } else if (!open) {
      setPhase("idle")
    }
  }, [open, result?.sessionId])

  const handleRetry = useCallback(() => {
    setResult(null)
    setPhase("idle")
    startSession()
  }, [startSession])

  // When we have sessionId, load SDK and init
  useEffect(() => {
    if (!open || !result?.sessionId || !containerRef.current) return

    let cancelled = false

    const initSdk = async () => {
      try {
        await loadScript()
        if (cancelled) return
        const container = containerRef.current
        if (!container) return
        const global = (window as Window).YouVerifyLiveness
        if (global?.init) {
          global.init({ sessionId: result.sessionId!, container })
        } else {
          // Fallback: SDK might expose different global name
          const w = window as Record<string, unknown>
          const entry = w.YouVerifyLiveness ?? w.youverifyLiveness
          if (entry && typeof (entry as { init?: (opts: unknown) => void }).init === "function") {
            (entry as { init: (opts: { sessionId: string; container: HTMLElement }) => void }).init({
              sessionId: result.sessionId!,
              container,
            })
          }
        }
      } catch (e) {
        if (!cancelled) {
          console.error("YouVerify SDK init error:", e)
          setPhase("error")
          setResult({ error: "YouVerify could not be loaded. Please try again or contact support.", message: "YouVerify could not be loaded. Please try again or contact support." })
          toast({
            title: "Verification unavailable",
            description: "YouVerify could not be loaded. Please try again or contact support.",
            variant: "destructive",
          })
        }
      }
    }

    initSdk()
    return () => {
      cancelled = true
    }
  }, [open, result?.sessionId, loadScript])

  const handleClose = (next: boolean) => {
    if (!next) {
      setResult(null)
      setPhase("idle")
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify identity</DialogTitle>
          <DialogDescription>
            Complete identity verification to unlock Browse Tasks, Applications, and Post Task.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {phase === "verified" ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <CheckCircle2 className="h-16 w-16 text-[#04A466] animate-in zoom-in-50 duration-300" />
              <p className="text-lg font-medium text-[#04A466]">You&apos;re verified!</p>
              <p className="text-sm text-muted-foreground">Taking you to browse tasks...</p>
            </div>
          ) : phase === "processing" ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="animate-spin h-10 w-10 border-2 border-[#04A466] border-t-transparent rounded-full" />
              <p className="font-medium">Processing your verification...</p>
              <p className="text-sm text-muted-foreground">This usually takes a few seconds.</p>
            </div>
          ) : phase === "timeout" ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <p className="text-sm text-center text-muted-foreground">
                Verification is still processing. We&apos;ll update your account shortly—you can close this and check back in a few minutes.
              </p>
              <Button variant="outline" onClick={() => handleClose(false)}>
                Close
              </Button>
            </div>
          ) : phase === "error" && result ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <p className="text-sm text-center text-destructive font-medium">
                {result.error || result.message || "Verification is temporarily unavailable."}
              </p>
              <p className="text-xs text-center text-muted-foreground">
                You can try again or contact support if the problem continues.
              </p>
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1" onClick={() => handleClose(false)}>
                  Close
                </Button>
                <Button className="flex-1 bg-[#04A466] hover:bg-[#04A466]/90" onClick={handleRetry}>
                  Try again
                </Button>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-[#04A466] border-t-transparent rounded-full" />
            </div>
          ) : result?.sessionId && phase === "sdk" ? (
            <>
              <div
                ref={containerRef}
                className="min-h-[280px] w-full rounded-lg border border-gray-200 bg-gray-50/50"
                id="youverify-sdk-container"
              />
              <p className="text-xs text-muted-foreground text-center">
                Complete the steps above, then click below.
              </p>
              <Button
                onClick={handleCompletedVerification}
                className="w-full bg-[#04A466] hover:bg-[#04A466]/90"
              >
                I&apos;ve completed verification
              </Button>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
