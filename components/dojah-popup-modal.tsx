"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle, Upload } from "lucide-react"
import { useDojahModal } from "@/hooks/useDojahModal"

interface DojahPopupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (result: any) => void
  onClose?: () => void
  verificationType?: "identity" | "business"
}

export function DojahPopupModal({ 
  open, 
  onOpenChange, 
  onSuccess, 
  onClose, 
  verificationType = "identity" 
}: DojahPopupModalProps) {
  const { openDojah, scriptLoaded, scriptError } = useDojahModal()
  const [isLoading, setIsLoading] = useState(false)

  const handleStartVerification = () => {
    setIsLoading(true)
    
    // Try to find Dojah object with different possible names
    const win = window as any
    const DojahClass = win.DojahKYC || win.Dojah || win.dojah || win.DOJAH
    
    if (!scriptLoaded || !DojahClass) {
      console.error("⚠️ Dojah script not loaded yet", { 
        scriptLoaded, 
        DojahKYC: !!win.DojahKYC,
        Dojah: !!win.Dojah,
        dojah: !!win.dojah,
        DOJAH: !!win.DOJAH
      })
      setIsLoading(false)
      return
    }

    console.log("✅ Found Dojah class:", DojahClass)
    const dojah = new DojahClass({
      app_id: "6875f7ffcb4d46700c74336e",
      public_key: "test_pk_TNoLXCX4T96k0WdbLnFJGYipd",
      type: "modal",
      config: {
        debug: true,
        aml: true,
        selfie: true,
        pages: verificationType === "business" 
          ? ["government-data", "selfie", "business"] 
          : ["government-data", "selfie"],
      },
      onSuccess: (res: any) => {
        console.log("✅ Verification success:", res)
        setIsLoading(false)
        onSuccess?.(res)
        onOpenChange(false)
      },
      onError: (err: any) => {
        console.error("❌ Verification error:", err)
        setIsLoading(false)
      },
      onClose: () => {
        console.log("🔒 Dojah modal closed")
        setIsLoading(false)
        onClose?.()
        onOpenChange(false)
      },
    })

    dojah.open()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            ID Verification
          </DialogTitle>
          <DialogDescription>
            Complete your {verificationType} verification to unlock all features and build trust with clients.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!scriptLoaded ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading verification system...</p>
              {scriptError && (
                <p className="text-sm text-red-500 mt-2">{scriptError}</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Ready to Verify</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Click the button below to start your {verificationType} verification process.
                  This will open a secure verification window.
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleStartVerification}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Opening...
                    </>
                  ) : (
                    "Start Verification"
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm">
                  <strong>Secure Process:</strong> Your verification data is encrypted and processed securely by Dojah.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
