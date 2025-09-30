"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export default function DebugVerificationPage() {
  const [isResetting, setIsResetting] = useState(false)

  const handleResetVerification = async () => {
    try {
      setIsResetting(true)
      
      const response = await fetch('/api/debug/reset-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        toast.success("Verification status reset successfully!")
        // Refresh the page to show updated status
        window.location.reload()
      } else {
        toast.error(data.error || "Failed to reset verification status")
      }
    } catch (error) {
      console.error("Reset verification error:", error)
      toast.error("Failed to reset verification status")
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Debug Verification Reset
          </CardTitle>
          <CardDescription>
            Reset your verification status for testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This will reset your verification status to unverified so you can test the full verification flow.
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={handleResetVerification}
            disabled={isResetting}
            className="w-full"
          >
            {isResetting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Verification Status
              </>
            )}
          </Button>
          
          <div className="text-sm text-gray-600">
            <p><strong>What this does:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Sets is_verified to false</li>
              <li>Sets verification status to false</li>
              <li>Clears verification_type</li>
              <li>Deletes any existing verification requests</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
