"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Dojah from "dojah-kyc-sdk-react"

interface DojahMinimalProps {
  onSuccess?: (result: any) => void
  onError?: (error: any) => void
}

export function DojahMinimal({ onSuccess, onError }: DojahMinimalProps) {
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
        console.error("❌ Dojah error details:", data)
        setIsLoading(false)
        setShowDojah(false)
        onError?.(data)
        break
      case 'close':
        console.log("🔒 Dojah modal closed")
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
        console.log(`📝 Dojah status: ${status}`, data)
    }
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Dojah Minimal Config</h3>
      <p className="text-sm text-gray-600 mb-4">
        Minimal configuration - just the essentials
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
          "Start Verification (Minimal)"
        )}
      </Button>

      {/* Dojah Component - Minimal Config */}
      {showDojah && (
        <Dojah
          appID="6875f7ffcb4d46700c74336e"
          publicKey="prod_pk_deSgNF4R6LJVWU29lSfZ41aW4"
          type="custom"
          response={handleDojahResponse}
          config={{
            debug: false,
            mobile: true
          }}
        />
      )}
    </div>
  )
}
