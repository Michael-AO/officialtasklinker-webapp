'use client'

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'

// Debug flag - set to false to reduce console spam
const DEBUG_MODE = true

// 1. Create the Context
const DojahModalContext = createContext<{
  isDojahModalOpen: boolean
  openDojahModal: () => void
  closeDojahModal: () => void
  verificationType: 'identity' | 'business'
  setVerificationType: (type: 'identity' | 'business') => void
  onSuccess?: (result: any) => void
  setOnSuccess: (callback: (result: any) => void) => void
  onError?: (error: any) => void
  setOnError: (callback: (error: any) => void) => void
} | undefined>(undefined)

// 2. Create a Provider Component
export const DojahModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDojahModalOpen, setIsDojahModalOpen] = useState(false)
  const [verificationType, setVerificationTypeState] = useState<'identity' | 'business'>('identity')
  const [onSuccess, setOnSuccessState] = useState<((result: any) => void) | undefined>(undefined)
  const [onError, setOnErrorState] = useState<((error: any) => void) | undefined>(undefined)

  // Function to open the modal from anywhere - use useCallback to prevent recreation
  const openDojahModal = useCallback(() => {
    if (DEBUG_MODE) {
      console.log("🔓 [CONTEXT] openDojahModal() called")
      console.log("🔓 [CONTEXT] Current state:", {
        isDojahModalOpen,
        verificationType,
        hasSuccessCallback: !!onSuccess,
        hasErrorCallback: !!onError
      })
    }
    setIsDojahModalOpen(true)
  }, [isDojahModalOpen, verificationType, onSuccess, onError])
  
  // Function to close the modal from anywhere - use useCallback to prevent recreation
  const closeDojahModal = useCallback(() => {
    if (DEBUG_MODE) {
      console.log("🔒 [CONTEXT] closeDojahModal() called")
      console.log("🔒 [CONTEXT] Resetting callbacks and closing modal")
    }
    setIsDojahModalOpen(false)
    // Reset callbacks when closing
    setOnSuccessState(undefined)
    setOnErrorState(undefined)
  }, [])

  // Enhanced setVerificationType with logging - use useCallback to prevent recreation
  const setVerificationType = useCallback((type: 'identity' | 'business') => {
    if (DEBUG_MODE) {
      console.log("🏷️ [CONTEXT] setVerificationType() called with:", type)
      console.log("🏷️ [CONTEXT] Previous type was:", verificationType)
    }
    setVerificationTypeState(type)
  }, [verificationType])

  // Enhanced setOnSuccess with logging - use useCallback to prevent recreation
  const setOnSuccess = useCallback((callback: (result: any) => void) => {
    if (DEBUG_MODE) {
      console.log("✅ [CONTEXT] setOnSuccess() called")
      console.log("✅ [CONTEXT] Callback function:", callback?.name || 'anonymous')
    }
    setOnSuccessState(callback)
  }, [])

  // Enhanced setOnError with logging - use useCallback to prevent recreation
  const setOnError = useCallback((callback: (error: any) => void) => {
    if (DEBUG_MODE) {
      console.log("❌ [CONTEXT] setOnError() called")
      console.log("❌ [CONTEXT] Callback function:", callback?.name || 'anonymous')
    }
    setOnErrorState(callback)
  }, [])

  // The value that will be supplied to any consuming component - use useMemo to prevent recreation
  const value = useMemo(() => ({
    isDojahModalOpen,
    openDojahModal,
    closeDojahModal,
    verificationType,
    setVerificationType,
    onSuccess,
    setOnSuccess,
    onError,
    setOnError,
  }), [
    isDojahModalOpen,
    openDojahModal,
    closeDojahModal,
    verificationType,
    setVerificationType,
    onSuccess,
    setOnSuccess,
    onError,
    setOnError,
  ])

  // Only log when the value actually changes and in debug mode
  if (DEBUG_MODE) {
    console.log("🔄 [CONTEXT] Provider re-rendering with value:", {
      isDojahModalOpen,
      verificationType,
      hasSuccessCallback: !!onSuccess,
      hasErrorCallback: !!onError
    })
  }

  return (
    <DojahModalContext.Provider value={value}>
      {children}
    </DojahModalContext.Provider>
  )
}

// 3. Create a custom hook for easy access
export const useDojahModal = () => {
  const context = useContext(DojahModalContext)
  if (!context) {
    console.error("🚨 [CONTEXT] useDojahModal called outside of DojahModalProvider!")
    throw new Error('useDojahModal must be used within a DojahModalProvider')
  }
  
  // Only log once per component mount, not on every render, and only in debug mode
  if (DEBUG_MODE) {
    console.log("🎯 [CONTEXT] useDojahModal() called, returning context:", {
      isDojahModalOpen: context.isDojahModalOpen,
      verificationType: context.verificationType,
      hasSuccessCallback: !!context.onSuccess,
      hasErrorCallback: !!context.onError
    })
  }
  
  return context
}
