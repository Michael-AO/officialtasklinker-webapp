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

    if (!reference) {
      setStatus("failed")
      setMessage("No payment reference found")
      return
    }

    // Simulate payment verification for now
    setTimeout(() => {
      setStatus("success")
      setMessage("Payment verified successfully!")
    }, 2000)
  }, [searchParams])

  const handleContinue = () => {
    router.push("/dashboard")
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
            {status === "success" && "Payment Successful!"}
            {status === "failed" && "Payment Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>

          {status !== "loading" && (
            <Button onClick={handleContinue} className="w-full">
              Continue to Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
