"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Upload, X } from "lucide-react"
import { useEscrow } from "@/contexts/escrow-context"

interface DisputeModalProps {
  escrowId: string
  isOpen: boolean
  onClose: () => void
}

export function DisputeModal({ escrowId, isOpen, onClose }: DisputeModalProps) {
  const { raiseDispute, getEscrowById } = useEscrow()
  const [isLoading, setIsLoading] = useState(false)
  const [disputeData, setDisputeData] = useState({
    reason: "",
    description: "",
    evidence: [] as string[],
  })

  const escrow = getEscrowById(escrowId)

  const disputeReasons = [
    "Quality Issues",
    "Missed Deadline",
    "Scope Changes",
    "Communication Problems",
    "Payment Issues",
    "Other",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!disputeData.reason || !disputeData.description) return

    setIsLoading(true)
    try {
      await raiseDispute(escrowId, disputeData.reason, disputeData.description, disputeData.evidence)
      onClose()
    } catch (error) {
      console.error("Failed to raise dispute:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addEvidence = (fileName: string) => {
    setDisputeData((prev) => ({
      ...prev,
      evidence: [...prev.evidence, fileName],
    }))
  }

  const removeEvidence = (index: number) => {
    setDisputeData((prev) => ({
      ...prev,
      evidence: prev.evidence.filter((_, i) => i !== index),
    }))
  }

  if (!escrow) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Raise Dispute
          </DialogTitle>
          <DialogDescription>
            Report an issue with this escrow transaction. Our team will review and help resolve the matter.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-yellow-900">Before raising a dispute</p>
                <p className="text-sm text-yellow-700">
                  Try communicating with the other party first. Disputes should be used when direct communication fails
                  to resolve the issue.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Escrow Details</Label>
              <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                <p className="font-medium">{escrow.taskTitle}</p>
                <p className="text-sm text-muted-foreground">
                  Amount: ₦{(escrow.amount / 100).toLocaleString()} • ID: {escrow.id}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Dispute Reason</Label>
              <Select
                value={disputeData.reason}
                onValueChange={(value) => setDisputeData((prev) => ({ ...prev, reason: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason for the dispute" />
                </SelectTrigger>
                <SelectContent>
                  {disputeReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea
                id="description"
                value={disputeData.description}
                onChange={(e) => setDisputeData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Please provide a detailed explanation of the issue, including what went wrong and what you expected..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Supporting Evidence</Label>
              <div className="space-y-3">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload screenshots, documents, or other evidence</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addEvidence(`evidence_${Date.now()}.png`)}
                  >
                    Choose Files
                  </Button>
                </div>

                {disputeData.evidence.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm">Uploaded Files:</Label>
                    <div className="space-y-1">
                      {disputeData.evidence.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{file}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeEvidence(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !disputeData.reason || !disputeData.description}>
              {isLoading ? "Submitting..." : "Raise Dispute"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
