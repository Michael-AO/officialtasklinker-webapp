'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, AlertTriangle, Clock, Shield } from 'lucide-react'
import { EnhancedIdVerification } from '@/components/enhanced-id-verification'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'

export default function EnhancedVerificationPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [verificationStatus, setVerificationStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkVerificationStatus()
  }, [])

  const checkVerificationStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/verification/enhanced-dojah')
      
      if (response.ok) {
        const data = await response.json()
        setVerificationStatus(data.data)
      } else {
        console.error('Failed to check verification status')
      }
    } catch (error) {
      console.error('Error checking verification status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">✅ Verified</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">❌ Rejected</Badge>
      default:
        return <Badge variant="secondary">❓ Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-600" />
      case 'rejected':
        return <AlertTriangle className="h-6 w-6 text-red-600" />
      default:
        return <Shield className="h-6 w-6 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification status...</p>
        </div>
      </div>
    )
  }

  // If user is already verified, show success state
  if (verificationStatus?.verification_status?.dojah_verified) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <h1 className="text-3xl font-bold">Verification Complete!</h1>
          </div>
          <p className="text-gray-600">
            Your identity has been successfully verified. You now have access to all platform features.
          </p>
        </div>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Verification Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-gray-700">Status:</strong>
                <div className="mt-1">{getStatusBadge(verificationStatus.verification_status.verification_status)}</div>
              </div>
              <div>
                <strong className="text-gray-700">Type:</strong>
                <div className="mt-1 capitalize">
                  {verificationStatus.verification_status.verification_type || 'Individual'}
                </div>
              </div>
              <div>
                <strong className="text-gray-700">Verified At:</strong>
                <div className="mt-1">
                  {verificationStatus.verification_status.verified_at ? 
                    new Date(verificationStatus.verification_status.verified_at).toLocaleDateString() : 
                    'N/A'
                  }
                </div>
              </div>
              <div>
                <strong className="text-gray-700">User ID:</strong>
                <div className="mt-1 font-mono text-sm">
                  {verificationStatus.user_id}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button onClick={() => router.push('/dashboard')} className="mr-2">
            Go to Dashboard
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard/tasks')}>
            Browse Tasks
          </Button>
        </div>
      </div>
    )
  }

  // Show verification form
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Current Status */}
      {verificationStatus && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(verificationStatus.verification_status?.verification_status || 'unverified')}
              Current Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-gray-700">Status:</strong>
                <div className="mt-1">
                  {getStatusBadge(verificationStatus.verification_status?.verification_status || 'unverified')}
                </div>
              </div>
              <div>
                <strong className="text-gray-700">Type:</strong>
                <div className="mt-1 capitalize">
                  {verificationStatus.verification_status?.verification_type || 'Not set'}
                </div>
              </div>
              {verificationStatus.latest_request && (
                <>
                  <div>
                    <strong className="text-gray-700">Last Request:</strong>
                    <div className="mt-1">
                      {new Date(verificationStatus.latest_request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <strong className="text-gray-700">Request Status:</strong>
                    <div className="mt-1">
                      {getStatusBadge(verificationStatus.latest_request.status)}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Verification Component */}
      <EnhancedIdVerification />
    </div>
  )
}
