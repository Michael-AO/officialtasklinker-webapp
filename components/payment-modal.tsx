"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Shield, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  taskId?: string
  taskTitle?: string
  onPaymentSuccess?: () => void
}

// Declare Paystack types
declare global {
  interface Window {
    PaystackPop: {
      setup: (options: any) => {
        openIframe: () => void
      }
    }
  }
}

export function PaymentModal({ isOpen, onClose, taskId, taskTitle, onPaymentSuccess }: PaymentModalProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTask, setIsLoadingTask] = useState(false)
  const [paystackLoaded, setPaystackLoaded] = useState(false)
  const [taskData, setTaskData] = useState<any>(null)
  const [taskError, setTaskError] = useState<string | null>(null)
  const [paymentStep, setPaymentStep] = useState<"payment" | "success">("payment")

  // Get Paystack key from environment
  const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_50596166815e556fc669cd96003c1d2851d40621"
  const isPaystackConfigured = Boolean(paystackKey && paystackKey.startsWith("pk_"))

  console.log("🔑 Paystack Key Check:", {
    key: paystackKey ? `${paystackKey.substring(0, 10)}...` : "Not found",
    configured: isPaystackConfigured,
    env: process.env.NODE_ENV,
  })

  // Load Paystack script and task data
  useEffect(() => {
    if (!isOpen) return

    // Reset state when modal opens
    setPaymentStep("payment")
    setTaskError(null)

    // Load task data
    const fetchTaskData = async () => {
      if (taskId) {
        setIsLoadingTask(true)
        try {
          console.log("📋 Fetching task data for ID:", taskId)
          const response = await fetch(`/api/tasks/${taskId}`)

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.task) {
              setTaskData(data.task)
              console.log("✅ Task data loaded:", data.task)
            } else {
              throw new Error(data.error || "Failed to load task data")
            }
          } else {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`
            try {
              const errorData = await response.json()
              errorMessage = errorData.error || errorData.details || errorMessage
            } catch (e) {
              // If JSON parsing fails, use the default error message
            }
            throw new Error(errorMessage)
          }
        } catch (error) {
          console.error("❌ Failed to fetch task data:", error)
          const errorMessage = error instanceof Error ? error.message : "Failed to load task data"
          setTaskError(errorMessage)
          toast({
            title: "Error Loading Task",
            description: "Failed to load task details. Please try again.",
            variant: "destructive",
          })
        } finally {
          setIsLoadingTask(false)
        }
      }
    }

    // Load Paystack script
    const loadPaystackScript = () => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')
      if (existingScript) {
        console.log("✅ Paystack script already exists")
        setTimeout(() => {
          console.log("🔍 Checking PaystackPop availability:", {
            PaystackPop: typeof window.PaystackPop,
            windowKeys: Object.keys(window).filter((k) => k.toLowerCase().includes("paystack")),
          })
        }, 1000)
        setPaystackLoaded(true)
        return
      }

      console.log("📦 Loading Paystack script...")
      const script = document.createElement("script")
      script.src = "https://js.paystack.co/v1/inline.js"
      script.async = true
      script.onload = () => {
        console.log("✅ Paystack script loaded successfully")
        setPaystackLoaded(true)
      }
      script.onerror = (error) => {
        console.error("❌ Failed to load Paystack script:", error)
        toast({
          title: "Payment Error",
          description: "Failed to load payment system. Please refresh and try again.",
          variant: "destructive",
        })
      }
      document.head.appendChild(script)
    }

    fetchTaskData()
    loadPaystackScript()
  }, [isOpen, taskId])

  const calculateAmount = () => {
    if (!taskData) return 0

    // Use budget_max as the escrow amount (or budget_min as fallback)
    const escrowAmount = Number(taskData.budget_max || taskData.budget_min) || 0
    const platformFee = escrowAmount * 0.05 // 5% platform fee
    return Math.round(escrowAmount + platformFee)
  }

  const isPaymentReady = () => {
    return (
      !isLoading &&
      !isLoadingTask &&
      paystackLoaded &&
      taskData &&
      !taskError &&
      isPaystackConfigured &&
      calculateAmount() > 0
    )
  }

  const handlePayment = async () => {
    console.log("🚀 Payment button clicked")
    console.log("🔑 Using Paystack key:", paystackKey ? `${paystackKey.substring(0, 15)}...` : "Not found")

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make payments.",
        variant: "destructive",
      })
      return
    }

    if (!isPaystackConfigured) {
      console.log("❌ Paystack not configured")
      toast({
        title: "Payment Configuration Error",
        description: "Paystack is not properly configured. Please contact support.",
        variant: "destructive",
      })
      return
    }

    if (!paystackLoaded) {
      console.log("❌ Paystack script not loaded yet")
      toast({
        title: "Payment System Loading",
        description: "Please wait for the payment system to load and try again.",
        variant: "destructive",
      })
      return
    }

    if (!window.PaystackPop) {
      console.log("❌ PaystackPop not available on window object")
      console.log(
        "Window keys:",
        Object.keys(window).filter((k) => k.toLowerCase().includes("paystack")),
      )
      toast({
        title: "Payment Error",
        description: "Payment system not available. Please refresh and try again.",
        variant: "destructive",
      })
      return
    }

    const amount = calculateAmount()
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please check the payment amount and try again.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const paymentReference = `TL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      console.log("💳 Initializing Paystack payment:", {
        email: user.email,
        amount: amount * 100, // Convert to kobo
        reference: paymentReference,
        taskId: taskId,
        key: `${paystackKey.substring(0, 15)}...`,
      })

      // Initialize Paystack payment
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: user.email,
        amount: amount * 100, // Convert to kobo
        currency: "NGN",
        ref: paymentReference,
        metadata: {
          taskId: taskId,
          taskTitle: taskTitle,
          userId: user.id,
          userName: user.name || user.email,
        },
        callback: async (response: any) => {
          console.log("✅ Paystack payment callback:", response)

          try {
            // Verify payment on backend
            console.log("🔍 Verifying payment with backend...")
            const verifyResponse = await fetch("/api/paystack/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                reference: response.reference,
                taskId: taskId,
                userId: user.id,
              }),
            })

            const verifyData = await verifyResponse.json()
            console.log("📊 Verification response:", verifyData)

            if (verifyResponse.ok && verifyData.success) {
              console.log("✅ Payment verified, escrow created, and task activated!")
              setPaymentStep("success")
              toast({
                title: "Payment Successful!",
                description: "Your task has been posted and is now live with escrow protection!",
              })
            } else {
              throw new Error(verifyData.error || "Payment verification failed")
            }
          } catch (error) {
            console.error("❌ Payment verification error:", error)
            toast({
              title: "Payment Verification Failed",
              description: "Payment was processed but verification failed. Please contact support.",
              variant: "destructive",
            })
          } finally {
            setIsLoading(false)
          }
        },
        onClose: () => {
          console.log("🔒 Paystack payment modal closed")
          setIsLoading(false)
        },
      })

      console.log("🎯 Opening Paystack iframe...")
      handler.openIframe()
    } catch (error) {
      console.error("❌ Payment initialization failed:", error)
      setIsLoading(false)
      toast({
        title: "Payment Failed",
        description: `Failed to initialize payment: ${error}`,
        variant: "destructive",
      })
    }
  }

  const handleSuccess = () => {
    // Close modal first
    onClose()

    // Call success callback if provided
    if (onPaymentSuccess) {
      onPaymentSuccess()
    }

    // Redirect to user's tasks page
    setTimeout(() => {
      router.push("/dashboard/tasks")
      toast({
        title: "Task Posted Successfully!",
        description: "Your task is now live and visible to freelancers.",
      })
    }, 500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {paymentStep === "payment" ? (
              <>
                <Shield className="h-5 w-5 text-blue-600" />
                Fund Escrow
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Task Posted Successfully!
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {paymentStep === "payment"
              ? "Complete payment to fund escrow and post your task"
              : "Your task is now live with escrow protection"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {paymentStep === "payment" && (
            <>
              {/* Loading task data */}
              {isLoadingTask && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                  <span className="text-sm text-blue-700">Loading task details...</span>
                </div>
              )}

              {/* Task error */}
              {taskError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium">Failed to load task</p>
                    <p>{taskError}</p>
                  </div>
                </div>
              )}

              {/* Loading payment system */}
              {!paystackLoaded && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />
                  <span className="text-sm text-yellow-700">Loading payment system...</span>
                </div>
              )}

              {/* Task summary */}
              {!taskData && !isLoadingTask && !taskError && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-700">No task data available</span>
                </div>
              )}

              {taskData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Payment Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Task:</span>
                      <span className="font-medium">{taskData.title || "Untitled Task"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Escrow Amount:</span>
                      <span className="font-medium">
                        ₦{(taskData.budget_max || taskData.budget_min || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform Fee (5%):</span>
                      <span className="font-medium">
                        ₦{Math.round((taskData.budget_max || taskData.budget_min || 0) * 0.05).toLocaleString()}
                      </span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>₦{calculateAmount().toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Secure Escrow Protection</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Your payment will be held securely until work is completed to your satisfaction.
                    </p>
                  </div>
                </div>
              </div>

              {/* Debug info */}
              <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded space-y-1">
                <div>Task ID: {taskId || "None"}</div>
                <div>Task Loaded: {taskData ? "Yes" : "No"}</div>
                <div>Budget Min: {taskData?.budget_min || "Not set"}</div>
                <div>Budget Max: {taskData?.budget_max || "Not set"}</div>
                <div>Calculated Amount: ₦{calculateAmount().toLocaleString()}</div>
                <div>Task Title: {taskData?.title || "Not loaded"}</div>
              </div>

              {/* Configuration status */}
              {isPaystackConfigured ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">Paystack configured ✓</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">Paystack not configured</span>
                </div>
              )}

              {/* Payment button */}
              <Button onClick={handlePayment} disabled={!isPaymentReady()} className="w-full" size="lg">
                <CreditCard className="h-4 w-4 mr-2" />
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ₦${calculateAmount().toLocaleString()} & Post Task`
                )}
              </Button>
            </>
          )}

          {paymentStep === "success" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>

              <div>
                <h3 className="text-lg font-semibold">Task Posted Successfully!</h3>
                <p className="text-muted-foreground mt-2">
                  Your task is now live with ₦{calculateAmount().toLocaleString()} escrow protection.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                <p className="text-sm text-green-700 font-medium">✅ Task is now visible to freelancers</p>
                <p className="text-sm text-green-700">✅ Escrow protection activated</p>
                <p className="text-sm text-green-700">✅ Ready to receive applications</p>
              </div>

              <Button onClick={handleSuccess} className="w-full" size="lg">
                View My Tasks
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
