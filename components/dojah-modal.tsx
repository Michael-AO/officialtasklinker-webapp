'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertTriangle, X } from 'lucide-react'
import { useDojahModal } from '@/contexts/dojah-modal-context'

// Global window interface declaration for Dojah
declare global {
  interface Window {
    Dojah?: any
    dojahWidget?: any
    dojahSpinnerHtml?: string
  }
}

// Track if the script is already loaded or in progress GLOBALLY
let scriptLoadPromise: Promise<void> | null = null

// Helper function to clean up the script tag
const cleanUpScript = (scriptId: string) => {
  const scriptElement = document.getElementById(scriptId)
  if (scriptElement && scriptElement.parentNode) {
    scriptElement.parentNode.removeChild(scriptElement)
    console.log('[MODAL] Cleaned up script tag due to failure.')
  }
  scriptLoadPromise = null // Reset the promise so we can retry
}

const loadDojahScript = (): Promise<void> => {
  if (scriptLoadPromise) {
    console.log('[MODAL] Script load already in progress, returning existing promise')
    return scriptLoadPromise
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    // 1. Check if already loaded FIRST
    if (window.Dojah || window.dojahWidget) {
      console.log('[MODAL] Dojah SDK already loaded globally')
      scriptLoadPromise = null
      return resolve()
    }

    const scriptId = 'dojah-widget-script'
    const scriptUrl = 'https://widget.dojah.io/widget.js'
    const GLOBAL_CHECK_TIMEOUT = 20000 // 20 seconds total for global to appear
    const GLOBAL_CHECK_INTERVAL = 100

    let totalTimeWaited = 0
    let intervalId: NodeJS.Timeout

    console.log(`[MODAL] Starting Dojah SDK load from: ${scriptUrl}`)
    console.log(`[MODAL] Global check timeout set to: ${GLOBAL_CHECK_TIMEOUT/1000} seconds`)

    // 2. Setup a separate timeout for the ENTIRE operation
    const overallTimeoutId = setTimeout(() => {
      if (intervalId) clearInterval(intervalId)
      cleanUpScript(scriptId)
      const errorMessage = `Dojah global object (window.Dojah) never became available after ${GLOBAL_CHECK_TIMEOUT/1000} seconds. The script may have loaded with errors.`
      console.error(`[MODAL] ${errorMessage}`)
      reject(new Error(errorMessage))
    }, GLOBAL_CHECK_TIMEOUT)

    // 3. Function to check for the global object
    const checkForGlobal = () => {
      totalTimeWaited += GLOBAL_CHECK_INTERVAL
      console.log(`[MODAL] Script loaded but globals not ready, checking again... (${totalTimeWaited/1000}s)`)

      if (window.Dojah || window.dojahWidget) {
        // SUCCESS: Global is finally available!
        clearTimeout(overallTimeoutId)
        clearInterval(intervalId)
        console.log('[MODAL] Dojah SDK global object detected successfully!')
        console.log('[MODAL] Available globals:', {
          hasDojah: !!window.Dojah,
          hasDojahWidget: !!window.dojahWidget,
          DojahType: typeof window.Dojah,
          dojahWidgetType: typeof window.dojahWidget
        })
        scriptLoadPromise = null
        resolve()
      } else if (totalTimeWaited >= GLOBAL_CHECK_TIMEOUT) {
        // This is handled by the overall timeout, but just for safety
        clearInterval(intervalId)
      }
    }

    // 4. Handle script creation and injection
    const script = document.createElement('script')
    script.id = scriptId
    script.src = scriptUrl
    script.async = true
    script.defer = true

    // 5. Script loaded successfully (but global might not be ready)
    script.onload = () => {
      console.log('[MODAL] Script element fired onload. Waiting for global...')
      // Start polling for the global object
      intervalId = setInterval(checkForGlobal, GLOBAL_CHECK_INTERVAL)
    }

    // 6. Script failed to load entirely (network error, 404)
    script.onerror = (event) => {
      clearTimeout(overallTimeoutId)
      if (intervalId) clearInterval(intervalId)
      cleanUpScript(scriptId)
      const errorMessage = `Failed to load script from ${scriptUrl}. Network error.`
      console.error(`[MODAL] ${errorMessage}`, event)
      reject(new Error(errorMessage))
    }

    // 7. Inject the script
    console.log(`[MODAL] Injecting script tag: ${scriptUrl}`)
    document.head.appendChild(script)
    console.log(`[MODAL] Script tag injected successfully`)
  })

  return scriptLoadPromise
}

export function DojahModal() {
  const { 
    isDojahModalOpen, 
    closeDojahModal, 
    verificationType, 
    onSuccess, 
    onError 
  } = useDojahModal()
  
  console.log("🎭 [MODAL] DojahModal render - State:", {
    isDojahModalOpen,
    verificationType,
    hasSuccessCallback: !!onSuccess,
    hasErrorCallback: !!onError
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'initial' | 'loading' | 'verifying' | 'success' | 'error'>('initial')
  const [error, setError] = useState<string | null>(null)
  const [dojahInstance, setDojahInstance] = useState<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  // Initialize Dojah when modal opens
  useEffect(() => {
    console.log("🔄 [MODAL] useEffect triggered - isDojahModalOpen:", isDojahModalOpen, "initializedRef.current:", initializedRef.current)
    if (isDojahModalOpen && !initializedRef.current) {
      console.log("🚀 [MODAL] Modal opened, initializing Dojah...")
      initializeDojah()
    }
  }, [isDojahModalOpen])

  // Cleanup when modal closes
  useEffect(() => {
    console.log("🔄 [MODAL] Cleanup useEffect triggered - isDojahModalOpen:", isDojahModalOpen)
    if (!isDojahModalOpen) {
      console.log("🧹 [MODAL] Modal closed, cleaning up...")
      cleanupDojah()
      setStep('initial')
      setError(null)
      initializedRef.current = false
    }
  }, [isDojahModalOpen])

  const initializeDojah = async () => {
    try {
      console.log("🚀 [MODAL] Initializing Dojah integration...")
      console.log("🚀 [MODAL] Current verification type:", verificationType)
      setStep('loading')
      setIsLoading(true)

      // Use the robust script loading function
      console.log("📜 [MODAL] Loading Dojah script...")
      console.log("🔑 [MODAL] Environment check:", {
        appID: process.env.NEXT_PUBLIC_DOJAH_APP_ID,
        publicKey: process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY,
        environment: process.env.NEXT_PUBLIC_DOJAH_ENVIRONMENT
      })
      await loadDojahScript()
      
      console.log("✅ [MODAL] Dojah script loaded successfully")
      console.log("✅ [MODAL] Available SDKs:", {
        hasDojah: !!window.Dojah,
        hasDojahWidget: !!window.dojahWidget
      })
      
      // Initialize Dojah widget based on available SDK
      let instance: any
      
      if (window.Dojah) {
        // Use Dojah SDK v2
        const config = {
          appID: process.env.NEXT_PUBLIC_DOJAH_APP_ID || "6875f7ffcb4d46700c74336e",
          publicKey: process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY || "prod_pk_deSgNF4R6LJVWU29lSfZ41aW4",
          type: "custom",
          containerID: "dojah-widget-container",
          config: {
            pages: verificationType === "business" 
              ? ["government-data", "selfie", "business"] 
              : ["government-data", "selfie"],
            theme: {
              primaryColor: "#2563eb",
              secondaryColor: "#64748b"
            }
          },
          callback: (result: any) => {
            console.log("🎯 [MODAL] Dojah callback received:", result)
            handleDojahCallback(result)
          },
          onError: (error: any) => {
            console.error("❌ [MODAL] Dojah error:", error)
            handleDojahError(error)
          },
          onClose: () => {
            console.log("🔒 [MODAL] Dojah modal closed by user")
            closeDojahModal()
          }
        }

        console.log("🔧 [MODAL] Dojah SDK v2 config:", config)
        console.log("🔧 [MODAL] Environment variables:", {
          appID: process.env.NEXT_PUBLIC_DOJAH_APP_ID || "Using fallback",
          publicKey: process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY || "Using fallback"
        })
        
        try {
          instance = new window.Dojah(config)
          console.log("✅ [MODAL] Dojah SDK v2 instance created successfully")
        } catch (initError: unknown) {
          const errorMessage = initError instanceof Error ? initError.message : 'Unknown error'
          console.error("❌ [MODAL] Failed to create Dojah SDK v2 instance:", initError)
          throw new Error(`Dojah SDK v2 initialization failed: ${errorMessage}`)
        }
      } else if (window.dojahWidget) {
        // Use Dojah Widget SDK
        const config = {
          app_id: process.env.NEXT_PUBLIC_DOJAH_APP_ID || "6875f7ffcb4d46700c74336e",
          public_key: process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY || "prod_pk_deSgNF4R6LJVWU29lSfZ41aW4",
          type: verificationType === "business" ? "business" : "identity",
          container_id: "dojah-widget-container",
          callback: (result: any) => {
            console.log("🎯 [MODAL] Dojah widget callback received:", result)
            handleDojahCallback(result)
          },
          onError: (error: any) => {
            console.error("❌ [MODAL] Dojah widget error:", error)
            handleDojahError(error)
          },
          onClose: () => {
            console.log("🔒 [MODAL] Dojah widget closed by user")
            closeDojahModal()
          }
        }

        console.log("🔧 [MODAL] Dojah Widget config:", config)
        console.log("🔧 [MODAL] Environment variables:", {
          app_id: process.env.NEXT_PUBLIC_DOJAH_APP_ID || "Using fallback",
          public_key: process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY || "Using fallback"
        })
        
        try {
          instance = window.dojahWidget.init(config)
          console.log("✅ [MODAL] Dojah Widget instance created successfully")
        } catch (initError: unknown) {
          const errorMessage = initError instanceof Error ? initError.message : 'Unknown error'
          console.error("❌ [MODAL] Failed to create Dojah Widget instance:", initError)
          throw new Error(`Dojah Widget initialization failed: ${errorMessage}`)
        }
      } else {
        throw new Error("Neither Dojah SDK v2 nor dojahWidget is available after script load")
      }

      setDojahInstance(instance)
      console.log("📦 [MODAL] Dojah instance created:", instance)
      
      // Wait for container to be ready
      console.log("⏳ [MODAL] Waiting for container to be ready...")
      await waitForContainer()
      console.log("✅ [MODAL] Container is ready")
      
      // Initialize the widget (only for SDK v2, widget SDK is already initialized)
      if (window.Dojah && instance.init) {
        console.log("🚀 [MODAL] Initializing Dojah SDK v2 widget...")
        instance.init()
      }
      
      console.log("✅ [MODAL] Dojah widget initialized successfully")
      setStep('verifying')
      setIsLoading(false)
      initializedRef.current = true
      
    } catch (err) {
      console.error("❌ [MODAL] Failed to initialize Dojah:", err)
      setError(err instanceof Error ? err.message : "Failed to initialize verification")
      setStep('error')
      setIsLoading(false)
      onError?.(err)
    }
  }

  const waitForContainer = (): Promise<void> => {
    return new Promise((resolve) => {
      const checkContainer = () => {
        if (containerRef.current) {
          resolve()
        } else {
          setTimeout(checkContainer, 50)
        }
      }
      
      checkContainer()
    })
  }

  const handleDojahCallback = (result: any) => {
    console.log("🎯 [MODAL] Processing Dojah callback result:", result)
    
    if (result?.event === "successful") {
      setStep('success')
      setIsLoading(false)
      
      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess?.(result)
        closeDojahModal()
      }, 2000)
      
    } else if (result?.event === "closed") {
      console.log("🔒 [MODAL] Dojah verification closed by user")
      closeDojahModal()
      
    } else {
      console.log("ℹ️ [MODAL] Dojah event:", result?.event)
    }
  }

  const handleDojahError = (error: any) => {
    console.error("❌ [MODAL] Dojah error occurred:", error)
    setError(error?.message || "Verification failed. Please try again.")
    setStep('error')
    setIsLoading(false)
    onError?.(error)
  }

  const cleanupDojah = () => {
    if (dojahInstance) {
      try {
        dojahInstance.destroy?.()
        console.log("🧹 [MODAL] Dojah instance cleaned up")
      } catch (e) {
        console.log("⚠️ [MODAL] Error during Dojah cleanup:", e)
      }
      setDojahInstance(null)
    }
  }

  const retryVerification = () => {
    setStep('initial')
    setError(null)
    initializedRef.current = false
    initializeDojah()
  }

  // Don't render if modal is not open
  if (!isDojahModalOpen) return null

  if (step === 'success') {
    return (
      <Dialog open={isDojahModalOpen} onOpenChange={closeDojahModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Verification Successful!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-green-700 mb-4">
              Your identity has been verified successfully. You can now access all platform features.
            </p>
            <Button onClick={closeDojahModal} className="w-full">
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (step === 'error') {
    return (
      <Dialog open={isDojahModalOpen} onOpenChange={closeDojahModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Verification Failed
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-700 mb-4">
              {error || 'Something went wrong during verification. Please try again.'}
            </p>
            <div className="flex gap-2">
              <Button onClick={retryVerification} className="flex-1">
                Try Again
              </Button>
              <Button variant="outline" onClick={closeDojahModal} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isDojahModalOpen} onOpenChange={closeDojahModal}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            {verificationType === 'business' ? 'Business Verification' : 'Identity Verification'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {step === 'loading' && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Initializing verification system... Please wait.
              </AlertDescription>
            </Alert>
          )}

          {step === 'verifying' && (
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Verification system ready. Complete the verification process below.
              </AlertDescription>
            </Alert>
          )}

          <div className="relative">
            {/* Dojah Widget Container */}
            <div 
              ref={containerRef}
              id="dojah-widget-container"
              className="min-h-[500px] border rounded-lg bg-gray-50"
            >
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-gray-600">Loading verification system...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Loading Overlay */}
            {step === 'loading' && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                  <h3 className="text-lg font-semibold mb-2">Setting up verification</h3>
                  <p className="text-gray-600">Please wait while we initialize the verification system...</p>
                </div>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>What happens during verification:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Upload government-issued ID document</li>
              <li>Take a selfie for identity confirmation</li>
              {verificationType === 'business' && (
                <li>Provide business verification documents</li>
              )}
              <li>Wait for verification approval (usually 2-5 minutes)</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
