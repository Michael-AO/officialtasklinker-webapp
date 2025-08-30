"use client"

import { useEffect, useState, useRef } from 'react'
import Dojah from 'dojah-kyc-sdk-react'

// Global state to ensure only one Dojah instance
let globalDojahInstance: any = null
let isInitializing = false
let scriptLoadAttempts = 0
const MAX_SCRIPT_ATTEMPTS = 3

// Function to clean up Dojah completely
const cleanupDojahCompletely = () => {
  console.log("🧹 Aggressive Dojah cleanup...")
  
  // Remove all Dojah-related elements
  const selectors = [
    '[data-dojah-widget]',
    '[data-dojah-wrapper]',
    'iframe[src*="dojah"]',
    'script[src*="dojah"]',
    'script[src*="widget.js"]'
  ]
  
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector)
    elements.forEach(el => {
      console.log(`Removing ${selector}:`, el)
      el.remove()
    })
  })
  
  // Remove global variables
  const win = window as any
  const globalVars = [
    'dojahSpinnerHtml',
    'DojahKYC',
    'Dojah',
    'dojah',
    'DOJAH'
  ]
  
  globalVars.forEach(varName => {
    if (win[varName]) {
      delete win[varName]
      console.log(`Removed global variable: ${varName}`)
    }
  })
  
  // Clear any existing instances
  if (globalDojahInstance) {
    try {
      globalDojahInstance.destroy?.()
    } catch (e) {
      console.log("Dojah instance cleanup error:", e)
    }
    globalDojahInstance = null
  }
  
  isInitializing = false
  scriptLoadAttempts = 0
  
  console.log("✅ Aggressive Dojah cleanup completed")
}

interface DojahWrapperProps {
  appID: string
  publicKey: string
  type: 'custom' | 'modal'
  response: (status: string, data?: any) => void
  onError?: (error: any) => void
  onMount?: (instance: any) => void
  config?: any
  userData?: any
  children?: React.ReactNode
}

export function DojahWrapper({
  appID,
  publicKey,
  type,
  response,
  onError,
  onMount,
  config,
  userData,
  children
}: DojahWrapperProps) {
  const [shouldRender, setShouldRender] = useState(false)
  const [key, setKey] = useState(0)
  const instanceRef = useRef<any>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitializing) {
      console.log("⚠️ Dojah already initializing, skipping...")
      return
    }

    isInitializing = true
    
    // Clean up any existing instances first
    cleanupDojahCompletely()

    // Set a new key to force re-render
    setKey(prev => prev + 1)
    setShouldRender(true)

    return () => {
      setShouldRender(false)
      isInitializing = false
    }
  }, [])

  const handleMount = (instance: any) => {
    console.log("✅ Dojah instance mounted in wrapper")
    globalDojahInstance = instance
    instanceRef.current = instance
    onMount?.(instance)
  }

  const handleResponse = (status: string, data?: any) => {
    console.log(`🔔 Dojah wrapper response: ${status}`)
    
    if (status === 'error' && retryCount < 2) {
      console.log(`🔄 Retrying Dojah initialization (attempt ${retryCount + 1})`)
      setRetryCount(prev => prev + 1)
      
      // Clean up and retry
      setTimeout(() => {
        cleanupDojahCompletely()
        setKey(prev => prev + 1)
        setShouldRender(true)
      }, 1000)
      
      return
    }
    
    response(status, data)
  }

  const handleError = (error: any) => {
    console.error("❌ Dojah wrapper error:", error)
    
    if (retryCount < 2) {
      console.log(`🔄 Retrying due to error (attempt ${retryCount + 1})`)
      setRetryCount(prev => prev + 1)
      
      // Clean up and retry
      setTimeout(() => {
        cleanupDojahCompletely()
        setKey(prev => prev + 1)
        setShouldRender(true)
      }, 1000)
      
      return
    }
    
    onError?.(error)
  }

  if (!shouldRender) {
    return null
  }

  return (
    <div data-dojah-wrapper="true" key={key}>
      <Dojah
        ref={instanceRef}
        appID={appID}
        publicKey={publicKey}
        type={type}
        response={handleResponse}
        onError={handleError}
        onMount={handleMount}
        config={config}
        userData={userData}
      />
      {children}
    </div>
  )
}
