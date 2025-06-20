"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { Shield, Upload, CheckCircle, Clock, AlertTriangle, Camera } from "lucide-react"

interface VerificationStep {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed" | "failed"
  required: boolean
}

export function IdentityVerification() {
  const { user, updateProfile } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File }>({})
  const [formData, setFormData] = useState({
    documentType: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
  })

  const verificationSteps: VerificationStep[] = [
    {
      id: "document",
      title: "Government ID",
      description: "Upload a clear photo of your government-issued ID",
      status: user?.isVerified ? "completed" : "pending",
      required: true,
    },
    {
      id: "selfie",
      title: "Selfie Verification",
      description: "Take a selfie holding your ID document",
      status: "pending",
      required: true,
    },
    {
      id: "address",
      title: "Address Verification",
      description: "Provide proof of address (utility bill, bank statement)",
      status: "pending",
      required: false,
    },
    {
      id: "phone",
      title: "Phone Verification",
      description: "Verify your phone number via SMS",
      status: "completed",
      required: true,
    },
  ]

  const completedSteps = verificationSteps.filter((step) => step.status === "completed").length
  const totalSteps = verificationSteps.length
  const progressPercentage = (completedSteps / totalSteps) * 100

  const handleFileUpload = (stepId: string, file: File) => {
    setUploadedFiles((prev) => ({ ...prev, [stepId]: file }))
    // Update step status
    const stepIndex = verificationSteps.findIndex((step) => step.id === stepId)
    if (stepIndex !== -1) {
      verificationSteps[stepIndex].status = "in-progress"
    }
  }

  const handleSubmitVerification = async () => {
    // Simulate verification submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Update user verification status
    await updateProfile({ isVerified: true })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-600" />
      case "failed":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-green-200"
      case "in-progress":
        return "bg-blue-50 border-blue-200"
      case "failed":
        return "bg-red-50 border-red-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  if (user?.isVerified) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Shield className="h-5 w-5" />
            Identity Verified
          </CardTitle>
          <CardDescription className="text-green-700">
            Your identity has been successfully verified. You now have access to premium features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified Account
            </Badge>
            <Badge variant="outline">Verified on {new Date().toLocaleDateString()}</Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Identity Verification
            </CardTitle>
            <CardDescription>Verify your identity to build trust and unlock premium features</CardDescription>
          </div>
          <Badge variant="secondary">
            {completedSteps}/{totalSteps} completed
          </Badge>
        </div>
        <Progress value={progressPercentage} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Benefits */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Benefits of verification:</strong> Higher trust score, access to premium tasks, faster payments, and
            priority customer support.
          </AlertDescription>
        </Alert>

        {/* Verification Steps */}
        <div className="space-y-4">
          {verificationSteps.map((step, index) => (
            <Card
              key={step.id}
              className={`cursor-pointer transition-colors ${getStatusColor(step.status)}`}
              onClick={() => setCurrentStep(index)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  {getStatusIcon(step.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{step.title}</h3>
                      {step.required && step.status === "pending" && (
                        <Badge variant="outline" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>

                    {step.status === "in-progress" && (
                      <Badge variant="secondary" className="mt-2">
                        <Clock className="h-3 w-3 mr-1" />
                        Under Review (2-3 business days)
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Current Step Details */}
        {currentStep < verificationSteps.length && (
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">{verificationSteps[currentStep].title}</CardTitle>
              <CardDescription>{verificationSteps[currentStep].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Document Type</Label>
                    <Select
                      value={formData.documentType}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, documentType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="drivers-license">Driver's License</SelectItem>
                        <SelectItem value="national-id">National ID Card</SelectItem>
                        <SelectItem value="state-id">State ID Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Upload Document</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Drag and drop your document or click to browse</p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload("document", file)
                        }}
                        className="hidden"
                        id="document-upload"
                      />
                      <Button variant="outline" asChild>
                        <label htmlFor="document-upload" className="cursor-pointer">
                          Choose File
                        </label>
                      </Button>
                    </div>
                    {uploadedFiles.document && (
                      <p className="text-sm text-green-600">✓ {uploadedFiles.document.name} uploaded</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                        placeholder="As shown on ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                        placeholder="As shown on ID"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <Alert>
                    <Camera className="h-4 w-4" />
                    <AlertDescription>
                      Take a clear selfie while holding your ID document next to your face. Make sure both your face and
                      the ID are clearly visible.
                    </AlertDescription>
                  </Alert>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Take a selfie with your ID document</p>
                    <Button variant="outline">
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline">Save Progress</Button>
                  <Button
                    onClick={() => {
                      if (currentStep === verificationSteps.length - 1) {
                        handleSubmitVerification()
                      } else {
                        setCurrentStep(currentStep + 1)
                      }
                    }}
                  >
                    {currentStep === verificationSteps.length - 1 ? "Submit for Review" : "Next Step"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
