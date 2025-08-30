"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  FileText, 
  Camera, 
  Building, 
  User, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

interface VerificationFormData {
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  phoneNumber: string
  address: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  businessInfo?: {
    businessName: string
    businessType: string
    registrationNumber: string
    taxId: string
    address: string
  }
}

interface DocumentUpload {
  id: string
  type: string
  file: File
  url?: string
  uploaded: boolean
}

export default function ManualVerificationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [verificationType, setVerificationType] = useState<"identity" | "business" | "professional">("identity")
  const [formData, setFormData] = useState<VerificationFormData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    phoneNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: ""
    }
  })
  const [documents, setDocuments] = useState<DocumentUpload[]>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const totalSteps = verificationType === "business" ? 4 : 3

  const requiredDocuments = {
    identity: [
      { type: "government_id", label: "Government ID", description: "Passport, National ID, or Driver's License" },
      { type: "selfie", label: "Selfie", description: "Clear photo of your face" }
    ],
    business: [
      { type: "business_license", label: "Business License", description: "Official business registration document" },
      { type: "government_id", label: "Government ID", description: "Passport, National ID, or Driver's License" },
      { type: "selfie", label: "Selfie", description: "Clear photo of your face" },
      { type: "utility_bill", label: "Utility Bill", description: "Recent utility bill for address verification" }
    ],
    professional: [
      { type: "government_id", label: "Government ID", description: "Passport, National ID, or Driver's License" },
      { type: "selfie", label: "Selfie", description: "Clear photo of your face" },
      { type: "professional_certificate", label: "Professional Certificate", description: "Relevant professional certification" }
    ]
  }

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Initialize documents based on verification type
    const docs = requiredDocuments[verificationType].map(doc => ({
      id: `${doc.type}-${Date.now()}-${Math.random()}`,
      type: doc.type,
      file: null as any,
      uploaded: false
    }))
    setDocuments(docs)
  }, [verificationType, user, router])

  const handleFileUpload = async (documentId: string, file: File) => {
    try {
      setUploadProgress(prev => ({ ...prev, [documentId]: 0 }))

      // Simulate file upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[documentId] || 0
          if (current >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return { ...prev, [documentId]: current + 10 }
        })
      }, 100)

      // Here you would actually upload to your storage service
      // For now, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 2000))

      clearInterval(progressInterval)
      setUploadProgress(prev => ({ ...prev, [documentId]: 100 }))

      // Update document with uploaded URL
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, file, url: URL.createObjectURL(file), uploaded: true }
          : doc
      ))

      toast.success("Document uploaded successfully")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload document")
    }
  }

  const handleSubmit = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Validate all documents are uploaded
      const unuploadedDocs = documents.filter(doc => !doc.uploaded)
      if (unuploadedDocs.length > 0) {
        toast.error("Please upload all required documents")
        return
      }

      // Prepare documents for submission
      const submissionDocs = documents.map(doc => ({
        id: doc.id,
        type: doc.type,
        url: doc.url || "",
        filename: doc.file?.name || "",
        size: doc.file?.size || 0,
        mimeType: doc.file?.type || "",
        uploadedAt: new Date().toISOString()
      }))

      // Submit verification request
      const response = await fetch("/api/verification/manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verificationType,
          documents: submissionDocs,
          verificationData: formData
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit verification")
      }

      toast.success("Verification submitted successfully! We'll review your documents within 24-48 hours.")
      router.push("/dashboard")
    } catch (error) {
      console.error("Submission error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to submit verification")
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return verificationType !== ""
      case 2:
        return formData.firstName && formData.lastName && formData.dateOfBirth && formData.nationality
      case 3:
        return verificationType === "business" ? 
          formData.businessInfo?.businessName && formData.businessInfo?.businessType :
          true
      case 4:
        return documents.every(doc => doc.uploaded)
      default:
        return false
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose Verification Type</h3>
        <p className="text-muted-foreground mb-6">
          Select the type of verification that best describes your needs.
        </p>
      </div>

      <div className="grid gap-4">
        <Card 
          className={`cursor-pointer transition-all ${
            verificationType === "identity" ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => setVerificationType("identity")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Individual Identity Verification
            </CardTitle>
            <CardDescription>
              For freelancers and individual clients. Verify your personal identity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Government ID (Passport, National ID, Driver's License)</li>
              <li>• Selfie verification</li>
              <li>• Basic personal information</li>
            </ul>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${
            verificationType === "business" ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => setVerificationType("business")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Business Verification
            </CardTitle>
            <CardDescription>
              For business clients and companies. Verify your business identity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Business registration documents</li>
              <li>• Government ID of business owner</li>
              <li>• Selfie verification</li>
              <li>• Business address verification</li>
            </ul>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${
            verificationType === "professional" ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => setVerificationType("professional")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Professional Verification
            </CardTitle>
            <CardDescription>
              For professionals with certifications. Verify your professional credentials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Government ID</li>
              <li>• Professional certifications</li>
              <li>• Selfie verification</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <p className="text-muted-foreground mb-6">
          Please provide your personal information for verification.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            placeholder="Enter your first name"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            placeholder="Enter your last name"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="nationality">Nationality *</Label>
          <Input
            id="nationality"
            value={formData.nationality}
            onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
            placeholder="Enter your nationality"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="phoneNumber">Phone Number *</Label>
        <Input
          id="phoneNumber"
          value={formData.phoneNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
          placeholder="Enter your phone number"
        />
      </div>

      <div>
        <Label>Address *</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <Input
            placeholder="Street Address"
            value={formData.address.street}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              address: { ...prev.address, street: e.target.value }
            }))}
          />
          <Input
            placeholder="City"
            value={formData.address.city}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              address: { ...prev.address, city: e.target.value }
            }))}
          />
          <Input
            placeholder="State/Province"
            value={formData.address.state}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              address: { ...prev.address, state: e.target.value }
            }))}
          />
          <Input
            placeholder="Country"
            value={formData.address.country}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              address: { ...prev.address, country: e.target.value }
            }))}
          />
          <Input
            placeholder="Postal Code"
            value={formData.address.postalCode}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              address: { ...prev.address, postalCode: e.target.value }
            }))}
          />
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      {verificationType === "business" ? (
        <>
          <div>
            <h3 className="text-lg font-semibold mb-4">Business Information</h3>
            <p className="text-muted-foreground mb-6">
              Please provide your business information for verification.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessInfo?.businessName || ""}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  businessInfo: { ...prev.businessInfo, businessName: e.target.value }
                }))}
                placeholder="Enter business name"
              />
            </div>
            <div>
              <Label htmlFor="businessType">Business Type *</Label>
              <Select
                value={formData.businessInfo?.businessType || ""}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  businessInfo: { ...prev.businessInfo, businessType: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corporation">Corporation</SelectItem>
                  <SelectItem value="llc">LLC</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                  <SelectItem value="nonprofit">Non-Profit</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="registrationNumber">Registration Number *</Label>
              <Input
                id="registrationNumber"
                value={formData.businessInfo?.registrationNumber || ""}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  businessInfo: { ...prev.businessInfo, registrationNumber: e.target.value }
                }))}
                placeholder="Enter registration number"
              />
            </div>
            <div>
              <Label htmlFor="taxId">Tax ID *</Label>
              <Input
                id="taxId"
                value={formData.businessInfo?.taxId || ""}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  businessInfo: { ...prev.businessInfo, taxId: e.target.value }
                }))}
                placeholder="Enter tax ID"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="businessAddress">Business Address *</Label>
            <Textarea
              id="businessAddress"
              value={formData.businessInfo?.address || ""}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                businessInfo: { ...prev.businessInfo, address: e.target.value }
              }))}
              placeholder="Enter complete business address"
              rows={3}
            />
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Personal Information Complete</h3>
          <p className="text-muted-foreground">
            Your personal information has been recorded. Next, we'll need to verify your documents.
          </p>
        </div>
      )}
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Document Upload</h3>
        <p className="text-muted-foreground mb-6">
          Please upload the required documents for verification. All documents must be clear and legible.
        </p>
      </div>

      <div className="space-y-4">
        {documents.map((doc) => {
          const docInfo = requiredDocuments[verificationType].find(d => d.type === doc.type)
          return (
            <Card key={doc.id} className={doc.uploaded ? "border-green-200 bg-green-50" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4" />
                      <h4 className="font-medium">{docInfo?.label}</h4>
                      {doc.uploaded && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {docInfo?.description}
                    </p>
                    
                    {doc.uploaded && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {doc.file?.name}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {(doc.file?.size / 1024 / 1024).toFixed(2)} MB
                        </Badge>
                      </div>
                    )}

                    {uploadProgress[doc.id] !== undefined && uploadProgress[doc.id] < 100 && (
                      <div className="mt-2">
                        <Progress value={uploadProgress[doc.id]} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Uploading... {uploadProgress[doc.id]}%
                        </p>
                      </div>
                    )}
                  </div>

                  {!doc.uploaded && (
                    <div>
                      <input
                        type="file"
                        id={`file-${doc.id}`}
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleFileUpload(doc.id, file)
                          }
                        }}
                      />
                      <Label htmlFor={`file-${doc.id}`}>
                        <Button variant="outline" size="sm" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </span>
                        </Button>
                      </Label>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> All documents must be:
          <ul className="mt-2 space-y-1">
            <li>• Clear and legible</li>
            <li>• In JPG, PNG, or PDF format</li>
            <li>• Less than 10MB each</li>
            <li>• Current and not expired</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      case 4:
        return renderStep4()
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Manual Verification</h1>
        <p className="text-muted-foreground">
          Complete your verification by providing required documents and information.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-muted-foreground">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {renderCurrentStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep < totalSteps ? (
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceed()}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Verification
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
