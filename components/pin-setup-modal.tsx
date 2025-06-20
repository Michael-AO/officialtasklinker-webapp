"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Lock, Shield } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface PinSetupModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "setup" | "change" | "verify"
  onPinVerified?: () => void
}

export function PinSetupModal({ isOpen, onClose, mode, onPinVerified }: PinSetupModalProps) {
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [currentPin, setCurrentPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)

  const handlePinInput = (value: string, setter: (value: string) => void) => {
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setter(value)
    }
  }

  const handleSetupPin = async () => {
    if (pin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits",
        variant: "destructive",
      })
      return
    }

    if (pin !== confirmPin) {
      toast({
        title: "PIN Mismatch",
        description: "PINs do not match. Please try again.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/user/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, action: mode }),
      })

      if (!response.ok) throw new Error("Failed to setup PIN")

      toast({
        title: "PIN Setup Complete",
        description: "Your withdrawal PIN has been set successfully.",
      })

      onClose()
      resetForm()
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "Failed to setup PIN. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePin = async () => {
    if (step === 1) {
      // Verify current PIN
      setIsLoading(true)
      try {
        const response = await fetch("/api/user/pin/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin: currentPin }),
        })

        if (!response.ok) throw new Error("Invalid PIN")

        setStep(2)
      } catch (error) {
        toast({
          title: "Invalid PIN",
          description: "Current PIN is incorrect.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    } else {
      // Set new PIN
      await handleSetupPin()
    }
  }

  const handleVerifyPin = async () => {
    if (pin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "Please enter your 4-digit PIN",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/user/pin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      })

      if (!response.ok) throw new Error("Invalid PIN")

      toast({
        title: "PIN Verified",
        description: "PIN verification successful.",
      })

      onPinVerified?.()
      onClose()
      resetForm()
    } catch (error) {
      toast({
        title: "Invalid PIN",
        description: "PIN verification failed. Please try again.",
        variant: "destructive",
      })
      setPin("")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setPin("")
    setConfirmPin("")
    setCurrentPin("")
    setStep(1)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {mode === "setup" && "Setup Withdrawal PIN"}
            {mode === "change" && "Change Withdrawal PIN"}
            {mode === "verify" && "Verify PIN"}
          </DialogTitle>
          <DialogDescription>
            {mode === "setup" && "Create a 4-digit PIN to secure your withdrawals"}
            {mode === "change" && "Update your withdrawal PIN"}
            {mode === "verify" && "Enter your PIN to authorize this withdrawal"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {mode === "setup" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="pin">New PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => handlePinInput(e.target.value, setPin)}
                  placeholder="Enter 4-digit PIN"
                  maxLength={4}
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPin">Confirm PIN</Label>
                <Input
                  id="confirmPin"
                  type="password"
                  value={confirmPin}
                  onChange={(e) => handlePinInput(e.target.value, setConfirmPin)}
                  placeholder="Confirm 4-digit PIN"
                  maxLength={4}
                  className="text-center text-2xl tracking-widest"
                />
              </div>
            </>
          )}

          {mode === "change" && (
            <>
              {step === 1 && (
                <div className="space-y-2">
                  <Label htmlFor="currentPin">Current PIN</Label>
                  <Input
                    id="currentPin"
                    type="password"
                    value={currentPin}
                    onChange={(e) => handlePinInput(e.target.value, setCurrentPin)}
                    placeholder="Enter current PIN"
                    maxLength={4}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="pin">New PIN</Label>
                    <Input
                      id="pin"
                      type="password"
                      value={pin}
                      onChange={(e) => handlePinInput(e.target.value, setPin)}
                      placeholder="Enter new 4-digit PIN"
                      maxLength={4}
                      className="text-center text-2xl tracking-widest"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPin">Confirm New PIN</Label>
                    <Input
                      id="confirmPin"
                      type="password"
                      value={confirmPin}
                      onChange={(e) => handlePinInput(e.target.value, setConfirmPin)}
                      placeholder="Confirm new PIN"
                      maxLength={4}
                      className="text-center text-2xl tracking-widest"
                    />
                  </div>
                </>
              )}
            </>
          )}

          {mode === "verify" && (
            <div className="space-y-2">
              <Label htmlFor="pin">Enter PIN</Label>
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => handlePinInput(e.target.value, setPin)}
                placeholder="Enter your 4-digit PIN"
                maxLength={4}
                className="text-center text-2xl tracking-widest"
                autoFocus
              />
            </div>
          )}

          {/* Security Notice */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Security Tips</p>
                  <ul className="mt-1 text-blue-700 space-y-1">
                    <li>• Choose a PIN that's not easily guessable</li>
                    <li>• Don't use sequential numbers (1234)</li>
                    <li>• Keep your PIN confidential</li>
                    <li>• Change your PIN regularly</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={mode === "setup" ? handleSetupPin : mode === "change" ? handleChangePin : handleVerifyPin}
              disabled={
                isLoading ||
                (mode === "setup" && (pin.length !== 4 || confirmPin.length !== 4)) ||
                (mode === "change" && step === 1 && currentPin.length !== 4) ||
                (mode === "change" && step === 2 && (pin.length !== 4 || confirmPin.length !== 4)) ||
                (mode === "verify" && pin.length !== 4)
              }
            >
              {isLoading ? "Processing..." : mode === "change" && step === 1 ? "Verify" : "Confirm"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
