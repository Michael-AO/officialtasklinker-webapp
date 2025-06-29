"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, CheckCircle } from "lucide-react"
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
  const [step, setStep] = useState<"setup" | "success">("setup")

  const handleCreateEscrow = () => {
    // Simulate escrow creation
    setStep("success")
    toast({
      title: "Escrow Created!",
      description: `Escrow created successfully for ${freelancerName}.`,
    })

    if (onEscrowCreated) {
      onEscrowCreated()
    }
  }

  const handleSuccess = () => {
    onClose()
    window.location.href = `/dashboard/tasks/${taskId}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "setup" && (
              <>
                <Shield className="h-5 w-5 text-blue-600" />
                Setup Escrow Protection
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
            {step === "success" && "Your project is now protected with escrow"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === "setup" && (
            <>
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
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="font-medium">{formatNaira(proposedBudget)}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Escrow setup is <strong>coming soon</strong>.</p>
                    <p className="text-sm text-blue-700 mt-1">
                      You'll be able to secure your payments here in the future.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 flex-col items-stretch">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button disabled className="flex-1">
                  Create Escrow - {formatNaira(proposedBudget)}
                </Button>
                <p className="text-xs text-muted-foreground mt-1 text-center">Coming soon</p>
              </div>
            </>
          )}

          {step === "success" && (
            <div className="text-center space-y-6 py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>

              <div>
                <h3 className="text-xl font-semibold">Escrow Created Successfully!</h3>
                <p className="text-muted-foreground mt-2">
                  {formatNaira(proposedBudget)} has been secured in escrow for {freelancerName}
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                <p className="text-sm text-green-700 font-medium">✅ Funds secured in escrow</p>
                <p className="text-sm text-green-700">✅ Freelancer has been notified</p>
                <p className="text-sm text-green-700">✅ Project can now begin</p>
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
