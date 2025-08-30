"use client"

import { useEffect, useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { DojahWrapper } from "@/components/dojah-wrapper"
import { useDojahInstance } from "@/hooks/useDojahInstance"

interface DojahSdkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (result: any) => void
  onClose?: () => void
  verificationType?: "identity" | "business"
}

export function DojahSdkModal({ 
  open, 
  onOpenChange, 
  onSuccess, 
  onClose, 
  verificationType = "identity" 
}: DojahSdkModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDojah, setShowDojah] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const dojahRef = useRef<any>(null)
  
  const { isReady, instanceId, setInstance, cleanupAllInstances, activeInstancesCount } = useDojahInstance()

  // Clean up Dojah widget when modal closes
  useEffect(() => {
    if (!open) {
      setShowDojah(false)
      setIsInitialized(false)
      setError(null)
      setIsLoading(false)
      
      // Clean up all instances
      cleanupAllInstances()
    }
  }, [open, cleanupAllInstances])

  const handleStartVerification = () => {
    if (!isReady) {
      console.log("Dojah instance not ready yet")
      return
    }

    if (activeInstancesCount > 1) {
      console.warn("Multiple Dojah instances detected, cleaning up...")
      cleanupAllInstances()
    }

    setIsLoading(true)
    setError(null)
    
    // Small delay to ensure clean state
    setTimeout(() => {
      setShowDojah(true)
      setIsInitialized(true)
    }, 100)
  }

  const handleDojahResponse = (status: string, data?: any) => {
    console.log(`🔔 Dojah response: ${status}`, data)
    
    switch (status) {
      case 'success':
        setIsLoading(false)
        onSuccess?.(data)
        setShowDojah(false)
        onOpenChange(false)
        break
      case 'error':
        setIsLoading(false)
        setError("Verification failed. Please try again.")
        setShowDojah(false)
        break
      case 'close':
        setIsLoading(false)
        onClose?.()
        setShowDojah(false)
        onOpenChange(false)
        break
      case 'loading':
        console.log("🔄 Dojah loading...")
        break
      case 'start':
        console.log("🚀 Dojah starting...")
        break
      default:
        console.log(`📝 Dojah status: ${status}`)
    }
  }

  // Handle errors from Dojah widget
  const handleDojahError = (error: any) => {
    console.error("❌ Dojah widget error:", error)
    setError("Verification widget failed to load. Please try again.")
    setIsLoading(false)
    setShowDojah(false)
  }

  // Handle Dojah mount
  const handleDojahMount = (instance: any) => {
    console.log("✅ Dojah instance mounted:", instanceId)
    setInstance(instance)
    dojahRef.current = instance
  }

  // Get the correct pages configuration based on verification type
  const getPagesConfig = () => {
    // Use only compatible page types to avoid configuration errors
    if (verificationType === "business") {
      return ["government-data", "selfie", "business"]
    }
    // For identity verification, use only the basic pages
    return ["government-data", "selfie"]
  }

  // Get the correct configuration
  const getDojahConfig = () => {
    return {
      debug: false, // Set to false to reduce console noise
      mobile: true,
      pages: getPagesConfig(),
      // Remove any conflicting options
      aml: false,
      signature: false,
      "custom-questions": false,
      id: false
    }
  }

  return (
    <>
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
                This will open a secure verification window using the official Dojah SDK.
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
                disabled={isLoading || !isReady}
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
                <strong>Official SDK:</strong> Using the official Dojah React SDK for reliable verification.
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dojah Component - Rendered when showDojah is true */}
      {showDojah && isInitialized && isReady && (
        <div data-dojah-widget="true" data-instance-id={instanceId}>
          <DojahWrapper
            appID="6875f7ffcb4d46700c74336e"
            publicKey="test_pk_TNoLXCX4T96k0WdbLnFJGYipd"
            type="custom"
            response={handleDojahResponse}
            onError={handleDojahError}
            onMount={handleDojahMount}
            config={getDojahConfig()}
            userData={{
              first_name: "John",
              last_name: "Doe",
              dob: "1990-01-01",
              residence_country: "NG",
              email: "john@doe.com",
              phone: "2348012345678",
            }}
          />
        </div>
      )}
    </>
  )
}
