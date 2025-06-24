"use client"

import { DialogFooter } from "@/components/ui/dialog"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, X, FileText, ImageIcon, File, ExternalLink, Plus, Trash2, Eye, Shield } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PortfolioItem {
  id: string
  title: string
  description: string
  file?: File
  fileUrl?: string
  fileName?: string
  fileType?: string
  url?: string
}

interface CompletionStatus {
  bio: boolean
  skills: boolean
  location: boolean
  portfolio: boolean
  verification: boolean
}

export function ProfileCompletionWizard() {
  const { user, updateProfile } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewItem, setPreviewItem] = useState<PortfolioItem | null>(null)
  const [showVerification, setShowVerification] = useState(false)

  const [formData, setFormData] = useState({
    bio: user?.bio || "",
    skills: user?.skills || [],
    location: user?.location || "",
    hourlyRate: user?.hourlyRate || "",
    portfolio: user?.portfolio || [],
  })

  const [newSkill, setNewSkill] = useState("")
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(
    user?.portfolio?.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      fileUrl: item.image,
      url: item.url,
    })) || [],
  )

  const fileInputRef = useRef<HTMLInputElement>(null)

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB. Please choose a smaller file.`,
          variant: "destructive",
        })
        return
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type.`,
          variant: "destructive",
        })
        return
      }

      const newItem: PortfolioItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: file.name.split(".")[0],
        description: "",
        file,
        fileName: file.name,
        fileType: file.type,
      }

      setPortfolioItems((prev) => [...prev, newItem])
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const updatePortfolioItem = (id: string, updates: Partial<PortfolioItem>) => {
    setPortfolioItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const removePortfolioItem = (id: string) => {
    setPortfolioItems((prev) => prev.filter((item) => item.id !== id))
  }

  const previewFile = (item: PortfolioItem) => {
    setPreviewItem(item)
    setShowPreview(true)
  }

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="h-4 w-4" />
    if (fileType.startsWith("image/")) return <ImageIcon className="h-4 w-4" />
    if (fileType === "application/pdf") return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const calculateCompletionStatus = (): CompletionStatus => {
    return {
      bio: !!formData.bio.trim(),
      skills: formData.skills.length > 0,
      location: !!formData.location.trim() && !!formData.hourlyRate,
      portfolio: portfolioItems.length > 0,
      verification: false, // Always false since it's disabled
    }
  }

  const completionStatus = calculateCompletionStatus()

  const calculateOverallProgress = () => {
    const totalSections = 4 // Reduced from 5 since verification is disabled
    const completedSections = Object.values(completionStatus).filter(
      (status, index) => index < 4 && status, // Only count first 4 sections, skip verification
    ).length
    return Math.round((completedSections / totalSections) * 100)
  }

  const overallProgress = calculateOverallProgress()

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const portfolioForProfile = portfolioItems.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        image: item.fileUrl || `/placeholder.svg?height=200&width=300`,
        url: item.url,
      }))

      await updateProfile({
        bio: formData.bio,
        skills: formData.skills,
        location: formData.location,
        hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : undefined,
        portfolio: portfolioForProfile,
      })

      toast({
        title: "Profile Updated!",
        description: "Your profile has been successfully updated.",
      })
      setIsExpanded(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                {overallProgress}% complete - Fill in the details to build your professional profile
              </CardDescription>
            </div>
            <Button variant={isExpanded ? "outline" : "default"} onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? "Collapse" : "Continue Setup"}
            </Button>
          </div>
          <Progress value={overallProgress} className="mt-2" />
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-6">
            {/* Bio Section */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Professional Bio</h3>
              <p className="text-muted-foreground">Tell clients about your experience</p>
              <div className="space-y-2">
                <Label htmlFor="bio">Your Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="I'm a skilled professional with expertise in..."
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="resize-none"
                />
                <div className="text-sm text-muted-foreground">{formData.bio.length}/500 characters</div>
              </div>
            </section>

            {/* Skills Section */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Skills & Expertise</h3>
              <p className="text-muted-foreground">Add skills that match the work you want to do</p>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill (e.g., React, Design, Writing)..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                    </Badge>
                  ))}
                </div>
                {formData.skills.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">Add your first skill to get started</div>
                )}
              </div>
            </section>

            {/* Location & Rates Section */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Location & Rates</h3>
              <p className="text-muted-foreground">Set your location and hourly rate</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    placeholder="50"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, hourlyRate: e.target.value }))}
                  />
                </div>
              </div>
            </section>

            {/* Portfolio Section */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Portfolio</h3>
              <p className="text-muted-foreground">Showcase your work samples</p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Upload your work samples</p>
                <p className="text-sm text-muted-foreground mb-4">Images, PDFs, or documents (Max 10MB each)</p>
                <Button onClick={() => fileInputRef.current?.click()}>Choose Files</Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {portfolioItems.length > 0 && (
                <div className="space-y-3">
                  {portfolioItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getFileIcon(item.fileType)}
                          <span className="font-medium">{item.fileName || item.title}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" variant="ghost" size="sm" onClick={() => previewFile(item)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removePortfolioItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Project title..."
                          value={item.title}
                          onChange={(e) => updatePortfolioItem(item.id, { title: e.target.value })}
                        />
                        <Input
                          placeholder="Project URL (optional)"
                          value={item.url || ""}
                          onChange={(e) => updatePortfolioItem(item.id, { url: e.target.value })}
                        />
                      </div>
                      <Textarea
                        placeholder="Describe this project..."
                        value={item.description}
                        onChange={(e) => updatePortfolioItem(item.id, { description: e.target.value })}
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Identity Verification Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">Identity Verification</h3>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Coming Soon
                </Badge>
              </div>
              <p className="text-muted-foreground">Verify your identity to build trust and unlock premium features</p>

              <Card className="border-gray-200 bg-gray-50/50 opacity-75">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-gray-100">
                        <Shield className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-600">Identity Verification</h4>
                        <p className="text-sm text-muted-foreground">
                          Upload government ID and complete verification process
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button disabled className="cursor-not-allowed">
                        Coming Soon
                      </Button>
                    </div>
                  </div>

                  <Alert className="mt-4 border-blue-200 bg-blue-50/50">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Identity verification is coming soon!</strong> We're working on implementing a secure
                      verification system. In the meantime, you can complete other sections of your profile.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </section>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* File Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{previewItem?.title}</DialogTitle>
            <DialogDescription>{previewItem?.description}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {previewItem?.file && previewItem.fileType?.startsWith("image/") && (
              <div className="flex justify-center">
                <img
                  src={URL.createObjectURL(previewItem.file) || "/placeholder.svg"}
                  alt={previewItem.title}
                  className="max-w-full max-h-96 object-contain rounded-lg"
                />
              </div>
            )}
            {previewItem?.fileUrl && (
              <div className="flex justify-center">
                <img
                  src={previewItem.fileUrl || "/placeholder.svg"}
                  alt={previewItem.title}
                  className="max-w-full max-h-96 object-contain rounded-lg"
                />
              </div>
            )}
            {previewItem?.file && !previewItem.fileType?.startsWith("image/") && (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">{previewItem.fileName}</p>
                <p className="text-sm text-muted-foreground">
                  {previewItem.fileType} • {(previewItem.file.size / 1024 / 1024).toFixed(1)}MB
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            {previewItem?.url && (
              <Button variant="outline" asChild>
                <a href={previewItem.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Project
                </a>
              </Button>
            )}
            <Button onClick={() => setShowPreview(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
