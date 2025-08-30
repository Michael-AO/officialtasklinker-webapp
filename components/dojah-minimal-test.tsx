"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DojahMinimalTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [showWidget, setShowWidget] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleStart = () => {
    setIsLoading(true)
    setShowWidget(true)
    
    // Initialize Dojah widget manually
    if (typeof window !== 'undefined' && (window as any).Dojah) {
      try {
        const config = {
          appID: "test_app_id",
          publicKey: "test_pk_TNoLXCX4T96k0WdbLnFJGYipd",
          type: "custom",
          config: {
            debug: true,
            mobile: true,
            environment: "test"
          },
          response: (status: string, data: any) => {
            console.log("🔔 Minimal Dojah response:", status, data)
            setResult({ status, data })
            setIsLoading(false)
            setShowWidget(false)
          }
        }
        
        console.log("🚀 Initializing Dojah with config:", config)
        ;(window as any).Dojah.init(config)
      } catch (error) {
        console.error("❌ Dojah initialization error:", error)
        setResult({ status: 'error', data: error })
        setIsLoading(false)
        setShowWidget(false)
      }
    } else {
      console.error("❌ Dojah not available")
      setResult({ status: 'error', data: 'Dojah not available' })
      setIsLoading(false)
      setShowWidget(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Minimal Dojah Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Testing with minimal configuration to isolate the issue.
        </p>
        
        <Button 
          onClick={handleStart}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Testing..." : "Test Minimal Dojah"}
        </Button>
        
        {result && (
          <div className="p-3 border rounded bg-gray-50">
            <h4 className="font-semibold">Result:</h4>
            <pre className="text-xs mt-2 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          <p>Check browser console for detailed logs</p>
        </div>
      </CardContent>
    </Card>
  )
}
