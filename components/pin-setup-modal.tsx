"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, AlertTriangle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

interface PinSetupModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "setup" | "change" | "verify"
  onPinVerified?: () => void
  title?: string
  description?: string
}

export function PinSetupModal({ isOpen, onClose, mode, onPinVerified, title, description }: PinSetupModalProps) {
  const { user } = useAuth()
  const [currentPin, setCurrentPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [showPins, setShowPins] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(mode === "change" ? 1 : 2) // Step 1: verify current, Step 2: set new

  const resetForm = () => {
    setCurrentPin("")
    setNewPin("")
    setConfirmPin("")
    setError("")
    setStep(mode === "change" ? 1 : 2)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const verifyCurrentPin = async () => {
    if (!currentPin || currentPin.length !== 4) {
      setError("Please enter your 4-digit PIN")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/user/pin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_data: {
            id: user?.id,
            email: user?.email,
            name: user?.name,
          },
          pin: currentPin,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        if (mode === "verify") {
          toast({
            title: "PIN Verified",
            description: "Your PIN has been successfully verified.",
          })
          onPinVerified?.()
          handleClose()
        } else {
          setStep(2) // Move to new PIN setup
        }
      } else {
        setError(data.error || "Invalid PIN. Please try again.")
      }
    } catch (error) {
      setError("Failed to verify PIN. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const setupNewPin = async () => {
    if (!newPin || newPin.length !== 4) {
      setError("PIN must be exactly 4 digits")
      return
    }

    if (!/^\d{4}$/.test(newPin)) {
      setError("PIN must contain only numbers")
      return
    }

    if (newPin !== confirmPin) {
      setError("PINs do not match")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/user/pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_data: {
            id: user?.id,
            email: user?.email,
            name: user?.name,
          },
          pin: newPin,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: mode === "setup" ? "PIN Setup Complete" : "PIN Changed Successfully",
          description:
            mode === "setup"
              ? "Your security PIN has been set up successfully."
              : "Your security PIN has been updated.",
        })

        // Call the callback to notify parent component
        onPinVerified?.()
        handleClose()
      } else {
        setError(data.error || "Failed to setup PIN. Please try again.")
      }
    } catch (error) {
      console.error("PIN setup error:", error)
      setError("Failed to setup PIN. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (step === 1) {
      verifyCurrentPin()
    } else {
      setupNewPin()
    }
  }

  const getTitle = () => {
    if (title) return title
    if (mode === "setup") return "Setup Security PIN"
    if (mode === "change") return step === 1 ? "Verify Current PIN" : "Set New PIN"
    if (mode === "verify") return "Verify PIN"
    return "Security PIN"
  }

  const getDescription = () => {
    if (description) return description
    if (mode === "setup") return "Create a 4-digit PIN to secure your transactions"
    if (mode === "change") {
      return step === 1 ? "Enter your current PIN to continue" : "Enter your new 4-digit PIN"
    }
    if (mode === "verify") return "Enter your 4-digit PIN to continue"
    return "Enter your PIN"
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {getTitle()}
          </DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <div className="space-y-2">
              <Label htmlFor="current-pin">Current PIN</Label>
              <div className="relative">
                <Input
                  id="current-pin"
                  type={showPins ? "text" : "password"}
                  value={currentPin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 4)
                    setCurrentPin(value)
                    setError("")
                  }}
                  placeholder="Enter current PIN"
                  maxLength={4}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPins(!showPins)}
                >
                  {showPins ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="new-pin">New PIN</Label>
                <div className="relative">
                  <Input
                    id="new-pin"
                    type={showPins ? "text" : "password"}
                    value={newPin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 4)
                      setNewPin(value)
                      setError("")
                    }}
                    placeholder="Enter 4-digit PIN"
                    maxLength={4}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPins(!showPins)}
                  >
                    {showPins ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-pin">Confirm PIN</Label>
                <Input
                  id="confirm-pin"
                  type={showPins ? "text" : "password"}
                  value={confirmPin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 4)
                    setConfirmPin(value)
                    setError("")
                  }}
                  placeholder="Confirm 4-digit PIN"
                  maxLength={4}
                />
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || (step === 1 ? !currentPin : !newPin || !confirmPin)}
              className="flex-1"
            >
              {isLoading ? "Processing..." : step === 1 ? "Verify" : "Setup PIN"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
