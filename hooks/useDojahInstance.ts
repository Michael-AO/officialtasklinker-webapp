import { useState, useEffect, useRef } from 'react'

// Global state to track Dojah instances
let activeDojahInstances = new Set<string>()
let instanceCounter = 0
let scriptLoaded = false

export function useDojahInstance() {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const instanceId = useRef(`dojah-${++instanceCounter}`)
  const instanceRef = useRef<any>(null)

  useEffect(() => {
    // Register this instance
    activeDojahInstances.add(instanceId.current)
    
    // Check if there are multiple instances
    if (activeDojahInstances.size > 1) {
      console.warn(`Multiple Dojah instances detected: ${activeDojahInstances.size}`)
    }

    // Prevent multiple script loads
    if (scriptLoaded) {
      console.log("Dojah script already loaded, skipping...")
    } else {
      scriptLoaded = true
    }

    setIsReady(true)

    return () => {
      // Cleanup on unmount
      activeDojahInstances.delete(instanceId.current)
      
      if (instanceRef.current) {
        try {
          instanceRef.current.destroy?.()
        } catch (e) {
          console.log("Dojah instance cleanup error:", e)
        }
        instanceRef.current = null
      }
    }
  }, [])

  const cleanupAllInstances = () => {
    console.log("🧹 Cleaning up all Dojah instances...")
    
    // Clean up all Dojah-related elements
    const dojahElements = document.querySelectorAll('[data-dojah-widget]')
    dojahElements.forEach(el => {
      console.log("Removing Dojah widget element:", el)
      el.remove()
    })
    
    const dojahScripts = document.querySelectorAll('script[src*="dojah"]')
    dojahScripts.forEach(script => {
      console.log("Removing Dojah script:", script)
      script.remove()
    })
    
    const dojahIframes = document.querySelectorAll('iframe[src*="dojah"]')
    dojahIframes.forEach(iframe => {
      console.log("Removing Dojah iframe:", iframe)
      iframe.remove()
    })
    
    // Remove any Dojah-related global variables
    const win = window as any
    if (win.dojahSpinnerHtml) {
      delete win.dojahSpinnerHtml
      console.log("Removed dojahSpinnerHtml from window")
    }
    
    // Clear all instances
    activeDojahInstances.clear()
    scriptLoaded = false
    
    console.log("✅ Dojah cleanup completed")
  }

  const setInstance = (instance: any) => {
    instanceRef.current = instance
  }

  return {
    isReady,
    error,
    instanceId: instanceId.current,
    setInstance,
    cleanupAllInstances,
    activeInstancesCount: activeDojahInstances.size
  }
}
