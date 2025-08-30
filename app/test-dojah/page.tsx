"use client"

import { useState } from "react"
import { DojahSimple } from "@/components/dojah-simple"

export default function TestDojahPage() {
  const [result, setResult] = useState<any>(null)

  const handleSuccess = (result: any) => {
    console.log("✅ Dojah verification successful:", result)
    setResult({ status: 'success', data: result })
    alert("Verification completed successfully! Check console for details.")
  }

  const handleError = (error: any) => {
    console.error("❌ Dojah verification failed:", error)
    setResult({ status: 'error', data: error })
    alert("Verification failed. Check console for details.")
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Dojah Integration Test</h1>
      <p className="text-gray-600 mb-8">
        Simple test - click the button and the Dojah widget will open directly.
      </p>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Test Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click the "Start Verification" button below</li>
            <li>The Dojah widget should open directly without any custom modal</li>
            <li>Complete the verification process</li>
            <li>Check the console for any error messages</li>
            <li>Verify that the response is handled correctly</li>
          </ol>
        </div>

        <div className="p-4 border rounded-lg bg-blue-50">
          <h3 className="font-semibold mb-2">Expected Behavior:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>No custom modal - widget opens directly</li>
            <li>No CSP violation errors</li>
            <li>Clean widget initialization</li>
            <li>Proper response handling</li>
          </ul>
        </div>

        <div className="p-6 border rounded-lg bg-white">
          <h3 className="text-lg font-semibold mb-4">Simple Dojah Test</h3>
          <p className="text-sm text-gray-600 mb-4">
            This uses the simple Dojah component with direct widget opening.
          </p>
          
          <DojahSimple
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>

        {result && (
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-2">Test Result:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
