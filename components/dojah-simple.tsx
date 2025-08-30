"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface DojahSimpleProps {
  onSuccess?: (result: any) => void
  onError?: (error: any) => void
}

export function DojahSimple({ onSuccess, onError }: DojahSimpleProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleStartVerification = () => {
    setIsLoading(true)
    
    // Simple direct Dojah initialization
    if (typeof window !== 'undefined' && (window as any).Dojah) {
      try {
        console.log("🚀 Starting Dojah verification...")
        
        ;(window as any).Dojah.init({
          appID: "test_app_id",
          publicKey: "test_pk_TNoLXCX4T96k0WdbLnFJGYipd",
          type: "modal", // Use modal type for direct widget
          config: {
            debug: true,
            mobile: true,
            environment: "test"
          },
          response: (status: string, data: any) => {
            console.log(`🔔 Dojah response: ${status}`, data)
            setIsLoading(false)
            
            if (status === 'success') {
              console.log("✅ Verification successful:", data)
              onSuccess?.(data)
            } else if (status === 'error') {
              console.error("❌ Verification failed:", data)
              onError?.(data)
            } else if (status === 'close') {
              console.log("🔒 Widget closed")
            }
          }
        })
      } catch (error) {
        console.error("❌ Dojah initialization error:", error)
        setIsLoading(false)
        onError?.(error)
      }
    } else {
      console.error("❌ Dojah not available")
      setIsLoading(false)
      onError?.("Dojah widget not loaded")
    }
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Dojah Verification</h3>
      <p className="text-sm text-gray-600 mb-4">
        Click to start verification - widget will open directly
      </p>
      
      <Button 
        onClick={handleStartVerification}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Opening Widget...
          </>
        ) : (
          "Start Verification"
        )}
      </Button>
    </div>
  )
}
