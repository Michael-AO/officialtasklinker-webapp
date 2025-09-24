"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDays, MapPin, Edit, Camera, ExternalLink, AlertCircle, FileText, Download, Plus, Shield } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import { DojahModal } from "@/components/dojah-modal"

interface UserProfile {
  id: string
  name: string
  email: string
  user_type: string
  avatar_url?: string
  bio?: string
  location?: string
  skills: string[]
  rating: number
  completed_tasks: number
  total_earned: number
  join_date: string
  last_active: string
  is_verified: boolean
  phone?: string
  portfolio?: PortfolioItem[]
  profile_completion?: number
  verification_type?: string
}

interface PortfolioItem {
  id: string
  title: string
  description: string
  image_url?: string
  project_url?: string
  file_url?: string
  file_type?: string
  created_at: string
}

interface ProfileStats {
  activeTasks: number
  pendingApplications: number
  completionRate: number
  responseTime: string
}

export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [portfolioUploadModalOpen, setPortfolioUploadModalOpen] = useState(false)
  const [showProfileWizard, setShowProfileWizard] = useState(false)
  const [newPortfolioItem, setNewPortfolioItem] = useState<PortfolioItem>({
    id: "",
    title: "",
    description: "",
    image_url: "",
    project_url: "",
    file_url: "",
    file_type: "",
    created_at: new Date().toISOString(),
  })
  const [refreshKey, setRefreshKey] = useState(0)
  const [showDojahModal, setShowDojahModal] = useState(false)

  useEffect(() => {
    if (authUser?.id) {
      fetchProfileData()
    }
  }, [authUser?.id, authUser?.bio, authUser?.skills, authUser?.location, refreshKey])

  // Refresh portfolio data when user changes
  useEffect(() => {
    if (authUser?.id && portfolio.length === 0) {
      console.log("🔄 Auto-refreshing portfolio data for user:", authUser.id)
      fetchPortfolioData()
    }
  }, [authUser?.id, portfolio.length])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!authUser?.id) {
        throw new Error("User not authenticated")
      }

      console.log("🔍 Fetching profile for user:", authUser.id)

      // Fetch profile data with user ID in headers
      const profileResponse = await fetch(`/api/user/profile`, {
        method: "GET",
        headers: {
          "x-user-id": authUser.id,
          "Content-Type": "application/json",
        },
      })

      console.log("📡 Profile response status:", profileResponse.status)

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text()
        console.error("❌ Profile response error:", errorText)

        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: `HTTP ${profileResponse.status}: ${errorText}` }
        }

        throw new Error(errorData.error || `Failed to fetch profile: ${profileResponse.status}`)
      }

      const profileData = await profileResponse.json()
      console.log("📦 Profile data received:", profileData)

      if (profileData.success) {
        setProfile(profileData.data)
        // Set portfolio from profile data if available
        if (profileData.data.portfolio) {
          setPortfolio(profileData.data.portfolio)
        }
        console.log("✅ Profile set successfully")
        console.log("🔍 Profile data debug:", {
          bio: profileData.data.bio,
          skills: profileData.data.skills,
          location: profileData.data.location,
          bioLength: profileData.data.bio?.length || 0,
          skillsLength: profileData.data.skills?.length || 0
        })
      } else {
        throw new Error(profileData.error || "Failed to load profile")
      }

      // Fetch portfolio data separately to ensure it's always loaded
      await fetchPortfolioData()
      
      // Fetch optional data (reviews, stats) - don't fail if these don't work
      await Promise.allSettled([fetchStatsData()])
    } catch (err) {
      console.error("❌ Error fetching profile data:", err)
      setError(err instanceof Error ? err.message : "Failed to load profile data")
    } finally {
      setLoading(false)
    }
  }

  const fetchPortfolioData = async () => {
    try {
      console.log("🔍 Fetching portfolio for user:", authUser!.id)
      
      const portfolioResponse = await fetch(`/api/user/portfolio`, {
        method: "GET",
        headers: {
          "x-user-id": authUser!.id,
          "Content-Type": "application/json",
        },
      })

      if (portfolioResponse.ok) {
        const portfolioData = await portfolioResponse.json()
        if (portfolioData.success) {
          setPortfolio(portfolioData.data || [])
          console.log("✅ Portfolio loaded:", portfolioData.data?.length || 0, "items")
        } else {
          console.warn("⚠️ Portfolio fetch failed:", portfolioData.error)
        }
      } else {
        console.warn("⚠️ Portfolio response not ok:", portfolioResponse.status)
      }
    } catch (err) {
      console.error("❌ Error fetching portfolio:", err)
    }
  }

  const fetchStatsData = async () => {
    try {
      const statsResponse = await fetch(`/api/user/stats`, {
        headers: { "x-user-id": authUser!.id },
      })
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        if (statsData.success) {
          setStats(statsData.data)
        }
      }
    } catch (err) {
      console.log("ℹ️ Stats not available:", err)
    }
  }

  // Use stored profile completion or calculate fallback
  const profileCompletion = profile?.profile_completion || 0
  const isProfileIncomplete = profileCompletion < 100

  if (!authUser) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to view your profile.</AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    )
  }

  // Debug logging
  console.log("🔍 Profile page render debug:", {
    profile: profile ? {
      bio: profile.bio,
      skills: profile.skills,
      location: profile.location,
      bioLength: profile.bio?.length || 0,
      skillsLength: profile.skills?.length || 0
    } : null,
    authUser: authUser ? {
      bio: authUser.bio,
      skills: authUser.skills,
      location: authUser.location
    } : null
  })

  if (loading) {
    return <ProfileSkeleton />
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchProfileData}>Try Again</Button>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Profile not found. Please complete your profile setup.</AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/dashboard/profile/edit">Complete Profile</Link>
        </Button>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Profile header with avatar, name */}
      {profile && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-x-16 items-center md:items-center">
              {/* Avatar and Name Section */}
              <div className="flex flex-col items-center md:items-start">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar_url} alt={profile.name} />
                    <AvatarFallback className="text-lg">{getInitials(profile.name)}</AvatarFallback>
                  </Avatar>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    asChild
                  >
                    <Link href="/dashboard/profile/edit">
                      <Camera className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="mt-4 text-center md:text-left">
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <p className="text-muted-foreground capitalize">{profile.user_type}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Completion & ID Verification - Side by side, matching dashboard UI */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        {(() => {
          if (!profile) {
            // No profile, render two empty columns
            return <><div className="w-full md:w-1/2 flex-1" /><div className="w-full md:w-1/2 flex-1" /></>
          }
          let completed = 0
          const total = 3
          if (profile.bio && profile.bio.trim()) completed++
          if (profile.skills && profile.skills.length > 0) completed++
          if (profile.location && profile.location.trim()) completed++
          const profileCompletion = Math.round((completed / total) * 100)
          const isProfileIncomplete = profileCompletion < 100
          if (isProfileIncomplete) {
            // Profile incomplete: left = profile, right = ID verification (if not verified)
            return <>
              {!profile.is_verified && (
                <div className="w-full md:w-1/2 flex-1 flex">
                  <div className="border rounded-lg p-6 bg-white shadow flex flex-col justify-between min-h-[180px] w-full relative">
                    <div className="absolute top-4 right-4 text-muted-foreground">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">ID Verification</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {profile.user_type === "admin"
                          ? "As an admin, please verify your identity to access admin features."
                          : "Verify your identity to apply for jobs or post tasks."}
                      </p>
                      <Button className="w-full" onClick={() => setShowDojahModal(true)}>
                        Start ID Verification
                      </Button>
                    </div>
                    <DojahModal
                      open={showDojahModal}
                      onOpenChange={setShowDojahModal}
                      onSuccess={async (result) => {
                        let verificationType = profile.user_type === "admin" ? "admin" : "individual"
                        if (result?.data?.verification_type === "business" || result?.data?.type === "business") {
                          verificationType = "business"
                        }
                        // You may need to call your updateProfile logic here
                        await fetchProfileData() // or updateProfile({ is_verified: true, verification_type: verificationType })
                        toast({
                          title: "ID Verified!",
                          description: `Your identity has been verified as a ${verificationType}. You can now apply and post tasks.`,
                        })
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          } else {
            // Profile complete: left = ID verification (if not verified), right = empty
            if (!profile.is_verified) {
              return <>
                <div className="w-full md:w-1/2 flex-1 flex">
                  <div className="border rounded-lg p-6 bg-white shadow flex flex-col justify-between min-h-[180px] w-full relative">
                    <div className="absolute top-4 right-4 text-muted-foreground">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">ID Verification</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {profile.user_type === "admin"
                          ? "As an admin, please verify your identity to access admin features."
                          : "Verify your identity to apply for jobs or post tasks."}
                      </p>
                      <Button className="w-full" onClick={() => setShowDojahModal(true)}>
                        Start ID Verification
                      </Button>
                    </div>
                    <DojahModal
                      open={showDojahModal}
                      onOpenChange={setShowDojahModal}
                      onSuccess={async (result) => {
                        let verificationType = profile.user_type === "admin" ? "admin" : "individual"
                        if (result?.data?.verification_type === "business" || result?.data?.type === "business") {
                          verificationType = "business"
                        }
                        // You may need to call your updateProfile logic here
                        await fetchProfileData() // or updateProfile({ is_verified: true, verification_type: verificationType })
                        toast({
                          title: "ID Verified!",
                          description: `Your identity has been verified as a ${verificationType}. You can now apply and post tasks.`,
                        })
                      }}
                    />
                  </div>
                </div>
                <div className="w-full md:w-1/2 flex-1" />
              </>
            } else {
              // Both profile and ID are complete/verified: show two empty columns
              return <><div className="w-full md:w-1/2 flex-1" /><div className="w-full md:w-1/2 flex-1" /></>
            }
          }
        })()}
      </div>

      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button asChild>
          <Link href="/dashboard/profile/edit">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Link>
        </Button>
      </div>

      {/* Remove any extra/duplicate ProfileCompletionWizard below this point */}

      <Tabs defaultValue="about" className="space-y-4">
        <TabsList>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio ({portfolio.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">About</h3>
            <Button variant="outline" onClick={() => {
              setRefreshKey(prev => prev + 1)
              fetchProfileData()
            }}>
              Refresh Profile
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.bio ? (
                <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No bio added yet</p>
                  <Button variant="outline" onClick={() => setShowProfileWizard(true)}>
                    Add Bio
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No skills added yet</p>
                  <Button variant="outline" onClick={() => setShowProfileWizard(true)}>
                    Add Skills
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <span className="text-muted-foreground">{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Phone:</span>
                    <span className="text-muted-foreground">{profile.phone}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-muted-foreground">{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-muted-foreground">Joined {formatDate(profile.join_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Last Active:</span>
                  <span className="text-muted-foreground">{formatDate(profile.last_active)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Account Type:</span>
                  <span className="text-muted-foreground capitalize">{profile.user_type}</span>
                </div>
                {profile.is_verified && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Verified Account
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(profile.total_earned)}</div>
                  <div className="text-sm text-muted-foreground">Total Earned</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{profile.completed_tasks}</div>
                  <div className="text-sm text-muted-foreground">Tasks Completed</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{profile.rating.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{portfolio.length}</div>
                  <div className="text-sm text-muted-foreground">Portfolio Items</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Portfolio</h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchPortfolioData}>
                Refresh
              </Button>
              <Button onClick={() => setPortfolioUploadModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Portfolio Item
              </Button>
            </div>
          </div>
          
          {portfolio.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {portfolio.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : item.file_url ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">{item.file_type || 'Document'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-muted-foreground">No Preview</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(item.created_at)}</p>
                      </div>
                      <div className="flex gap-1">
                        {item.file_url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={item.file_url} target="_blank" rel="noopener noreferrer" download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {item.project_url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={item.project_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">No portfolio items yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your best work to showcase your skills and attract more clients
                </p>
                <Button onClick={() => setPortfolioUploadModalOpen(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Portfolio Items
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={portfolioUploadModalOpen} onOpenChange={setPortfolioUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Portfolio Item</DialogTitle>
            <DialogDescription>
              Share your best work with potential clients. You can add images, documents, or links.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newPortfolioItem.title}
                onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newPortfolioItem.description}
                onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image_url" className="text-right">
                Image URL (optional)
              </Label>
              <Input
                id="image_url"
                value={newPortfolioItem.image_url}
                onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, image_url: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project_url" className="text-right">
                Project URL (optional)
              </Label>
              <Input
                id="project_url"
                value={newPortfolioItem.project_url}
                onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, project_url: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file_upload" className="text-right">
                Upload File
              </Label>
              <div className="col-span-3">
                <Input
                  id="file_upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="col-span-3"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file_url" className="text-right">
                File URL (optional)
              </Label>
              <Input
                id="file_url"
                value={newPortfolioItem.file_url}
                onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, file_url: e.target.value })}
                className="col-span-3"
                placeholder="Or provide a direct URL to your file"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file_type" className="text-right">
                File Type (optional)
              </Label>
              <Input
                id="file_type"
                value={newPortfolioItem.file_type}
                onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, file_type: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <Button onClick={handleAddPortfolioItem}>Add Portfolio Item</Button>
        </DialogContent>
      </Dialog>

      {/* Profile Completion Wizard Dialog */}
      <Dialog open={showProfileWizard} onOpenChange={setShowProfileWizard}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              Add your bio, skills, and other details to complete your profile
            </DialogDescription>
          </DialogHeader>
          <ProfileCompletionWizard 
            isExpanded={true}
            onComplete={() => {
              setShowProfileWizard(false)
              // Refresh profile data after completion
              fetchProfileData()
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  )

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        })
        return
      }

      // Set file type
      const fileType = file.type || file.name.split('.').pop()?.toUpperCase()
      setNewPortfolioItem(prev => ({ 
        ...prev, 
        file_type: fileType || 'Unknown',
        file_url: URL.createObjectURL(file) // Temporary URL for preview
      }))
    }
  }

  async function handleAddPortfolioItem() {
    if (!authUser?.id) {
      console.error("User not authenticated, cannot add portfolio item.")
      return
    }

    try {
      const { title, description, image_url, project_url, file_url, file_type } = newPortfolioItem

      if (!title) {
        toast({
          title: "Title is required",
          description: "Please enter a title for your portfolio item.",
          variant: "destructive",
        })
        return
      }

      const newItem: PortfolioItem = {
        id: "", // Will be generated by the backend
        title,
        description,
        image_url,
        project_url,
        file_url,
        file_type,
        created_at: new Date().toISOString(),
      }

      const response = await fetch(`/api/user/portfolio`, {
        method: "POST",
        headers: {
          "x-user-id": authUser.id,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast({
            title: "Portfolio item added",
            description: `Portfolio item "${title}" added successfully.`,
          })
          setPortfolio([...portfolio, data.data])
          setNewPortfolioItem({
            id: "",
            title: "",
            description: "",
            image_url: "",
            project_url: "",
            file_url: "",
            file_type: "",
            created_at: new Date().toISOString(),
          })
          setPortfolioUploadModalOpen(false)
        } else {
          toast({
            title: "Failed to add portfolio item",
            description: data.error || "Failed to add portfolio item.",
            variant: "destructive",
          })
        }
      } else {
        const errorText = await response.text()
        console.error("❌ Failed to add portfolio item:", errorText)
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: `HTTP ${response.status}: ${errorText}` }
        }
        toast({
          title: "Failed to add portfolio item",
          description: errorData.error || `Failed to add portfolio item: ${response.status}`,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("❌ Error adding portfolio item:", err)
      toast({
        title: "Failed to add portfolio item",
        description: err instanceof Error ? err.message : "Failed to add portfolio item.",
        variant: "destructive",
      })
    }
  }
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-16" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
