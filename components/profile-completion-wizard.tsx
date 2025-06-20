"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, X, FileText, ImageIcon, File, ExternalLink, Plus, Trash2, Eye } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

export function ProfileCompletionWizard() {
  const { user, updateProfile } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewItem, setPreviewItem] = useState<PortfolioItem | null>(null)

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

  // Calculate completion percentage
  const calculateCompletion = () => {
    let completed = 0
    const total = 5 // bio, skills, location, hourlyRate, portfolio

    if (formData.bio.trim()) completed++
    if (formData.skills.length > 0) completed++
    if (formData.location.trim()) completed++
    if (formData.hourlyRate) completed++
    if (portfolioItems.length > 0) completed++

    return Math.round((completed / total) * 100)
  }

  const completion = calculateCompletion()

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
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB. Please choose a smaller file.`,
          variant: "destructive",
        })
        return
      }

      // Check file type
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
          description: `${file.name} is not a supported file type. Please upload images, PDFs, or Word documents.`,
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

    // Reset file input
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

  const handleSave = async () => {
    setIsLoading(true)

    try {
      // Simulate file upload and processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Convert portfolio items to the format expected by user profile
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
        description: "Your profile has been successfully updated with your portfolio items.",
      })

      setIsExpanded(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (completion === 100 && !isExpanded) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-green-800">Profile Complete! 🎉</CardTitle>
              <CardDescription className="text-green-600">
                Your profile is fully set up and ready to attract clients.
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => setIsExpanded(true)}>
              Edit Profile
            </Button>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>{completion}% complete - Add your details to attract more clients</CardDescription>
            </div>
            <Button variant={isExpanded ? "outline" : "default"} onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? "Collapse" : "Complete Profile"}
            </Button>
          </div>
          <Progress value={completion} className="mt-2" />
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-6">
            {/* Bio Section */}
            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell clients about your experience and expertise..."
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Skills Section */}
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Location and Rate */}
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  placeholder="50"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hourlyRate: e.target.value }))}
                />
              </div>
            </div>

            {/* Portfolio Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Portfolio & Attachments</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="text-sm text-muted-foreground">
                Upload images, PDFs, or documents to showcase your work. Max 10MB per file.
              </div>

              {portfolioItems.length > 0 && (
                <div className="space-y-3">
                  {portfolioItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getFileIcon(item.fileType)}
                          <span className="font-medium">{item.fileName || item.title}</span>
                          {item.file && (
                            <Badge variant="outline" className="text-xs">
                              {(item.file.size / 1024 / 1024).toFixed(1)}MB
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {(item.file || item.fileUrl) && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => previewFile(item)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button type="button" variant="ghost" size="sm" onClick={() => removePortfolioItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`title-${item.id}`}>Title</Label>
                          <Input
                            id={`title-${item.id}`}
                            placeholder="Project title..."
                            value={item.title}
                            onChange={(e) => updatePortfolioItem(item.id, { title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`url-${item.id}`}>Project URL (optional)</Label>
                          <Input
                            id={`url-${item.id}`}
                            placeholder="https://..."
                            value={item.url || ""}
                            onChange={(e) => updatePortfolioItem(item.id, { url: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`description-${item.id}`}>Description</Label>
                        <Textarea
                          id={`description-${item.id}`}
                          placeholder="Describe this project..."
                          value={item.description}
                          onChange={(e) => updatePortfolioItem(item.id, { description: e.target.value })}
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsExpanded(false)}>
                Cancel
              </Button>
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
