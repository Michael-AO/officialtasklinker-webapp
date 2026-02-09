"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CreditCard, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { formatNaira } from "@/lib/currency"
import { NairaIcon } from "@/components/naira-icon"

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string
        email: string
        amount: number
        currency: string
        ref: string
        metadata?: Record<string, string>
        callback: (response: { reference: string }) => void
        onClose: () => void
      }) => { openIframe: () => void }
    }
  }
}

export interface FundMilestoneModalMilestone {
  id: string
  title: string
  description?: string | null
  amount: number
  status: string
}

interface FundMilestoneModalProps {
  isOpen: boolean
  onClose: () => void
  milestone: FundMilestoneModalMilestone | null
  taskId: string
  onSuccess: () => void
}

export function FundMilestoneModal({
  isOpen,
  onClose,
  milestone,
  taskId,
  onSuccess,
}: FundMilestoneModalProps) {
  const { user } = useAuth()
  const [paystackLoaded, setPaystackLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const paystackKey =
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_50596166815e556fc669cd96003c1d2851d40621"
  const isPaystackConfigured = Boolean(paystackKey && paystackKey.startsWith("pk_"))

  useEffect(() => {
    if (!isOpen) return

    const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')
    if (existingScript) {
      setPaystackLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://js.paystack.co/v1/inline.js"
    script.async = true
    script.onload = () => setPaystackLoaded(true)
    script.onerror = () => {
      toast({
        title: "Payment Error",
        description: "Failed to load payment system. Please refresh and try again.",
        variant: "destructive",
      })
    }
    document.head.appendChild(script)
  }, [isOpen])

  const handleFund = () => {
    if (!user || !milestone) return
    if (!isPaystackConfigured) {
      toast({
        title: "Payment Configuration Error",
        description: "Paystack is not properly configured. Please contact support.",
        variant: "destructive",
      })
      return
    }
    if (!paystackLoaded || !window.PaystackPop) {
      toast({
        title: "Payment System Loading",
        description: "Please wait a moment and try again.",
        variant: "destructive",
      })
      return
    }

    const amountKobo = Math.round(Number(milestone.amount) * 100)
    if (amountKobo <= 0) {
      toast({
        title: "Invalid Amount",
        description: "This milestone has an invalid amount.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const paymentReference = `TL_MIL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    try {
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: user.email,
        amount: amountKobo,
        currency: "NGN",
        ref: paymentReference,
        metadata: {
          milestoneId: milestone.id,
          taskId,
          userId: user.id,
        },
        callback: async (response: { reference: string }) => {
          try {
            const verifyResponse = await fetch("/api/escrow/milestone/fund/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                reference: response.reference,
                milestone_id: milestone.id,
              }),
            })
            const data = await verifyResponse.json()

            if (verifyResponse.ok && data.success) {
              toast({
                title: "Milestone funded",
                description: `${formatNaira(milestone.amount)} has been secured for this milestone.`,
              })
              onSuccess()
              onClose()
            } else {
              throw new Error(data.error || "Verification failed")
            }
          } catch (err) {
            toast({
              title: "Milestone funding failed",
              description:
                err instanceof Error ? err.message : "Please try again or contact support.",
              variant: "destructive",
            })
          } finally {
            setIsLoading(false)
          }
        },
        onClose: () => setIsLoading(false),
      })
      handler.openIframe()
    } catch (err) {
      setIsLoading(false)
      toast({
        title: "Payment failed",
        description: err instanceof Error ? err.message : "Could not open payment.",
        variant: "destructive",
      })
    }
  }

  if (!milestone) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Fund Milestone
          </DialogTitle>
          <DialogDescription>
            Pay the milestone amount in Naira (₦) via Paystack. Funds will be held in escrow until the milestone is completed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="font-medium">{milestone.title}</p>
          {milestone.description && (
            <p className="text-sm text-muted-foreground">{milestone.description}</p>
          )}
          <div className="flex items-center gap-2 text-lg font-semibold">
            <NairaIcon className="h-5 w-5" />
            {formatNaira(milestone.amount)}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleFund} disabled={isLoading || !paystackLoaded}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay with Paystack
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
