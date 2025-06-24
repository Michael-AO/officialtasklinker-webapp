"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Shield, AlertCircle, CheckCircle, Loader2, Plus, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { formatNaira } from "@/lib/currency"

interface EscrowSetupModalProps {
  isOpen: boolean
  onClose: () => void
  taskId: string
  freelancerId: string
  freelancerName: string
  proposedBudget: number
  taskTitle: string
  onEscrowCreated?: () => void
}

interface Milestone {
  id: string
  title: string
  description: string
  amount: number
  dueDate: string
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

export function EscrowSetupModal({
  isOpen,
  onClose,
  taskId,
  freelancerId,
  freelancerName,
  proposedBudget,
  taskTitle,
  onEscrowCreated,
}: EscrowSetupModalProps) {
  const { user } = useAuth()
  const [paymentType, setPaymentType] = useState<"full" | "milestones">("full")
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: "1",
      title: "Project Setup & Planning",
      description: "Initial setup and project planning phase",
      amount: Math.round(proposedBudget * 0.3),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
    {
      id: "2",
      title: "Development Phase",
      description: "Main development and implementation",
      amount: Math.round(proposedBudget * 0.5),
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
    {
      id: "3",
      title: "Final Delivery & Testing",
      description: "Final testing, bug fixes, and project delivery",
      amount: Math.round(proposedBudget * 0.2),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [paystackLoaded, setPaystackLoaded] = useState(false)
  const [step, setStep] = useState<"setup" | "payment" | "success">("setup")

  // Get Paystack key
  const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_50596166815e556fc669cd96003c1d2851d40621"

  useEffect(() => {
    if (!isOpen) return

    const loadPaystackScript = () => {
      const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')
      if (existingScript) {
        setPaystackLoaded(true)
        return
      }

      const script = document.createElement("script")
      script.src = "https://js.paystack.co/v1/inline.js"
      script.async = true
      script.onload = () => {
        setPaystackLoaded(true)
        console.log("Paystack script loaded successfully")
      }
      script.onerror = () => {
        console.error("Failed to load Paystack script")
        toast({
          title: "Payment Error",
          description: "Failed to load payment system. Please refresh and try again.",
          variant: "destructive",
        })
      }
      document.head.appendChild(script)
    }

    loadPaystackScript()
  }, [isOpen])

  const totalMilestoneAmount = milestones.reduce((sum, milestone) => sum + milestone.amount, 0)
  const platformFee = Math.round((paymentType === "full" ? proposedBudget : totalMilestoneAmount) * 0.05)
  const totalAmount = (paymentType === "full" ? proposedBudget : totalMilestoneAmount) + platformFee

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      title: "",
      description: "",
      amount: 0,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    }
    setMilestones([...milestones, newMilestone])
  }

  const removeMilestone = (id: string) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((m) => m.id !== id))
    }
  }

  const updateMilestone = (id: string, field: keyof Milestone, value: string | number) => {
    setMilestones(milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)))
  }

  // Test function to bypass payment for debugging
  const handleTestEscrow = async () => {
    setIsLoading(true)
    setStep("payment")

    try {
      const testReference = `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      console.log("🧪 Testing escrow creation without payment...")

      const response = await fetch("/api/escrow/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: testReference,
          taskId,
          freelancerId,
          amount: totalAmount,
          paymentType,
          milestones: paymentType === "milestones" ? milestones : null,
        }),
      })

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error("❌ Failed to parse response as JSON:", parseError)
        const text = await response.text()
        console.error("❌ Response text:", text)
        throw new Error("Server returned invalid JSON response")
      }

      console.log("🔍 API Response:", { status: response.status, data })

      if (response.ok && data.success) {
        setStep("success")
        toast({
          title: "Test Escrow Created!",
          description: `Test escrow created successfully for ${freelancerName}.`,
        })

        if (onEscrowCreated) {
          onEscrowCreated()
        }
      } else {
        console.error("❌ API Error:", data)
        toast({
          title: "Escrow Creation Failed",
          description: data.details || data.error || "Unknown error occurred",
          variant: "destructive",
        })
        setStep("setup")
      }
    } catch (error) {
      console.error("❌ Network Error:", error)
      toast({
        title: "Network Error",
        description: error instanceof Error ? error.message : "Failed to connect to server. Please try again.",
        variant: "destructive",
      })
      setStep("setup")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!user || !paystackLoaded || !window.PaystackPop) {
      toast({
        title: "Payment Error",
        description: "Payment system not ready. Please try again.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setStep("payment")

    try {
      const paymentReference = `ESC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: user.email,
        amount: totalAmount * 100, // Convert to kobo
        currency: "NGN",
        ref: paymentReference,
        metadata: {
          taskId,
          freelancerId,
          paymentType,
          milestones: paymentType === "milestones" ? milestones : null,
          type: "escrow_funding",
        },
        callback: (response) => {
          handlePaymentSuccess(response)
        },
        onClose: () => {
          setIsLoading(false)
          setStep("setup")
        },
      })

      handler.openIframe()
    } catch (error) {
      console.error("Payment initialization failed:", error)
      setIsLoading(false)
      setStep("setup")
      toast({
        title: "Payment Failed",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePaymentSuccess = async (response: any) => {
    try {
      console.log("💳 Payment successful, creating escrow...")

      const verifyResponse = await fetch("/api/escrow/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: response.reference,
          taskId,
          freelancerId,
          amount: totalAmount,
          paymentType,
          milestones: paymentType === "milestones" ? milestones : null,
        }),
      })

      const verifyData = await verifyResponse.json()

      console.log("🔍 Escrow API Response:", {
        status: verifyResponse.status,
        data: verifyData,
      })

      if (verifyResponse.ok && verifyData.success) {
        setStep("success")
        toast({
          title: "Escrow Created Successfully!",
          description: `₦${totalAmount.toLocaleString()} has been secured in escrow for ${freelancerName}.`,
        })

        if (onEscrowCreated) {
          onEscrowCreated()
        }
      } else {
        console.error("❌ Escrow creation failed:", verifyData)
        toast({
          title: "Escrow Creation Failed",
          description: verifyData.details || verifyData.error || "Unknown error occurred",
          variant: "destructive",
        })
        setStep("setup")
      }
    } catch (error) {
      console.error("❌ Escrow creation error:", error)
      toast({
        title: "Network Error",
        description: "Failed to create escrow. Please contact support.",
        variant: "destructive",
      })
      setStep("setup")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccess = () => {
    onClose()
    window.location.href = `/dashboard/tasks/${taskId}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "setup" && (
              <>
                <Shield className="h-5 w-5 text-blue-600" />
                Setup Escrow Protection
              </>
            )}
            {step === "payment" && (
              <>
                <CreditCard className="h-5 w-5 text-blue-600" />
                Processing Payment
              </>
            )}
            {step === "success" && (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Escrow Created Successfully!
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === "setup" && "Set up secure escrow protection for your project"}
            {step === "payment" && "Please complete the payment to fund the escrow"}
            {step === "success" && "Your project is now protected with escrow"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === "setup" && (
            <>
              {/* Project Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Project Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Task:</span>
                    <span className="font-medium">{taskTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Freelancer:</span>
                    <span className="font-medium">{freelancerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Proposed Budget:</span>
                    <span className="font-medium">{formatNaira(proposedBudget)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Payment Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentType}
                    onValueChange={(value: "full" | "milestones") => setPaymentType(value)}
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="full" id="full" />
                      <Label htmlFor="full" className="flex-1">
                        <div>
                          <div className="font-medium">Full Payment</div>
                          <div className="text-sm text-muted-foreground">
                            Pay the entire amount upfront. Funds released when project is completed.
                          </div>
                        </div>
                      </Label>
                      <Badge variant="secondary">{formatNaira(proposedBudget)}</Badge>
                    </div>

                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="milestones" id="milestones" />
                      <Label htmlFor="milestones" className="flex-1">
                        <div>
                          <div className="font-medium">Milestone-Based Payment</div>
                          <div className="text-sm text-muted-foreground">
                            Break project into phases. Pay as each milestone is completed.
                          </div>
                        </div>
                      </Label>
                      <Badge variant="secondary">{formatNaira(totalMilestoneAmount)}</Badge>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Milestone Configuration */}
              {paymentType === "milestones" && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Project Milestones</CardTitle>
                    <Button variant="outline" size="sm" onClick={addMilestone}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Milestone
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {milestones.map((milestone, index) => (
                      <div key={milestone.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Milestone {index + 1}</h4>
                          {milestones.length > 1 && (
                            <Button variant="ghost" size="sm" onClick={() => removeMilestone(milestone.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`title-${milestone.id}`}>Title</Label>
                            <Input
                              id={`title-${milestone.id}`}
                              value={milestone.title}
                              onChange={(e) => updateMilestone(milestone.id, "title", e.target.value)}
                              placeholder="Milestone title"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`amount-${milestone.id}`}>Amount (₦)</Label>
                            <Input
                              id={`amount-${milestone.id}`}
                              type="number"
                              value={milestone.amount}
                              onChange={(e) =>
                                updateMilestone(milestone.id, "amount", Number.parseInt(e.target.value) || 0)
                              }
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`description-${milestone.id}`}>Description</Label>
                          <Textarea
                            id={`description-${milestone.id}`}
                            value={milestone.description}
                            onChange={(e) => updateMilestone(milestone.id, "description", e.target.value)}
                            placeholder="Describe what will be delivered in this milestone"
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`due-${milestone.id}`}>Due Date</Label>
                          <Input
                            id={`due-${milestone.id}`}
                            type="date"
                            value={milestone.dueDate}
                            onChange={(e) => updateMilestone(milestone.id, "dueDate", e.target.value)}
                          />
                        </div>
                      </div>
                    ))}

                    {Math.abs(totalMilestoneAmount - proposedBudget) > 1 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-800">
                            Milestone total ({formatNaira(totalMilestoneAmount)}) doesn't match proposed budget (
                            {formatNaira(proposedBudget)})
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Payment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Project Amount:</span>
                    <span className="font-medium">
                      {formatNaira(paymentType === "full" ? proposedBudget : totalMilestoneAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform Fee (5%):</span>
                    <span className="font-medium">{formatNaira(platformFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total to Pay:</span>
                    <span>{formatNaira(totalAmount)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Escrow Protection Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Secure Escrow Protection</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Your payment will be held securely until work is completed to your satisfaction.
                      {paymentType === "milestones"
                        ? " Funds are released milestone by milestone as work progresses."
                        : " Funds are released when the entire project is completed."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>

                <Button
                  variant="secondary"
                  onClick={handleTestEscrow}
                  disabled={paymentType === "milestones" && Math.abs(totalMilestoneAmount - proposedBudget) > 1}
                  className="flex-1"
                >
                  🧪 Test Escrow (No Payment)
                </Button>

                <Button
                  onClick={handlePayment}
                  disabled={
                    !paystackLoaded ||
                    (paymentType === "milestones" && Math.abs(totalMilestoneAmount - proposedBudget) > 1)
                  }
                  className="flex-1"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Fund Escrow - {formatNaira(totalAmount)}
                </Button>
              </div>
            </>
          )}

          {step === "payment" && (
            <div className="text-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">Processing Payment</h3>
                <p className="text-muted-foreground">Please complete the payment in the popup window</p>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center space-y-6 py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>

              <div>
                <h3 className="text-xl font-semibold">Escrow Created Successfully!</h3>
                <p className="text-muted-foreground mt-2">
                  {formatNaira(totalAmount)} has been secured in escrow for {freelancerName}
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                <p className="text-sm text-green-700 font-medium">✅ Funds secured in escrow</p>
                <p className="text-sm text-green-700">✅ Freelancer has been notified</p>
                <p className="text-sm text-green-700">✅ Project can now begin</p>
                {paymentType === "milestones" && (
                  <p className="text-sm text-green-700">✅ {milestones.length} milestones created</p>
                )}
              </div>

              <Button onClick={handleSuccess} className="w-full" size="lg">
                Go to Project Management
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
