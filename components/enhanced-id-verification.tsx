'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, Loader2, Shield, UserCheck, Building2, FileText, Camera } from 'lucide-react'
import { DojahModal } from '@/components/dojah-modal'
import { useToast } from '@/hooks/use-toast'

interface VerificationStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  required: boolean
}

interface VerificationData {
  firstName: string
  lastName: string
  idNumber: string
  idType: string
  dateOfBirth: string
  nationality: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  phoneNumber: string
}

export function EnhancedIdVerification() {
  const { toast } = useToast()
  const [showDojahModal, setShowDojahModal] = useState(false)
  const [verificationType, setVerificationType] = useState<'identity' | 'business'>('identity')
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [verificationData, setVerificationData] = useState<VerificationData>({
    firstName: '',
    lastName: '',
    idNumber: '',
    idType: '',
    dateOfBirth: '',
    nationality: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    phoneNumber: ''
  })

  const verificationSteps: VerificationStep[] = [
    {
      id: 'personal-info',
      title: 'Personal Information',
      description: 'Enter your basic personal details',
      icon: <UserCheck className="h-5 w-5" />,
      status: 'pending',
      required: true
    },
    {
      id: 'id-document',
      title: 'ID Document',
      description: 'Upload and verify your government ID',
      icon: <FileText className="h-5 w-5" />,
      status: 'pending',
      required: true
    },
    {
      id: 'selfie',
      title: 'Selfie Verification',
      description: 'Take a selfie for identity confirmation',
      icon: <Camera className="h-5 w-5" />,
      status: 'pending',
      required: true
    },
    {
      id: 'business-info',
      title: 'Business Information',
      description: 'Provide business verification details',
      icon: <Building2 className="h-5 w-5" />,
      status: 'pending',
      required: false
    }
  ]

  // Update step status based on verification type
  useEffect(() => {
    if (verificationType === 'identity') {
      verificationSteps[3].status = 'pending'
      verificationSteps[3].required = false
    } else {
      verificationSteps[3].status = 'pending'
      verificationSteps[3].required = true
    }
  }, [verificationType])

  const completedSteps = verificationSteps.filter(step => step.status === 'completed').length
  const totalSteps = verificationSteps.filter(step => step.required || step.status === 'completed').length
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  const handleInputChange = (field: keyof VerificationData, value: string) => {
    setVerificationData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validatePersonalInfo = (): boolean => {
    const requiredFields = ['firstName', 'lastName', 'idNumber', 'idType', 'dateOfBirth', 'nationality']
    const missingFields = requiredFields.filter(field => !verificationData[field as keyof VerificationData])
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive"
      })
      return false
    }

    // Validate ID number length
    if (verificationData.idNumber.length < 5) {
      toast({
        title: "Invalid ID Number",
        description: "ID number must be at least 5 characters long",
        variant: "destructive"
      })
      return false
    }

    // Validate date of birth (must be 18+)
    const dob = new Date(verificationData.dateOfBirth)
    const today = new Date()
    const age = today.getFullYear() - dob.getFullYear()
    if (age < 18) {
      toast({
        title: "Age Requirement",
        description: "You must be at least 18 years old to verify your identity",
        variant: "destructive"
      })
      return false
    }

    return true
  }

  const handleStartVerification = () => {
    if (!validatePersonalInfo()) {
      return
    }

    // Mark personal info as completed
    verificationSteps[0].status = 'completed'
    setCurrentStep(1)

    // Open Dojah modal
    setShowDojahModal(true)
  }

  const handleVerificationSuccess = async (result: any) => {
    console.log("🎯 Dojah verification successful:", result)
    
    // Mark all steps as completed
    verificationSteps.forEach(step => {
      step.status = 'completed'
    })
    
    setCurrentStep(verificationSteps.length - 1)
    
    toast({
      title: "Verification Successful! 🎉",
      description: `Your ${verificationType} has been verified successfully. You can now access all platform features.`,
    })

    // Close modal after success
    setTimeout(() => {
      setShowDojahModal(false)
    }, 2000)
  }

  const handleVerificationError = (error: any) => {
    console.error("❌ Dojah verification error:", error)
    
    toast({
      title: "Verification Failed",
      description: error?.message || "Something went wrong during verification. Please try again.",
      variant: "destructive"
    })
  }

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'in-progress':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'in-progress':
        return 'bg-blue-50 border-blue-200'
      case 'failed':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Identity Verification</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Complete your identity verification to unlock all platform features. 
          This process is secure and typically takes 2-5 minutes.
        </p>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Verification Progress</span>
            <Badge variant="secondary">
              {completedSteps}/{totalSteps} Steps Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="mb-4" />
          <div className="text-sm text-gray-600">
            {progressPercentage === 100 ? (
              <span className="text-green-600 font-medium">✅ Verification Complete!</span>
            ) : (
              <span>Step {currentStep + 1} of {totalSteps}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification Steps */}
      <div className="grid gap-4">
        {verificationSteps.map((step, index) => (
          <Card key={step.id} className={getStepStatusColor(step.status)}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                {getStepStatusIcon(step.status)}
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {step.icon}
                    {step.title}
                    {step.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                  </CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            {step.id === 'personal-info' && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={verificationData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={verificationData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="idNumber">ID Number *</Label>
                    <Input
                      id="idNumber"
                      value={verificationData.idNumber}
                      onChange={(e) => handleInputChange('idNumber', e.target.value)}
                      placeholder="Enter your government ID number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idType">ID Type *</Label>
                    <Select value={verificationData.idType} onValueChange={(value) => handleInputChange('idType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nin">National Identification Number (NIN)</SelectItem>
                        <SelectItem value="driver_license">Driver's License</SelectItem>
                        <SelectItem value="voter_id">Voter's ID</SelectItem>
                        <SelectItem value="international_passport">International Passport</SelectItem>
                        <SelectItem value="national_id">National ID Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={verificationData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality *</Label>
                    <Input
                      id="nationality"
                      value={verificationData.nationality}
                      onChange={(e) => handleInputChange('nationality', e.target.value)}
                      placeholder="Enter your nationality"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={verificationData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={verificationData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter your city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province *</Label>
                    <Input
                      id="state"
                      value={verificationData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Enter your state"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      value={verificationData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={verificationData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      placeholder="Enter your country"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={verificationData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
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

                <Button
                  onClick={handleStartVerification}
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Start Verification Process
                    </>
                  )}
                </Button>
              </CardContent>
            )}

            {step.id === 'business-info' && verificationType === 'business' && (
              <CardContent>
                <Alert>
                  <Building2 className="h-4 w-4" />
                  <AlertDescription>
                    Business verification will require additional documents including business registration, 
                    tax information, and proof of business address.
                  </AlertDescription>
                </Alert>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Security Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Your data is secure</p>
              <p>
                All information is encrypted and processed securely through Dojah's verified platform. 
                We never store sensitive document images on our servers.
              </p>
            </div>
          </div>
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
