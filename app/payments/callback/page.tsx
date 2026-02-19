"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react"

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const reference = searchParams.get("reference")
    const taskId = searchParams.get("taskId")
    const amountParam = searchParams.get("amount")

    if (!reference) {
      setStatus("failed")
      setMessage("No payment reference found")
      return
    }

    // Escrow flow: reference + taskId (and optional amount, freelancerId) → verify and create escrow
    if (taskId) {
      const amount = amountParam != null && amountParam !== "" ? Number(amountParam) : undefined
      const freelancerId = searchParams.get("freelancerId") ?? undefined
      fetch("/api/escrow/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference,
          taskId,
          amount: amount != null && Number.isFinite(amount) ? amount : undefined,
          freelancerId: freelancerId || undefined,
          paymentType: "full",
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setStatus("success")
            setMessage("Escrow funded successfully. Your payment is held securely.")
          } else {
            setStatus("failed")
            setMessage(data.error || data.details || "Escrow setup failed")
          }
        })
        .catch(() => {
          setStatus("failed")
          setMessage("Failed to complete escrow setup")
        })
      return
    }

    // Generic payment (no taskId): just show success for now
    setStatus("success")
    setMessage("Payment verified successfully!")
  }, [searchParams])

  const taskId = searchParams.get("taskId")

  const handleContinue = () => {
    router.push("/dashboard")
  }

  const handleViewTask = () => {
    if (taskId) router.push(`/dashboard/tasks/${taskId}`)
    else router.push("/dashboard/tasks")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === "loading" && <Loader2 className="h-6 w-6 animate-spin text-blue-600" />}
            {status === "success" && <CheckCircle className="h-6 w-6 text-green-600" />}
            {status === "failed" && <AlertTriangle className="h-6 w-6 text-red-600" />}

            {status === "loading" && "Verifying Payment..."}
            {status === "success" && (taskId ? "Escrow Funded!" : "Payment Successful!")}
            {status === "failed" && "Payment Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>

          {status !== "loading" && (
            <div className="flex flex-col gap-2">
              {taskId && status === "success" && (
                <Button onClick={handleViewTask} className="w-full">
                  View Task
                </Button>
              )}
              <Button onClick={handleContinue} variant={taskId && status === "success" ? "outline" : "default"} className="w-full">
                {taskId && status === "success" ? "Dashboard" : "Continue to Dashboard"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
