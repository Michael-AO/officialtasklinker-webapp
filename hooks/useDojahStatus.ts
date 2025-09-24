import { useState, useEffect } from 'react'

export function useDojahStatus() {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkStatus = () => {
      if (typeof window !== 'undefined') {
        if (window.Dojah) {
          setStatus('loaded')
          setIsChecking(false)
        } else {
          // Check if script exists
          const script = document.querySelector('script[src*="dojah.js"]')
          if (script) {
            // Wait a bit more for the script to load
            setTimeout(() => {
              if (window.Dojah) {
                setStatus('loaded')
              } else {
                setStatus('error')
              }
              setIsChecking(false)
            }, 2000)
          } else {
            setStatus('error')
            setIsChecking(false)
          }
        }
      }
    }

    checkStatus()
  }, [])

  return { status, isChecking }
}
