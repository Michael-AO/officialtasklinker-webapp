"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DojahDebug() {
  const [config, setConfig] = useState({
    appId: process.env.NEXT_PUBLIC_DOJAH_APP_ID || "6875f7ffcb4d46700c74336e",
    publicKey: process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY || "test_pk_TNoLXCX4T96k0WdbLnFJGYipd",
    environment: process.env.NEXT_PUBLIC_DOJAH_ENVIRONMENT || "not set"
  })

  const testAPI = async () => {
    try {
      console.log("🧪 Testing Dojah API...")
      
      const response = await fetch('https://api.dojah.io/api/v1/kyc/nin_verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.publicKey}`,
          'AppId': config.appId
        },
        body: JSON.stringify({
          nin: '12345678901'
        })
      })
      
      console.log("📡 Response Status:", response.status)
      console.log("📡 Response Headers:", Object.fromEntries(response.headers.entries()))
      
      const data = await response.text()
      console.log("📡 Response Data:", data)
      
      alert(`API Test Result:\nStatus: ${response.status}\nData: ${data}`)
    } catch (error) {
      console.error("❌ API Test Error:", error)
      alert(`API Test Error: ${error.message}`)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Dojah Configuration Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold">Current Config:</h4>
          <div className="text-sm space-y-1 mt-2">
            <p><strong>App ID:</strong> {config.appId}</p>
            <p><strong>Public Key:</strong> {config.publicKey.substring(0, 20)}...</p>
            <p><strong>Environment:</strong> {config.environment}</p>
          </div>
        </div>
        
        <Button onClick={testAPI} className="w-full">
          Test Dojah API
        </Button>
        
        <div className="text-xs text-gray-500">
          <p>Check browser console for detailed logs</p>
        </div>
      </CardContent>
    </Card>
  )
}
