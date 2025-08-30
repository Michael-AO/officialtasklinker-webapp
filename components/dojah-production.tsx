"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Dojah from "dojah-kyc-sdk-react"

interface DojahProductionProps {
  onSuccess?: (result: any) => void
  onError?: (error: any) => void
  verificationType?: "identity" | "business"
}

export function DojahProduction({ 
  onSuccess, 
  onError, 
  verificationType = "identity" 
}: DojahProductionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDojah, setShowDojah] = useState(false)

  const handleStartVerification = () => {
    setIsLoading(true)
    setShowDojah(true)
  }

  const handleDojahResponse = (status: string, data?: any) => {
    console.log(`🔔 Dojah production response: ${status}`, data)
    
    // Log the full response for debugging
    console.log("📝 Full Dojah response payload:", { status, data })
    
    switch (status) {
      case 'start':
        console.log("🚀 Dojah verification started")
        // Don't close the modal or stop loading on start
        break
        
      case 'success':
        console.log("✅ Production verification successful:", data)
        setIsLoading(false)
        setShowDojah(false)
        onSuccess?.(data)
        break
        
      case 'error':
        console.error("❌ Production verification failed:", data)
        setIsLoading(false)
        setShowDojah(false)
        onError?.(data)
        break
        
      case 'close':
        console.log("🔒 Production verification modal closed")
        setIsLoading(false)
        setShowDojah(false)
        break
        
      default:
        console.log(`📝 Unknown Dojah status: ${status}`, data)
        // For unknown statuses, don't close the modal
        // Let the user continue with the verification process
    }
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Dojah Production Widget</h3>
      <p className="text-sm text-gray-600 mb-4">
        Production verification using React SDK
      </p>
      
      <Button 
        onClick={handleStartVerification}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Opening...
          </>
        ) : (
          "Start Production Verification"
        )}
      </Button>

      {/* Dojah Component */}
      {showDojah && (
        <Dojah
          appID={process.env.NEXT_PUBLIC_DOJAH_APP_ID || "6875f7ffcb4d46700c74336e"}
          publicKey={process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY || "prod_pk_deSgNF4R6LJVWU29lSfZ41aW4"}
          type="modal"
          response={handleDojahResponse}
          config={{
            debug: false,
            mobile: true,
            pages: verificationType === "business" 
              ? ["government-data", "selfie", "business"] 
              : ["government-data", "selfie"],
          }}
        />
      )}
    </div>
  )
}
