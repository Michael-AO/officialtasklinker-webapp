"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, X, CreditCard, Shield } from "lucide-react"
import { useEscrow, type EscrowMilestone } from "@/contexts/escrow-context"
import { paystack } from "@/lib/paystack"
import { useAuth } from "@/contexts/auth-context"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  taskId?: string
  taskTitle?: string
  onPaymentSuccess?: () => void
}

export function PaymentModal({ isOpen, onClose, taskId, taskTitle, onPaymentSuccess }: PaymentModalProps) {
  const { user } = useAuth()
  const { createEscrow, fundEscrow } = useEscrow()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [paymentData, setPaymentData] = useState({
    taskTitle: taskTitle || "",
    freelancerEmail: "",
    amount: "",
    description: "",
    useMilestones: false,
  })
  const [milestones, setMilestones] = useState<Omit<EscrowMilestone, "id" | "status">[]>([])
  const [currentEscrowId, setCurrentEscrowId] = useState<string>("")

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: "",
        description: "",
        amount: 0,
        dueDate: "",
      },
    ])
  }

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index))
  }

  const updateMilestone = (index: number, field: string, value: any) => {
    setMilestones(milestones.map((milestone, i) => (i === index ? { ...milestone, [field]: value } : milestone)))
  }

  const calculateTotal = () => {
    if (paymentData.useMilestones) {
      return milestones.reduce((sum, milestone) => sum + milestone.amount, 0)
    }
    return Number.parseFloat(paymentData.amount) || 0
  }

  const handleCreateEscrow = async () => {
    setIsLoading(true)
    try {
      const totalAmount = calculateTotal()
      const escrowMilestones = paymentData.useMilestones
        ? milestones.map((milestone, index) => ({
            ...milestone,
            id: `milestone_${Date.now()}_${index}`,
            status: "pending" as const,
          }))
        : undefined

      const escrow = await createEscrow(taskId || `task_${Date.now()}`, totalAmount, escrowMilestones)

      setCurrentEscrowId(escrow.id)
      setStep(2)
    } catch (error) {
      console.error("Failed to create escrow:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const totalAmount = calculateTotal()
      const paymentReference = `TL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Initialize Paystack payment
      const paymentResponse = await paystack.initializePayment({
        email: user.email,
        amount: totalAmount * 100, // Convert to kobo
        currency: "NGN",
        reference: paymentReference,
        metadata: {
          escrowId: currentEscrowId,
          taskTitle: paymentData.taskTitle,
          freelancerEmail: paymentData.freelancerEmail,
        },
      })

      if (paymentResponse.status) {
        // Open Paystack payment modal
        paystack.openPaymentModal(
          {
            email: user.email,
            amount: totalAmount * 100,
            currency: "NGN",
            reference: paymentReference,
            metadata: {
              escrowId: currentEscrowId,
              taskTitle: paymentData.taskTitle,
            },
          },
          async (response) => {
            // Payment successful
            await fundEscrow(currentEscrowId, response.reference)
            setStep(3)
          },
          () => {
            // Payment closed
            console.log("Payment modal closed")
          },
        )
      }
    } catch (error) {
      console.error("Payment failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetModal = () => {
    setStep(1)
    setPaymentData({
      taskTitle: taskTitle || "",
      freelancerEmail: "",
      amount: "",
      description: "",
      useMilestones: false,
    })
    setMilestones([])
    setCurrentEscrowId("")
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const handleSuccess = () => {
    if (onPaymentSuccess) {
      onPaymentSuccess()
    } else {
      handleClose()
    }
  }

  return (
    <>
      {/* Paystack Script */}
      <script src="https://js.paystack.co/v1/inline.js"></script>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {step === 1 && "Create Escrow Payment"}
              {step === 2 && "Fund Escrow"}
              {step === 3 && "Payment Successful"}
            </DialogTitle>
            <DialogDescription>
              {step === 1 && "Set up secure escrow payment for your project"}
              {step === 2 && "Complete payment to fund the escrow"}
              {step === 3 && "Your escrow has been successfully funded"}
            </DialogDescription>
          </DialogHeader>

          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taskTitle">Task Title</Label>
                  <Input
                    id="taskTitle"
                    value={paymentData.taskTitle}
                    onChange={(e) => setPaymentData({ ...paymentData, taskTitle: e.target.value })}
                    placeholder="Enter task title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="freelancerEmail">Freelancer Email (Optional)</Label>
                  <Input
                    id="freelancerEmail"
                    type="email"
                    value={paymentData.freelancerEmail}
                    onChange={(e) => setPaymentData({ ...paymentData, freelancerEmail: e.target.value })}
                    placeholder="freelancer@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  value={paymentData.description}
                  onChange={(e) => setPaymentData({ ...paymentData, description: e.target.value })}
                  placeholder="Describe the project requirements..."
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useMilestones"
                    checked={paymentData.useMilestones}
                    onChange={(e) => setPaymentData({ ...paymentData, useMilestones: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="useMilestones">Use milestone-based payments</Label>
                </div>

                {!paymentData.useMilestones ? (
                  <div className="space-y-2">
                    <Label htmlFor="amount">Total Amount (₦)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Milestones</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Milestone
                      </Button>
                    </div>

                    {milestones.map((milestone, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label>Milestone {index + 1}</Label>
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeMilestone(index)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                placeholder="Milestone title"
                                value={milestone.title}
                                onChange={(e) => updateMilestone(index, "title", e.target.value)}
                              />
                              <Input
                                type="number"
                                placeholder="Amount (₦)"
                                value={milestone.amount}
                                onChange={(e) =>
                                  updateMilestone(index, "amount", Number.parseFloat(e.target.value) || 0)
                                }
                              />
                            </div>
                            <Input
                              placeholder="Description"
                              value={milestone.description}
                              onChange={(e) => updateMilestone(index, "description", e.target.value)}
                            />
                            <Input
                              type="date"
                              value={milestone.dueDate}
                              onChange={(e) => updateMilestone(index, "dueDate", e.target.value)}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Total Amount</p>
                  <p className="text-2xl font-bold">₦{calculateTotal().toLocaleString()}</p>
                </div>
                <Button onClick={handleCreateEscrow} disabled={isLoading || calculateTotal() === 0}>
                  {isLoading ? "Creating..." : "Create Escrow"}
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Escrow Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Task:</span>
                    <span className="font-medium">{paymentData.taskTitle}</span>
                  </div>
                  {paymentData.freelancerEmail && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Freelancer:</span>
                      <span className="font-medium">{paymentData.freelancerEmail}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-bold text-lg">₦{calculateTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Escrow ID:</span>
                    <Badge variant="outline">{currentEscrowId}</Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-blue-900">Secure Escrow Protection</p>
                    <p className="text-sm text-blue-700">
                      Your payment will be held securely until the work is completed to your satisfaction. Funds are
                      only released when you approve the deliverables.
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={handlePayment} disabled={isLoading} className="w-full" size="lg">
                <CreditCard className="h-4 w-4 mr-2" />
                {isLoading ? "Processing..." : `Pay ₦${calculateTotal().toLocaleString()} with Paystack`}
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Escrow Successfully Funded!</h3>
                <p className="text-muted-foreground">
                  Your payment of ₦{calculateTotal().toLocaleString()} has been securely deposited into escrow.
                </p>
              </div>

              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Escrow ID:</span>
                      <Badge variant="outline">{currentEscrowId}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge className="bg-blue-100 text-blue-800">Funded</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Your task has been posted with escrow protection. Freelancers can now apply knowing payment is
                  secured.
                </p>
              </div>

              <Button onClick={handleSuccess} className="w-full">
                Complete Task Posting
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
