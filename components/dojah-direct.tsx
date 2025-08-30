"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface DojahDirectProps {
  onSuccess?: (result: any) => void
  onError?: (error: any) => void
  verificationType?: "identity" | "business"
}

export function DojahDirect({ 
  onSuccess, 
  onError, 
  verificationType = "identity" 
}: DojahDirectProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === "undefined") {
      console.log("Not in browser environment")
      return
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="widget.dojah.io"]')
    if (existingScript) {
      console.log("Dojah script already exists")
      setScriptLoaded(true)
      return
    }

    console.log("Loading Dojah script...")
    
    // Load Dojah script directly
    const script = document.createElement('script')
    script.src = 'https://widget.dojah.io/widget.js'
    script.async = true
    
    script.onload = () => {
      console.log("✅ Dojah script loaded successfully")
      
      // Wait for Dojah to be fully initialized
      const checkDojah = () => {
        const win = window as any
        
        // Check for Dojah in different possible locations
        const dojahAvailable = win.Dojah || win.dojah || win.DojahKYC || win.DOJAH
        
        if (dojahAvailable) {
          console.log("✅ Dojah widget is available:", typeof dojahAvailable)
          setScriptLoaded(true)
        } else {
          console.log("⏳ Waiting for Dojah widget to initialize...")
          setTimeout(checkDojah, 500) // Check again in 500ms
        }
      }
      
      // Start checking after a short delay
      setTimeout(checkDojah, 1000)
    }
    
    script.onerror = (error) => {
      console.error("❌ Failed to load Dojah script:", error)
      alert("Failed to load verification system")
    }
    
    document.head.appendChild(script)
  }, [])

  const checkDojahAvailability = () => {
    if (typeof window === "undefined") {
      console.log("Not in browser environment")
      return
    }

    const win = window as any
    console.log("🔍 Manual check - Available Dojah objects:", {
      Dojah: typeof win.Dojah,
      dojah: typeof win.dojah,
      DojahKYC: typeof win.DojahKYC,
      DOJAH: typeof win.DOJAH,
      windowKeys: Object.keys(win).filter(key => key.toLowerCase().includes('dojah')),
      allKeys: Object.keys(win).slice(0, 20) // First 20 keys for debugging
    })

    // Check if Dojah is available in any form
    const dojahKeys = Object.keys(win).filter(key => 
      key.toLowerCase().includes('dojah') || 
      key.toLowerCase().includes('kyc') ||
      key.toLowerCase().includes('widget')
    )
    
    console.log("🔍 All Dojah-related keys:", dojahKeys)
    
    // Try to find any Dojah object
    dojahKeys.forEach(key => {
      console.log(`🔍 ${key}:`, typeof win[key], win[key])
    })
  }

  const openDojah = () => {
    if (typeof window === "undefined") {
      alert("Not in browser environment")
      return
    }

    if (!scriptLoaded) {
      alert("Dojah is still loading, please wait...")
      return
    }

    setIsLoading(true)

    try {
      const win = window as any
      
      // Try to find Dojah constructor
      let DojahConstructor = null
      
      if (typeof win.Dojah === 'function') {
        DojahConstructor = win.Dojah
        console.log("✅ Using win.Dojah")
      } else if (typeof win.dojah === 'function') {
        DojahConstructor = win.dojah
        console.log("✅ Using win.dojah")
      } else if (typeof win.DojahKYC === 'function') {
        DojahConstructor = win.DojahKYC
        console.log("✅ Using win.DojahKYC")
      } else if (typeof win.DOJAH === 'function') {
        DojahConstructor = win.DOJAH
        console.log("✅ Using win.DOJAH")
      }

      if (!DojahConstructor) {
        throw new Error("Dojah constructor not found. Please refresh the page.")
      }

      // Use environment variables or fallback to test values
      const appId = process.env.NEXT_PUBLIC_DOJAH_APP_ID || "6875f7ffcb4d46700c74336e"
      const publicKey = process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY || "test_pk_TNoLXCX4T96k0WdbLnFJGYipd"

      console.log("🚀 Initializing Dojah with:", { appId, publicKey, verificationType })

      // Create Dojah instance
      const dojah = new DojahConstructor({
        app_id: appId,
        public_key: publicKey,
        type: "modal",
        config: {
          debug: true,
          mobile: true,
          pages: verificationType === "business" 
            ? ["government-data", "selfie", "business"] 
            : ["government-data", "selfie"],
        },
        onSuccess: (res: any) => {
          console.log("✅ Dojah verification success:", res)
          setIsLoading(false)
          onSuccess?.(res)
        },
        onError: (err: any) => {
          console.error("❌ Dojah verification error:", err)
          setIsLoading(false)
          onError?.(err)
        },
        onClose: () => {
          console.log("🔒 Dojah modal closed")
          setIsLoading(false)
        },
      })

      console.log("🎯 Opening Dojah modal...")
      dojah.open()
      
    } catch (error) {
      console.error("❌ Error creating Dojah instance:", error)
      setIsLoading(false)
      alert(`Failed to initialize Dojah: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Dojah Verification</h3>
      <p className="text-sm text-gray-600 mb-4">
        Click to start {verificationType} verification
      </p>
      
      <div className="space-y-2">
        <Button 
          onClick={openDojah}
          disabled={isLoading || !scriptLoaded}
          className="w-full"
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
          onClick={checkDojahAvailability}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Debug: Check Dojah Availability
        </Button>
      </div>
    </div>
  )
}
