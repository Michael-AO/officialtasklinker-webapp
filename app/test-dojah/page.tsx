'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { DojahModal } from '@/components/dojah-modal'
import { useDojahStatus } from '@/hooks/useDojahStatus'

export default function TestDojahPage() {
  const [showDojahModal, setShowDojahModal] = useState(false)
  const [verificationType, setVerificationType] = useState<'identity' | 'business'>('identity')
  const [lastResult, setLastResult] = useState<any>(null)
  const [lastError, setLastError] = useState<any>(null)
  const { status: dojahStatus, isChecking } = useDojahStatus()

  const handleVerificationSuccess = (result: any) => {
    console.log("🎯 Dojah verification successful:", result)
    setLastResult(result)
    setLastError(null)
  }

  const handleVerificationError = (error: any) => {
    console.error("❌ Dojah verification error:", error)
    setLastError(error)
    setLastResult(null)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">🧪 Dojah Integration Test</h1>
        <p className="text-xl text-gray-600">
          Test the production Dojah verification integration
        </p>
      </div>

      {/* Environment Check */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Environment Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>App ID:</strong> {process.env.NEXT_PUBLIC_DOJAH_APP_ID || 'Not set'}
            </div>
            <div>
              <strong>Public Key:</strong> {process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY ? 
                `${process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY.substring(0, 20)}...` : 'Not set'}
            </div>
            <div>
              <strong>Environment:</strong> {process.env.NEXT_PUBLIC_DOJAH_ENVIRONMENT || 'Not set'}
            </div>
            <div>
              <strong>SDK Status:</strong> 
              {isChecking ? (
                <span className="ml-2 text-blue-600">⏳ Checking...</span>
              ) : dojahStatus === 'loaded' ? (
                <span className="ml-2 text-green-600">✅ Loaded</span>
              ) : (
                <span className="ml-2 text-red-600">❌ Failed to load</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Type Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Verification Type</CardTitle>
          <CardDescription>
            Choose the type of verification to test
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={verificationType === 'identity' ? 'default' : 'outline'}
              onClick={() => setVerificationType('identity')}
            >
              Identity Verification
            </Button>
            <Button
              variant={verificationType === 'business' ? 'default' : 'outline'}
              onClick={() => setVerificationType('business')}
            >
              Business Verification
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
          <CardDescription>
            Start the Dojah verification process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setShowDojahModal(true)}
            size="lg"
            className="w-full md:w-auto"
            disabled={dojahStatus !== 'loaded'}
          >
            {dojahStatus === 'loaded' ? (
              `🚀 Start ${verificationType === 'business' ? 'Business' : 'Identity'} Verification`
            ) : (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isChecking ? 'Checking SDK...' : 'SDK Not Loaded'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {lastResult && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Last Successful Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-white p-3 rounded border overflow-auto">
              {JSON.stringify(lastResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {lastError && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Last Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-white p-3 rounded border overflow-auto">
              {JSON.stringify(lastError, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>To test the integration:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Click "Start Verification" button above</li>
              <li>Wait for Dojah modal to load (check console for logs)</li>
              <li>Complete the verification process in Dojah</li>
              <li>Check the results below</li>
            </ol>
          </div>
          
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> This is using your production Dojah keys. 
              Make sure your domain is whitelisted in the Dojah dashboard.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Dojah Modal */}
      <DojahModal
        open={showDojahModal}
        onOpenChange={setShowDojahModal}
        verificationType={verificationType}
        onSuccess={handleVerificationSuccess}
        onError={handleVerificationError}
      />
    </div>
  )
}
