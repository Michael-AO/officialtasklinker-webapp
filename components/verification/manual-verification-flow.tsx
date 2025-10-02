"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Camera,
  FileText,
  Shield,
  Clock,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { DOCUMENT_TYPES, DocumentRequirement, VerificationDocument, manualVerificationService } from "@/lib/services/manual-verification.service"

interface ManualVerificationFlowProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function ManualVerificationFlow({ onSuccess, onCancel }: ManualVerificationFlowProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [documentType, setDocumentType] = useState<string>("")
  const [documents, setDocuments] = useState<{ [key: string]: File | null }>({})
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string }>({})
  
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const selectedDocument = DOCUMENT_TYPES.find(doc => doc.type === documentType)

  const handleDocumentTypeChange = (value: string) => {
    setDocumentType(value)
    setDocuments({})
    setPreviewUrls({})
  }

  const handleFileUpload = (imageType: 'front' | 'back' | 'selfie', file: File | null) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setDocuments(prev => ({ ...prev, [imageType]: file }))

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrls(prev => ({ ...prev, [imageType]: url }))
  }

  const removeDocument = (imageType: 'front' | 'back' | 'selfie') => {
    setDocuments(prev => {
      const newDocs = { ...prev }
      delete newDocs[imageType]
      return newDocs
    })

    setPreviewUrls(prev => {
      const newUrls = { ...prev }
      if (newUrls[imageType]) {
        URL.revokeObjectURL(newUrls[imageType])
        delete newUrls[imageType]
      }
      return newUrls
    })
  }

  const canProceedToNext = () => {
    if (currentStep === 1) return documentType !== ""
    if (currentStep === 2) {
      if (!selectedDocument) return false
      return selectedDocument.required_images.every(img => documents[img])
    }
    return true
  }

  const handleSubmit = async () => {
    if (!user || !selectedDocument) return

    setIsSubmitting(true)
    try {
      const verificationDocs: VerificationDocument[] = []
      
      // Convert files to verification documents
      selectedDocument.required_images.forEach(imageType => {
        const file = documents[imageType]
        if (file) {
          verificationDocs.push({
            type: imageType,
            file: file
          })
        }
      })

      await manualVerificationService.submitVerification(
        user.id,
        documentType,
        verificationDocs,
        additionalNotes
      )

      toast.success('Verification documents submitted successfully!')
      onSuccess?.()

    } catch (error) {
      console.error('❌ Verification submission error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit verification documents')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderDocumentTypeSelection = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Document Type</h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose the type of government-issued ID you want to submit for verification.
        </p>
      </div>

      <Select value={documentType} onValueChange={handleDocumentTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select document type..." />
        </SelectTrigger>
        <SelectContent>
          {DOCUMENT_TYPES.map((doc) => (
            <SelectItem key={doc.type} value={doc.type}>
              {doc.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedDocument && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">{selectedDocument.name}</CardTitle>
            <CardDescription>
              Required documents for {selectedDocument.name} verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-2">Requirements:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {selectedDocument.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-sm mb-2">Required Images:</h4>
              <div className="flex gap-2">
                {selectedDocument.required_images.map((img) => (
                  <Badge key={img} variant="outline" className="capitalize">
                    {img === 'selfie' ? 'Selfie with document' : `${img} side`}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderDocumentUpload = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload clear photos of your {selectedDocument?.name.toLowerCase()} as specified below.
        </p>
      </div>

      {selectedDocument?.required_images.map((imageType) => (
        <Card key={imageType} className="relative">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {imageType === 'selfie' ? <Camera className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              {imageType === 'selfie' ? 'Selfie with Document' : `${imageType.charAt(0).toUpperCase() + imageType.slice(1)} Side`}
            </CardTitle>
            <CardDescription>
              {imageType === 'selfie' 
                ? 'Take a selfie holding your document next to your face'
                : `Upload a clear photo of the ${imageType} side of your document`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {previewUrls[imageType] ? (
              <div className="space-y-3">
                <div className="relative">
                  <img 
                    src={previewUrls[imageType]} 
                    alt={`${imageType} document`}
                    className="w-full max-w-md h-48 object-cover rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeDocument(imageType)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Document uploaded successfully
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Click to upload or drag and drop
                </p>
                <Input
                  ref={(el) => fileInputRefs.current[imageType] = el}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    handleFileUpload(imageType, file)
                  }}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRefs.current[imageType]?.click()}
                >
                  Choose File
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Ensure all text is clearly readable and there are no glares or reflections. 
          Poor quality images will result in verification rejection.
        </AlertDescription>
      </Alert>
    </div>
  )

  const renderAdditionalNotes = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Additional Information (Optional)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Add any additional information that might help with verification.
        </p>
      </div>

      <Textarea
        placeholder="Any additional notes or information about your documents..."
        value={additionalNotes}
        onChange={(e) => setAdditionalNotes(e.target.value)}
        rows={4}
      />

      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <strong>Processing Time:</strong> AI verification typically takes 5-10 minutes. 
          You'll receive an email notification once your documents are reviewed.
        </AlertDescription>
      </Alert>
    </div>
  )

  const renderReview = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Review Your Submission</h3>
        <p className="text-sm text-gray-600 mb-4">
          Please review your documents before submitting for verification.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Document Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Document Type:</span>
            <span className="text-sm">{selectedDocument?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Documents Uploaded:</span>
            <span className="text-sm">{Object.keys(documents).length} files</span>
          </div>
          {additionalNotes && (
            <div>
              <span className="text-sm font-medium">Additional Notes:</span>
              <p className="text-sm text-gray-600 mt-1">{additionalNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security:</strong> Your documents are encrypted and stored securely. 
          They will be automatically deleted after 90 days for your privacy.
        </AlertDescription>
      </Alert>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              currentStep >= step 
                ? 'bg-[#04A466] border-[#04A466] text-white' 
                : 'border-gray-300 text-gray-500'
            }`}>
              {currentStep > step ? <CheckCircle className="h-4 w-4" /> : step}
            </div>
            {step < 4 && (
              <div className={`w-12 h-0.5 ml-2 ${
                currentStep > step ? 'bg-[#04A466]' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && renderDocumentTypeSelection()}
          {currentStep === 2 && renderDocumentUpload()}
          {currentStep === 3 && renderAdditionalNotes()}
          {currentStep === 4 && renderReview()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            if (currentStep === 1) {
              onCancel?.()
            } else {
              setCurrentStep(currentStep - 1)
            }
          }}
          disabled={isSubmitting}
        >
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </Button>

        {currentStep < 4 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceedToNext() || isSubmitting}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#04A466] hover:bg-[#04A466]/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Submit for Verification
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
