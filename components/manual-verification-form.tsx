"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, User, Building, Camera, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface ManualVerificationFormProps {
  userType: "client" | "freelancer"
  onSuccess: () => void
  onError: (error: string) => void
}

interface FormData {
  phone: string
  address: string
  idType: string
  idNumber: string
  additionalInfo: string
}

interface FileUpload {
  file: File
  type: string
  preview: string
}

export function ManualVerificationForm({ userType, onSuccess, onError }: ManualVerificationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    phone: "",
    address: "",
    idType: "",
    idNumber: "",
    additionalInfo: ""
  })
  const [uploads, setUploads] = useState<FileUpload[]>([])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload only JPG, PNG, or PDF files")
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const preview = e.target?.result as string
      setUploads(prev => [...prev, { file, type, preview }])
    }
    reader.readAsDataURL(file)
  }

  const removeUpload = (index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      // Validate required fields
      const requiredFields = ['phone', 'address', 'idType', 'idNumber']

      for (const field of requiredFields) {
        if (!formData[field as keyof FormData]) {
          toast.error(`Please fill in all required fields`)
          return
        }
      }

      if (uploads.length === 0) {
        toast.error("Please upload at least one document")
        return
      }

      // Create FormData for file upload
      const submitData = new FormData()
      
      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value) submitData.append(key, value)
      })
      
      submitData.append('userType', userType)
      submitData.append('verificationType', 'identity') // Always use identity verification

      // Add files
      uploads.forEach((upload, index) => {
        submitData.append(`document_${index}`, upload.file)
        submitData.append(`document_type_${index}`, upload.type)
      })

      const response = await fetch('/api/verification/manual-submit', {
        method: 'POST',
        body: submitData
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success("Verification request submitted successfully!")
        onSuccess()
      } else {
        throw new Error(result.error || "Failed to submit verification request")
      }
    } catch (error) {
      console.error("Verification submission error:", error)
      onError(error instanceof Error ? error.message : "Failed to submit verification request")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Manual Verification
          </CardTitle>
          <CardDescription>
            Submit your documents for manual verification review
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Manual Verification Process:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Submit required documents and information</li>
                <li>• Our team will review your submission within 30 minutes</li>
                <li>• You'll receive a notification once approved</li>
                <li>• All platform features will be unlocked upon approval</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <Button onClick={() => setShowForm(true)} className="w-full">
            Begin Manual Verification
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Manual Verification Form
        </CardTitle>
        <CardDescription>
          Complete the form below to submit your verification request
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your address"
                required
              />
            </div>
          </div>
        </div>


        {/* Identity Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Identity Verification</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="idType">ID Type *</Label>
              <Select value={formData.idType} onValueChange={(value) => handleInputChange('idType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="national-id">National ID</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="drivers-license">Driver's License</SelectItem>
                  <SelectItem value="voters-card">Voter's Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="idNumber">ID Number *</Label>
              <Input
                id="idNumber"
                value={formData.idNumber}
                onChange={(e) => handleInputChange('idNumber', e.target.value)}
                placeholder="Enter ID number"
                required
              />
            </div>
          </div>
        </div>

        {/* Document Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Document Upload</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Government ID (Front) *</Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, 'government-id-front')}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
            <div>
              <Label>Government ID (Back)</Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, 'government-id-back')}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
            {userType === "client" && (
              <>
                <div>
                  <Label>Business Registration Document</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e, 'business-registration')}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>
                <div>
                  <Label>Proof of Address</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e, 'proof-of-address')}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:rounded-full file:border-0 file:px-4 file:py-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Uploaded Files Preview */}
          {uploads.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Documents</Label>
              <div className="space-y-2">
                {uploads.map((upload, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{upload.file.name}</span>
                      <span className="text-xs text-gray-500">({upload.type})</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeUpload(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Additional Information</h3>
          <div>
            <Label htmlFor="additionalInfo">Additional Notes (Optional)</Label>
            <Textarea
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
              placeholder="Any additional information you'd like to provide..."
              rows={3}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowForm(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Submitting..." : "Complete Verification"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
