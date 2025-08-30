"use client"

import { useState } from "react"
import { DojahDirect } from "@/components/dojah-direct"
import { DojahReactSdk } from "@/components/dojah-react-sdk"
import { Button } from "@/components/ui/button"
import { DojahMinimal } from "@/components/dojah-minimal"
import { DojahModal } from "@/components/dojah-modal"
import { DojahProduction } from "@/components/dojah-production"

export default function TestDojahDirectPage() {
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSuccess = (data: any) => {
    console.log("✅ Verification successful:", data)
    setResult(data)
    setError(null)
  }

  const handleError = (err: any) => {
    console.error("❌ Verification failed:", err)
    setError(err.message || "Verification failed")
    setResult(null)
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Dojah Integration Test</h1>
      
      <div className="space-y-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="font-semibold mb-2">Instructions:</h2>
          <p className="text-sm text-gray-700">
            Testing both direct widget loading and React SDK approaches. Try both to see which works.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Direct Widget Loading</h3>
            <DojahDirect
              verificationType="identity"
              onSuccess={handleSuccess}
              onError={handleError}
            />
            
            <DojahDirect
              verificationType="business"
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">React SDK</h3>
            <DojahReactSdk
              verificationType="identity"
              onSuccess={handleSuccess}
              onError={handleError}
            />
            
            <DojahReactSdk
              verificationType="business"
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </div>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Minimal Configuration Test</h3>
          <p className="text-sm text-gray-700 mb-4">
            This uses the absolute minimal configuration to test if the basic setup works.
          </p>
          <DojahMinimal
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Modal Type Test</h3>
          <p className="text-sm text-gray-700 mb-4">
            This uses modal type instead of custom type.
          </p>
          <DojahModal
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>

        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Production Widget Test</h3>
          <p className="text-sm text-gray-700 mb-4">
            Direct widget approach with production credentials.
          </p>
          <DojahProduction
            verificationType="identity"
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Success:</h3>
            <pre className="text-sm text-green-700 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={() => {
              setResult(null)
              setError(null)
            }}
            variant="outline"
          >
            Clear Results
          </Button>
          
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  )
}
