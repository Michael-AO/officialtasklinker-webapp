"use client"

import { DialogFooter } from "@/components/ui/dialog"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, X, FileText, ImageIcon, File, ExternalLink, Plus, Trash2, Eye, Shield, Camera, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserAvatar } from "@/components/user-avatar"

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

interface ProfileCompletionWizardProps {
  onComplete?: () => void
  isExpanded?: boolean
}

// Placeholder import for DojahModal (to be implemented)
// import { DojahModal } from "@/components/dojah-modal"

// Optionally add a prop for triggering ID verification in the future
// export function ProfileCompletionWizard({ onComplete, onTriggerIDVerification }: ProfileCompletionWizardProps) { ... }

export function ProfileCompletionWizard({ onComplete, isExpanded: initialExpanded = false }: ProfileCompletionWizardProps = {}) {
  const { user, updateProfile, refreshPortfolio } = useAuth()
  const [isExpanded, setIsExpanded] = useState(initialExpanded)
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewItem, setPreviewItem] = useState<PortfolioItem | null>(null)
  const [showVerification, setShowVerification] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string>("")
  const [hasBeenCompleted, setHasBeenCompleted] = useState(false)

  // Check if profile has been completed before (stored in localStorage)
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.id) {
      const completedKey = `profile_completed_${user.id}`
      const wasCompleted = localStorage.getItem(completedKey)
      
      // Calculate current profile completion
      let completed = 0
      const total = 3 // Core profile sections (bio, skills, location)
      
      if (user.bio && user.bio.trim()) completed++
      if (user.skills && user.skills.length > 0) completed++
      if (user.location && user.location.trim()) completed++
      
      const currentProgress = Math.round((completed / total) * 100)
      
      // If user has 100% completion in database, mark as completed
      if (user.profile_completion === 100) {
        localStorage.setItem(completedKey, 'true')
        setHasBeenCompleted(true)
      }
      
      // If profile was marked as complete but is now incomplete, clear the flag
      if (wasCompleted === 'true' && currentProgress < 100) {
        localStorage.removeItem(completedKey)
        setHasBeenCompleted(false)
      } else if (wasCompleted === 'true' && currentProgress === 100) {
        setHasBeenCompleted(true)
      }
    }
  }, [user?.id, user?.bio, user?.skills, user?.location])

  // Initialize form data with user data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        bio: user.bio || "",
        skills: user.skills || [],
        location: user.location || "",
        portfolio: user.portfolio || [],
      })
      
      setPortfolioItems(
        user.portfolio?.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          fileUrl: item.image,
          url: item.url,
        })) || []
      )
    }
  }, [user])

  // Don't render if profile has been completed before
  if (hasBeenCompleted) {
    return null
  }

  const [formData, setFormData] = useState({
    bio: "",
    skills: [] as string[],
    location: "",
    portfolio: [] as any[],
  })

  const [newSkill, setNewSkill] = useState("")
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const profileImageInputRef = useRef<HTMLInputElement>(null)

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
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB. Please choose a smaller file.`,
          variant: "destructive",
        })
        return
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ]

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type.`,
          variant: "destructive",
        })
        return
      }

      // Create portfolio item with file
      const newItem: PortfolioItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: file.name.split(".")[0],
        description: "",
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        fileType: file.type,
        file: file,
      }

      setPortfolioItems((prev) => [...prev, newItem])
    })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB for profile images)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Profile image must be smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please choose a JPG, PNG, GIF, or WebP image.",
        variant: "destructive",
      })
      return
    }

    setProfileImage(file)
    setProfileImagePreview(URL.createObjectURL(file))
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
      location: !!formData.location.trim(),
      portfolio: portfolioItems.length > 0,
      verification: false, // Always false since it's disabled
    }
  }

  const completionStatus = calculateCompletionStatus()

  const calculateOverallProgress = () => {
    const totalSections = 3 // Core profile sections (bio, skills, location)
    let completedSections = 0
    
    if (formData.bio && formData.bio.trim()) completedSections++
    if (formData.skills && formData.skills.length > 0) completedSections++
    if (formData.location && formData.location.trim()) completedSections++
    
    return Math.round((completedSections / totalSections) * 100)
  }

  // Use stored profile completion if available, otherwise calculate
  const overallProgress = user?.profile_completion || calculateOverallProgress()
  const isProfileComplete = overallProgress === 100 || hasBeenCompleted

  const handleSave = async () => {
    setIsLoading(true)
    try {
      let avatarUrl = user?.avatar

      // Upload profile image if selected
      if (profileImage) {
        console.log("📤 Uploading profile image...")
        
        try {
          const formData = new FormData()
          formData.append("file", profileImage)

          const uploadResponse = await fetch("/api/upload/avatar", {
            method: "POST",
            headers: {
              "user-id": user?.id || "",
            },
            body: formData,
          })

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json()
            avatarUrl = uploadResult.data.url
            console.log("✅ Profile image uploaded:", avatarUrl)
          } else {
            const errorData = await uploadResponse.json()
            console.warn("⚠️ Avatar upload failed:", errorData.error)
            // Continue without avatar - don't fail the entire profile update
            toast({
              title: "Avatar Upload Warning",
              description: "Profile image upload failed, but profile was updated successfully.",
              variant: "default",
            })
          }
        } catch (uploadError) {
          console.warn("⚠️ Avatar upload error:", uploadError)
          // Continue without avatar - don't fail the entire profile update
          toast({
            title: "Avatar Upload Warning",
            description: "Profile image upload failed, but profile was updated successfully.",
            variant: "default",
          })
        }
      }

      // Save portfolio items to database
      console.log("📁 Saving portfolio items to database...")
      const portfolioPromises = portfolioItems.map(async (item) => {
        let fileUrl = item.fileUrl || item.url

        // Upload file to storage if it exists
        if (item.file) {
          console.log("📤 Uploading portfolio file:", item.fileName)
          
          try {
            const formData = new FormData()
            formData.append("file", item.file)

            const uploadResponse = await fetch("/api/upload/portfolio", {
              method: "POST",
              headers: {
                "user-id": user?.id || "",
              },
              body: formData,
            })

            if (uploadResponse.ok) {
              const uploadResult = await uploadResponse.json()
              fileUrl = uploadResult.data.url
              console.log("✅ Portfolio file uploaded:", fileUrl)
            } else {
              console.warn("⚠️ Portfolio file upload failed, using placeholder")
              fileUrl = "/placeholder.svg?height=200&width=300"
            }
          } catch (uploadError) {
            console.warn("⚠️ Portfolio file upload error:", uploadError)
            fileUrl = "/placeholder.svg?height=200&width=300"
          }
        }

        const portfolioData = {
          title: item.title,
          description: item.description,
          image: fileUrl,
          url: item.url,
          file_url: fileUrl,
          file_type: item.fileType,
          file_name: item.fileName,
          file_size: item.file?.size || 0,
        }

        const response = await fetch("/api/user/portfolio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user?.id || "",
          },
          body: JSON.stringify(portfolioData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`Failed to save portfolio item: ${errorData.error}`)
        }

        return response.json()
      })

      await Promise.all(portfolioPromises)
      console.log("✅ Portfolio items saved to database")

      // Update profile with new avatar URL
      await updateProfile({
        bio: formData.bio,
        skills: formData.skills,
        location: formData.location,
        avatar: avatarUrl,
      })

      await refreshPortfolio()

      // Check if profile is now complete and mark it as completed in localStorage
      const finalProgress = calculateOverallProgress()
      if (finalProgress === 100) {
        const completedKey = `profile_completed_${user?.id}`
        localStorage.setItem(completedKey, 'true')
        setHasBeenCompleted(true)
        
        toast({
          title: "Profile Complete! 🎉",
          description: "Your profile is now 100% complete and will no longer show the setup wizard.",
        })
      } else {
        toast({
          title: "Profile Updated!",
          description: "Your profile has been successfully updated.",
        })
      }
      
      // Always call onComplete callback to refresh parent component
      if (onComplete) {
        onComplete()
      }
      setIsExpanded(false)
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setIsDismissed(true)
  }

  // If profile is complete and dismissed, don't show anything
  if (isProfileComplete && isDismissed) {
    return null
  }

  // If profile is complete, show congratulations message
  if (isProfileComplete) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-green-800">Congratulations! Profile is Complete</CardTitle>
                <CardDescription className="text-green-700">
                  Your profile is 100% complete and ready to attract clients
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={handleClose} size="sm">
              Close
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
            {/* Profile Picture Section */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Profile Picture</h3>
              <p className="text-muted-foreground">Add a professional photo to build trust with clients</p>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <UserAvatar 
                    user={{
                      id: user?.id || "",
                      name: user?.name,
                      avatar: profileImagePreview || user?.avatar
                    }}
                    className="h-20 w-20"
                    fallbackClassName="text-lg"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={() => profileImageInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => profileImageInputRef.current?.click()}
                  >
                    Upload Photo
                  </Button>
                  <p className="text-sm text-muted-foreground">JPG, PNG, GIF or WebP. Max size 5MB.</p>
                </div>
                <input
                  ref={profileImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="hidden"
                />
              </div>

              {/* Bio Section - moved here */}
              <div className="space-y-2">
                <Label htmlFor="bio">About Me</Label>
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

              {/* Skills Section - moved here */}
              <div className="space-y-4">
                <Label>Skills & Expertise</Label>
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

            {/* Location Section */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Location</h3>
              <p className="text-muted-foreground">Set your location</p>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                />
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
                <div className="space-y-4">
                  <h4 className="font-semibold">Uploaded Items</h4>
                  {portfolioItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getFileIcon(item.fileType)}
                          <div>
                            <h5 className="font-medium">{item.title}</h5>
                            <p className="text-sm text-muted-foreground">{item.fileName}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPreviewItem(item)
                              setShowPreview(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPortfolioItems((prev) => prev.filter((i) => i.id !== item.id))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Input
                        placeholder="Add a title for this work sample..."
                        value={item.title}
                        onChange={(e) =>
                          setPortfolioItems((prev) =>
                            prev.map((i) => (i.id === item.id ? { ...i, title: e.target.value } : i)),
                          )
                        }
                      />
                      <Textarea
                        placeholder="Describe this work sample..."
                        value={item.description}
                        onChange={(e) =>
                          setPortfolioItems((prev) =>
                            prev.map((i) => (i.id === item.id ? { ...i, description: e.target.value } : i)),
                          )
                        }
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewItem?.title}</DialogTitle>
            <DialogDescription>{previewItem?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {previewItem?.fileType?.startsWith("image/") ? (
              <img
                src={previewItem.fileUrl || "/placeholder.svg"}
                alt={previewItem.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center h-64 border rounded-lg">
                <div className="text-center">
                  {getFileIcon(previewItem?.fileType)}
                  <p className="mt-2 font-medium">{previewItem?.fileName}</p>
                  <p className="text-sm text-muted-foreground">Preview not available</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
