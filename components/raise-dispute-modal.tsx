"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Upload, X, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { formatNaira } from "@/lib/currency"
import { NairaIcon } from "@/components/naira-icon"

const DISPUTE_REASONS = [
  "Quality Issues",
  "Missed Deadline",
  "Scope Changes",
  "Communication Problems",
  "Payment Issues",
  "Other",
]

export interface RaiseDisputeModalMilestone {
  id: string
  title: string
  amount: number
}

interface RaiseDisputeModalProps {
  isOpen: boolean
  onClose: () => void
  milestone: RaiseDisputeModalMilestone | null
  onSuccess: () => void
}

export function RaiseDisputeModal({ isOpen, onClose, milestone, onSuccess }: RaiseDisputeModalProps) {
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length || !milestone) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      for (let i = 0; i < files.length; i++) {
        formData.append("file", files[i])
      }
      const res = await fetch("/api/upload/dispute-evidence", {
        method: "POST",
        credentials: "include",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      if (data.urls?.length) {
        setEvidenceUrls((prev) => [...prev, ...data.urls])
      }
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Could not upload file(s).",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  const removeEvidence = (index: number) => {
    setEvidenceUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!milestone || !reason.trim()) return
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/disputes/raise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          milestone_id: milestone.id,
          reason: reason.trim(),
          evidence_urls: evidenceUrls.length > 0 ? evidenceUrls : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to raise dispute")
      toast({
        title: "Dispute raised",
        description: "Our team will review and respond.",
      })
      onSuccess()
      onClose()
      setReason("")
      setDescription("")
      setEvidenceUrls([])
    } catch (err) {
      toast({
        title: "Failed to raise dispute",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setReason("")
    setDescription("")
    setEvidenceUrls([])
    onClose()
  }

  if (!milestone) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Raise Dispute
          </DialogTitle>
          <DialogDescription>
            Report an issue with this milestone. Our team will review and help resolve the matter.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-yellow-900">Before raising a dispute</p>
                <p className="text-sm text-yellow-700">
                  Try communicating with the client first. Disputes should be used when direct
                  communication fails to resolve the issue.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Milestone</Label>
            <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-2">
              <NairaIcon className="h-4 w-4" />
              <span className="font-medium">{milestone.title}</span>
              <span className="text-muted-foreground">— {formatNaira(milestone.amount)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Dispute Reason *</Label>
            <Select value={reason} onValueChange={setReason} required>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {DISPUTE_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Details (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what went wrong and what you expected..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Evidence (screenshots, PDFs)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,text/plain"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Images, PDF, or text. Max 10MB per file.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    "Choose Files"
                  )}
                </Button>
              </div>
            </div>
            {evidenceUrls.length > 0 && (
              <div className="space-y-1 mt-2">
                {evidenceUrls.map((url, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded text-sm"
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-primary underline"
                    >
                      Evidence {i + 1}
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() => removeEvidence(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !reason.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Raise Dispute"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
