"use client"

import { useEffect, useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"

interface DojahSimpleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (result: any) => void
  onClose?: () => void
  verificationType?: "identity" | "business"
}

export function DojahSimpleModal({ 
  open, 
  onOpenChange, 
  onSuccess, 
  onClose, 
  verificationType = "identity" 
}: DojahSimpleModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const dojahInstance = useRef<any>(null)

  // Load Dojah script once
  useEffect(() => {
    if (scriptLoaded) return

    const loadDojahScript = () => {
      // Check if script already exists
      const existingScript = document.getElementById('dojah-widget-script')
      if (existingScript) {
        setScriptLoaded(true)
        return
      }

      console.log("📥 Loading Dojah widget script...")
      const script = document.createElement('script')
      script.id = 'dojah-widget-script'
      script.src = 'https://widget.dojah.io/widget.js'
      script.async = true
      
      script.onload = () => {
        console.log("✅ Dojah script loaded successfully")
        
        // Wait a bit more for the widget to be available
        setTimeout(() => {
          const win = window as any
          const DojahWidget = win.DojahKYC || win.Dojah || win.dojah || win.DOJAH
          
          if (DojahWidget) {
            console.log("✅ Dojah widget is available")
            setScriptLoaded(true)
          } else {
            console.log("⚠️ Dojah script loaded but widget not available yet, retrying...")
            // Retry after another delay
            setTimeout(() => {
              const retryWidget = win.DojahKYC || win.Dojah || win.dojah || win.DOJAH
              if (retryWidget) {
                console.log("✅ Dojah widget available on retry")
                setScriptLoaded(true)
              } else {
                console.error("❌ Dojah widget still not available")
                setError("Failed to load verification system")
              }
            }, 1000)
          }
        }, 1000)
      }
      
      script.onerror = () => {
        console.error("❌ Failed to load Dojah script")
        setError("Failed to load verification system")
      }
      
      document.head.appendChild(script)
    }

    loadDojahScript()
  }, [scriptLoaded])

  // Clean up when modal closes
  useEffect(() => {
    if (!open) {
      setError(null)
      setIsLoading(false)
      
      // Clean up Dojah instance
      if (dojahInstance.current) {
        try {
          dojahInstance.current.close?.()
        } catch (e) {
          console.log("Dojah cleanup error:", e)
        }
        dojahInstance.current = null
      }
    }
  }, [open])

  const handleStartVerification = () => {
    if (!scriptLoaded) {
      setError("Verification system is still loading. Please try again.")
      return
    }

    setIsLoading(true)
    setError(null)

    // Add a small delay to ensure the script is fully loaded
    setTimeout(() => {
      try {
        // Use the Dojah widget directly
        const win = window as any
        const DojahWidget = win.DojahKYC || win.Dojah || win.dojah || win.DOJAH
        
        console.log("🔍 Available Dojah objects:", {
          DojahKYC: !!win.DojahKYC,
          Dojah: !!win.Dojah,
          dojah: !!win.dojah,
          DOJAH: !!win.DOJAH
        })
        
        if (!DojahWidget) {
          throw new Error("Dojah widget not available. Please refresh and try again.")
        }

        const config = {
          app_id: "6875f7ffcb4d46700c74336e",
          public_key: "test_pk_TNoLXCX4T96k0WdbLnFJGYipd",
          type: "modal",
          config: {
            debug: false,
            mobile: true,
            pages: verificationType === "business" 
              ? ["government-data", "selfie", "business"] 
              : ["government-data", "selfie"],
          },
          onSuccess: (result: any) => {
            console.log("✅ Dojah verification successful:", result)
            setIsLoading(false)
            onSuccess?.(result)
            onOpenChange(false)
          },
          onError: (error: any) => {
            console.error("❌ Dojah verification error:", error)
            setIsLoading(false)
            setError("Verification failed. Please try again.")
          },
          onClose: () => {
            console.log("🔒 Dojah modal closed")
            setIsLoading(false)
            onClose?.()
            onOpenChange(false)
          }
        }

        console.log("🚀 Initializing Dojah widget with config:", config)
        dojahInstance.current = new DojahWidget(config)
        dojahInstance.current.open()
        
      } catch (error) {
        console.error("❌ Failed to initialize Dojah:", error)
        setIsLoading(false)
        setError("Failed to start verification. Please refresh the page and try again.")
      }
    }, 500) // 500ms delay to ensure script is loaded
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
          <div className="text-center py-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Ready to Verify</h3>
            <p className="text-sm text-gray-600 mb-4">
              Click the button below to start your {verificationType} verification process.
              This will open a secure verification window.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleStartVerification}
              disabled={isLoading || !scriptLoaded}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Opening...
                </>
              ) : !scriptLoaded ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
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
              <strong>Direct Integration:</strong> Using Dojah widget directly for better compatibility.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  )
}
