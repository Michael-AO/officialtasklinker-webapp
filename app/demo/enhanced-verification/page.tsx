'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertTriangle, Info, Shield, UserCheck, Building2, FileText, Camera } from 'lucide-react'
import { EnhancedIdVerification } from '@/components/enhanced-id-verification'
import { DojahModal } from '@/components/dojah-modal'

export default function EnhancedVerificationDemoPage() {
  const [showDojahModal, setShowDojahModal] = useState(false)
  const [verificationType, setVerificationType] = useState<'identity' | 'business'>('identity')
  const [activeTab, setActiveTab] = useState('demo')

  const features = [
    {
      title: "Multi-Step Verification",
      description: "Guided verification process with clear progress tracking",
      icon: <CheckCircle className="h-5 w-5 text-green-600" />
    },
    {
      title: "Real-time Validation",
      description: "Instant feedback on form inputs and requirements",
      icon: <CheckCircle className="h-5 w-5 text-green-600" />
    },
    {
      title: "Business & Individual Support",
      description: "Handle both personal and business verification workflows",
      icon: <CheckCircle className="h-5 w-5 text-green-600" />
    },
    {
      title: "Enhanced Error Handling",
      description: "Comprehensive error messages and recovery options",
      icon: <CheckCircle className="h-5 w-5 text-green-600" />
    },
    {
      title: "Progress Tracking",
      description: "Visual progress indicators and step-by-step guidance",
      icon: <CheckCircle className="h-5 w-5 text-green-600" />
    },
    {
      title: "Secure Integration",
      description: "Built on Dojah's secure verification platform",
      icon: <Shield className="h-5 w-5 text-blue-600" />
    }
  ]

  const verificationSteps = [
    {
      id: 'personal-info',
      title: 'Personal Information',
      description: 'Enter your basic personal details',
      icon: <UserCheck className="h-5 w-5" />,
      status: 'completed'
    },
    {
      id: 'id-document',
      title: 'ID Document',
      description: 'Upload and verify your government ID',
      icon: <FileText className="h-5 w-5" />,
      status: 'completed'
    },
    {
      id: 'selfie',
      title: 'Selfie Verification',
      description: 'Take a selfie for identity confirmation',
      icon: <Camera className="h-5 w-5" />,
      status: 'completed'
    },
    {
      title: 'Business Information',
      description: 'Provide business verification details',
      icon: <Building2 className="h-5 w-5" />,
      status: 'pending'
    }
  ]

  const handleVerificationSuccess = (result: any) => {
    console.log("🎯 Demo verification successful:", result)
  }

  const handleVerificationError = (error: any) => {
    console.error("❌ Demo verification error:", error)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold">Enhanced ID Verification Demo</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experience our comprehensive identity verification system with enhanced user experience, 
          better error handling, and seamless Dojah integration.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="demo">Live Demo</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        {/* Live Demo Tab */}
        <TabsContent value="demo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Demo Instructions
              </CardTitle>
              <CardDescription>
                This is a live demonstration of our enhanced verification system. 
                Fill out the form and experience the verification flow.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Button
                  onClick={() => setVerificationType('identity')}
                  variant={verificationType === 'identity' ? 'default' : 'outline'}
                  className="flex-1"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Individual Verification
                </Button>
                <Button
                  onClick={() => setVerificationType('business')}
                  variant={verificationType === 'business' ? 'default' : 'outline'}
                  className="flex-1"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Business Verification
                </Button>
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> This demo uses your production Dojah configuration. 
                  Make sure your domain is whitelisted in the Dojah dashboard.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Enhanced Verification Component */}
          <EnhancedIdVerification />
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {feature.icon}
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Verification Flow */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Flow</CardTitle>
              <CardDescription>
                Step-by-step process for identity verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {verificationSteps.map((step, index) => (
                  <div key={step.id || index} className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {step.status === 'completed' ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {step.icon}
                        <h4 className="font-medium">{step.title}</h4>
                        {step.status === 'completed' && (
                          <Badge variant="secondary" className="text-xs">Complete</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="documentation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Guide</CardTitle>
              <CardDescription>
                How to integrate the enhanced verification system into your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. Install Dependencies</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-progress
npm install lucide-react`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">2. Import Components</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import { EnhancedIdVerification } from '@/components/enhanced-id-verification'
import { useEnhancedVerification } from '@/hooks/useEnhancedVerification'`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">3. Use in Your Page</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`export default function VerificationPage() {
  return (
    <div className="container mx-auto py-8">
      <EnhancedIdVerification />
    </div>
  )
}`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">4. API Integration</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`// POST /api/verification/enhanced-dojah
{
  "dojahResult": {...},
  "verificationData": {...},
  "verificationType": "identity|business"
}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Environment variables and configuration options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Environment Variables</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm mt-2">
{`NEXT_PUBLIC_DOJAH_APP_ID=your_app_id
NEXT_PUBLIC_DOJAH_PUBLIC_KEY=your_public_key
NEXT_PUBLIC_DOJAH_ENVIRONMENT=production`}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-medium">Database Schema</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Ensure your users table has the following columns:
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 list-disc list-inside space-y-1">
                    <li><code>dojah_verified</code> - Boolean flag for verification status</li>
                    <li><code>verification_type</code> - Type of verification (identity/business)</li>
                    <li><code>verification_status</code> - Current verification status</li>
                    <li><code>verified_at</code> - Timestamp of verification</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
