"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Dojah from "dojah-kyc-sdk-react"

interface DojahWorkingProps {
  onSuccess?: (result: any) => void
  onError?: (error: any) => void
  verificationType?: "identity" | "business"
}

export function DojahWorking({ 
  onSuccess, 
  onError, 
  verificationType = "identity" 
}: DojahWorkingProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDojah, setShowDojah] = useState(false)

  const handleStartVerification = () => {
    setIsLoading(true)
    setShowDojah(true)
  }

  const handleDojahResponse = (status: string, data?: any) => {
    console.log(`🔔 Dojah response: ${status}`, data)
    
    switch (status) {
      case 'success':
        console.log("✅ Verification successful:", data)
        setIsLoading(false)
        setShowDojah(false)
        onSuccess?.(data)
        break
      case 'error':
        console.error("❌ Verification failed:", data)
        setIsLoading(false)
        setShowDojah(false)
        onError?.(data)
        break
      case 'close':
        console.log("🔒 Verification modal closed")
        setIsLoading(false)
        setShowDojah(false)
        break
      default:
        console.log(`📝 Status: ${status}`, data)
    }
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Dojah Verification</h3>
      <p className="text-sm text-gray-600 mb-4">
        Click to start {verificationType} verification
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
          "Start Verification"
        )}
      </Button>

      {/* Dojah Component */}
      {showDojah && (
        <Dojah
          appID={process.env.NEXT_PUBLIC_DOJAH_APP_ID || "6875f7ffcb4d46700c74336e"}
          publicKey={process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY || "prod_pk_deSgNF4R6LJVWU29lSfZ41aW4"}
          type="custom"
          response={handleDojahResponse}
          config={{
            debug: false,
            mobile: true,
            environment: "production"
          }}
        />
      )}
    </div>
  )
}
