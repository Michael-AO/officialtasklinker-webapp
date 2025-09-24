'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle } from 'lucide-react'
import { useDojahModal } from '@/contexts/dojah-modal-context'

interface DojahVerificationProps {
  onSuccess: (data: any) => void
  onError: (error: any) => void
  onClose: () => void
}

export default function DojahVerification({ onSuccess, onError, onClose }: DojahVerificationProps) {
  const { openDojahModal, setVerificationType, setOnSuccess, setOnError } = useDojahModal()

  const handleStartVerification = () => {
    // Set up the verification type and callbacks
    setVerificationType('identity') // Default to identity, can be overridden
    setOnSuccess(onSuccess)
    setOnError(onError)
    
    // Open the modal
    openDojahModal()
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            ID Verification
          </CardTitle>
          <CardDescription>
            Complete identity verification to access all features
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong>Production Ready:</strong> This integrates with Dojah's real verification service.
              Complete verification to unlock all platform features.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <strong>What happens during verification:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Upload government-issued ID</li>
                <li>Take a selfie for identity confirmation</li>
                <li>Provide additional verification documents</li>
                <li>Wait for verification approval (2-5 minutes)</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleStartVerification}
                className="flex-1"
              >
                Start Verification
              </Button>
              
              <Button 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
