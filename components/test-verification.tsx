"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  CheckCircle, 
  User, 
  Building,
  RefreshCw,
  TestTube
} from "lucide-react"
import { DojahModal } from "./dojah-modal"
import { VerificationStatusBadge } from "./verification-status-badge"
import { toast } from "sonner"

export function TestVerification() {
  const { user, updateProfile } = useAuth()
  const [showDojahModal, setShowDojahModal] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [testMode, setTestMode] = useState(false)

  const getVerificationType = () => {
    return user?.userType === "client" ? "business" : "identity"
  }

  const handleVerificationSuccess = async (result: any) => {
    try {
      setProcessing(true)
      
      // Simulate API call for testing
      console.log("🎯 Dojah Result:", result)
      
      // Simulate successful verification
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success("🎉 Test Verification Completed Successfully!")
      await updateProfile({ 
        isVerified: true, 
        verification_type: getVerificationType()
      })
      
      setTestMode(false) // Exit test mode
    } catch (error) {
      console.error("Verification error:", error)
      toast.error("Failed to process verification")
    } finally {
      setProcessing(false)
    }
  }

  const startTestMode = () => {
    setTestMode(true)
    updateProfile({ isVerified: false })
    toast.info("🧪 Test mode activated - User set to unverified")
  }

  const exitTestMode = () => {
    setTestMode(false)
    updateProfile({ isVerified: true })
    toast.success("✅ Test mode deactivated - User restored to verified")
  }

  if (!user) return null

  return (
    <Card className="border-2 border-orange-200 bg-orange-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-orange-800">🧪 Verification Testing</CardTitle>
          </div>
          <Badge variant="outline" className="border-orange-300 text-orange-700">
            Test Mode
          </Badge>
        </div>
        <CardDescription className="text-orange-700">
          Test the Dojah verification process by temporarily setting user as unverified
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Current Status:</h4>
            <div className="flex items-center gap-2">
              <VerificationStatusBadge 
                status={user.isVerified ? "verified" : "unverified"} 
                type={getVerificationType()}
                size="sm"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              User Type: {user.userType} | 
              Verification Type: {getVerificationType()}
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Test Controls:</h4>
            <div className="flex gap-2">
              {!testMode ? (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={startTestMode}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Start Test
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={exitTestMode}
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Exit Test
                </Button>
              )}
            </div>
          </div>
        </div>

        {testMode && (
          <div className="space-y-3">
            <div className="p-3 bg-orange-100 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Test Mode Active:</strong> User is now set to unverified. 
                You can now test the Dojah verification process.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowDojahModal(true)}
                disabled={processing}
                className="flex-1"
              >
                {processing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Test Dojah Verification
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-xs text-orange-600 bg-orange-100 p-2 rounded">
              <strong>Test Instructions:</strong>
              <ul className="mt-1 space-y-1">
                <li>• Click "Test Dojah Verification" to open the Dojah widget</li>
                <li>• Complete the verification process in Dojah</li>
                <li>• Watch the success callback and status update</li>
                <li>• Use "Exit Test" to restore verified status</li>
              </ul>
            </div>
          </div>
        )}

        {!testMode && (
          <div className="p-3 bg-green-100 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Normal Mode:</strong> User is verified. Click "Start Test" to begin testing.
            </p>
          </div>
        )}
      </CardContent>

      <DojahModal
        open={showDojahModal}
        onOpenChange={setShowDojahModal}
        verificationType={getVerificationType()}
        onSuccess={handleVerificationSuccess}
      />
    </Card>
  )
}
