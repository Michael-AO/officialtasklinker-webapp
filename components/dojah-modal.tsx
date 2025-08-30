"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Dojah from "dojah-kyc-sdk-react"

interface DojahModalProps {
  onSuccess?: (result: any) => void
  onError?: (error: any) => void
}

export function DojahModal({ onSuccess, onError }: DojahModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDojah, setShowDojah] = useState(false)

  const handleStartVerification = () => {
    setIsLoading(true)
    setShowDojah(true)
  }

  const handleDojahResponse = (status: string, data?: any) => {
    console.log(`🔔 Dojah modal response: ${status}`, data)
    
    switch (status) {
      case 'success':
        console.log("✅ Dojah modal success:", data)
        setIsLoading(false)
        setShowDojah(false)
        onSuccess?.(data)
        break
      case 'error':
        console.error("❌ Dojah modal error:", data)
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
        console.log("🔄 Dojah modal loading...")
        break
      case 'start':
        console.log("🚀 Dojah modal starting...")
        break
      default:
        console.log(`📝 Dojah modal status: ${status}`, data)
    }
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Dojah Modal Type</h3>
      <p className="text-sm text-gray-600 mb-4">
        Using modal type instead of custom
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
          "Start Verification (Modal)"
        )}
      </Button>

      {/* Dojah Component - Modal Type */}
      {showDojah && (
        <Dojah
          appID="6875f7ffcb4d46700c74336e"
          publicKey="prod_pk_deSgNF4R6LJVWU29lSfZ41aW4"
          type="custom"
          response={handleDojahResponse}
          config={{
            debug: true,
            mobile: true
          }}
        />
      )}
    </div>
  )
} 