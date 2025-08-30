"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

// Import Dojah React SDK
import Dojah from "dojah-kyc-sdk-react"

interface DojahReactSdkProps {
  onSuccess?: (result: any) => void
  onError?: (error: any) => void
  verificationType?: "identity" | "business"
}

export function DojahReactSdk({ 
  onSuccess, 
  onError, 
  verificationType = "identity" 
}: DojahReactSdkProps) {
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
        setIsLoading(false)
        setShowDojah(false)
        onSuccess?.(data)
        break
      case 'error':
        setIsLoading(false)
        setShowDojah(false)
        onError?.(data)
        break
      case 'close':
        setIsLoading(false)
        setShowDojah(false)
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

  // Get the correct pages configuration
  const getPagesConfig = () => {
    // Use only compatible page types to avoid configuration errors
    if (verificationType === "business") {
      return ["government-data", "selfie", "business"]
    }
    // For identity verification, use only the basic pages
    return ["government-data", "selfie"]
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Dojah React SDK</h3>
      <p className="text-sm text-gray-600 mb-4">
        Click to start {verificationType} verification using React SDK
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
          "Start Verification (React SDK)"
        )}
      </Button>

      {/* Dojah Component */}
      {showDojah && (
        <Dojah
          appID="6875f7ffcb4d46700c74336e"
          publicKey="prod_pk_deSgNF4R6LJVWU29lSfZ41aW4"
          type="custom"
          response={handleDojahResponse}
          config={{
            debug: false,
            mobile: true,
            // Use only the most basic pages
            pages: ["government-data", "selfie"]
          }}
          userData={{
            first_name: "John",
            last_name: "Doe",
            dob: "1990-01-01",
            residence_country: "NG",
            email: "john@doe.com",
            phone: "2348012345678",
          }}
        />
      )}
    </div>
  )
}
