'use client'

import { useEffect, useState } from 'react'

export function DojahSdkLoader() {
  const [sdkStatus, setSdkStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  useEffect(() => {
    console.log("🚀 [SDK-LOADER] DojahSdkLoader component mounted")
    
    const loadDojahSDK = async () => {
      try {
        console.log('🚀 [SDK-LOADER] Starting Dojah SDK load...')
        
        // Check if Dojah is already available
        if (window.Dojah || window.dojahWidget) {
          console.log('✅ [SDK-LOADER] Dojah SDK already available')
          console.log('✅ [SDK-LOADER] Available SDKs:', {
            hasDojah: !!window.Dojah,
            hasDojahWidget: !!window.dojahWidget
          })
          setSdkStatus('loaded')
          return
        }

        // Check if script already exists
        const existingScript = document.getElementById('dojah-script')
        if (existingScript) {
          console.log('📜 [SDK-LOADER] Dojah script already exists, waiting for load...')
          await waitForDojah(10000) // Wait up to 10 seconds
          return
        }

        // Create and load the script
        console.log('📜 [SDK-LOADER] Creating Dojah script...')
        const script = document.createElement('script')
        script.src = 'https://widget.dojah.io/widget.js'
        script.async = true
        script.id = 'dojah-script'
        
        script.onload = async () => {
          console.log('📜 [SDK-LOADER] Dojah script loaded, waiting for SDK...')
          await waitForDojah(10000) // Wait up to 10 seconds for SDK to initialize
        }
        
        script.onerror = () => {
          console.error('❌ [SDK-LOADER] Failed to load Dojah script')
          setSdkStatus('error')
        }
        
        console.log('📜 [SDK-LOADER] Appending script to document head...')
        document.head.appendChild(script)
        
      } catch (error) {
        console.error('❌ [SDK-LOADER] Error loading Dojah SDK:', error)
        setSdkStatus('error')
      }
    }

    const waitForDojah = (timeoutMs: number): Promise<void> => {
      return new Promise((resolve) => {
        const startTime = Date.now()
        console.log(`⏳ [SDK-LOADER] Waiting for Dojah SDK (timeout: ${timeoutMs}ms)...`)
        
        const checkDojah = () => {
          if (window.Dojah || window.dojahWidget) {
            console.log('✅ [SDK-LOADER] Dojah SDK loaded successfully')
            console.log('✅ [SDK-LOADER] Final SDK status:', {
              hasDojah: !!window.Dojah,
              hasDojahWidget: !!window.dojahWidget,
              DojahType: typeof window.Dojah,
              dojahWidgetType: typeof window.dojahWidget
            })
            setSdkStatus('loaded')
            resolve()
            return
          }
          
          const elapsed = Date.now() - startTime
          if (elapsed >= timeoutMs) {
            console.error('❌ [SDK-LOADER] Dojah SDK failed to load within timeout')
            setSdkStatus('error')
            resolve()
            return
          }
          
          // Check again in 100ms
          setTimeout(checkDojah, 100)
        }
        
        checkDojah()
      })
    }

    // Start loading
    loadDojahSDK()
    
    // Cleanup function
    return () => {
      console.log("🧹 [SDK-LOADER] DojahSdkLoader component unmounting")
    }
  }, [])

  // Log status changes
  useEffect(() => {
    console.log(`📊 [SDK-LOADER] SDK Status changed to: ${sdkStatus}`)
  }, [sdkStatus])

  // This component doesn't render anything visible
  // It just handles the SDK loading logic
  return null
}

// Extend Window interface to include Dojah properties
declare global {
  interface Window {
    Dojah?: any
    dojahWidget?: any
    dojahSpinnerHtml?: string
  }
}
