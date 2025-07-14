"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Send, User, AlertCircle, CheckCircle, Info } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { SidebarMenuButton } from "@/components/ui/sidebar"

export function SupportModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState("")
  
  const { user } = useAuth()
  
  const [formData, setFormData] = useState({
    subject: "",
    message: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setErrorMessage("Please log in to submit a support request")
      setSubmitStatus('error')
      return
    }

    if (!formData.subject.trim() || !formData.message.trim()) {
      setErrorMessage("Please fill in all fields")
      setSubmitStatus('error')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage("")

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": user.id,
        },
        body: JSON.stringify({
          name: user.name || "Anonymous User",
          email: user.email || "no-email@example.com",
          subject: formData.subject,
          message: formData.message,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSubmitStatus('success')
        setFormData({ subject: "", message: "" })
        setTimeout(() => {
          setIsOpen(false)
          setSubmitStatus('idle')
        }, 2000)
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.error || "Failed to submit support request")
      }
    } catch (error) {
      console.error("Support submission error:", error)
      setSubmitStatus('error')
      setErrorMessage("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (submitStatus === 'error') {
      setSubmitStatus('idle')
      setErrorMessage("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <SidebarMenuButton
          className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-[#04A466] data-[active=true]:text-white w-full justify-start"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Support
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Get Support
          </DialogTitle>
          <DialogDescription>
            Need help? Submit a support request and we'll get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Brief description of your issue"
              value={formData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Description</Label>
            <Textarea
              id="message"
              placeholder="Please provide detailed information about your request or issue..."
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              disabled={isSubmitting}
              rows={4}
              required
            />
          </div>

          {submitStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 text-sm border border-red-200 bg-red-50 text-red-700 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {errorMessage}
            </div>
          )}

          {submitStatus === 'success' && (
            <div className="flex items-center gap-2 p-3 text-sm border border-green-200 bg-green-50 text-green-700 rounded-md">
              <CheckCircle className="h-4 w-4" />
              Support request submitted successfully! We'll get back to you soon.
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 