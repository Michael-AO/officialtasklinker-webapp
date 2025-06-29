"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDays, MapPin, Star, Edit, Camera, ExternalLink, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { ProfileCompletionWizard } from "@/components/profile-completion-wizard"

interface UserProfile {
  id: string
  name: string
  email: string
  user_type: string
  avatar_url?: string
  bio?: string
  location?: string
  hourly_rate?: number
  skills: string[]
  rating: number
  completed_tasks: number
  total_earned: number
  join_date: string
  last_active: string
  is_verified: boolean
  phone?: string
  portfolio?: PortfolioItem[]
}

interface PortfolioItem {
  id: string
  title: string
  description: string
  image_url?: string
  project_url?: string
  created_at: string
}

interface Review {
  id: string
  rating: number
  comment: string
  project_title?: string
  created_at: string
  reviewer: {
    name: string
    avatar_url?: string
  }
}

interface ProfileStats {
  activeTasks: number
  pendingApplications: number
  completionRate: number
  responseTime: string
}

export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authUser?.id) {
      fetchProfileData()
    }
  }, [authUser?.id])

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
      } else {
        throw new Error(profileData.error || "Failed to load profile")
      }

      // Fetch optional data (reviews, stats) - don't fail if these don't work
      await Promise.allSettled([fetchReviewsData(), fetchStatsData()])
    } catch (err) {
      console.error("❌ Error fetching profile data:", err)
      setError(err instanceof Error ? err.message : "Failed to load profile data")
    } finally {
      setLoading(false)
    }
  }

  const fetchReviewsData = async () => {
    try {
      const reviewsResponse = await fetch(`/api/user/reviews`, {
        headers: { "x-user-id": authUser!.id },
      })
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json()
        if (reviewsData.success) {
          setReviews(reviewsData.data || [])
        }
      }
    } catch (err) {
      console.log("ℹ️ Reviews not available:", err)
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

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!profile) return 0

    let completed = 0
    const total = 5 // Total sections to complete

    if (profile.bio && profile.bio.trim()) completed++
    if (profile.skills && profile.skills.length > 0) completed++
    if (profile.location && profile.location.trim()) completed++
    if (profile.hourly_rate && profile.hourly_rate > 0) completed++
    if (profile.portfolio && profile.portfolio.length > 0) completed++

    return Math.round((completed / total) * 100)
  }

  const profileCompletion = calculateProfileCompletion()
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
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button asChild>
          <Link href="/dashboard/profile/edit">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Link>
        </Button>
      </div>

      {/* Profile Completion Wizard - Show if profile is incomplete */}
      {isProfileIncomplete && <ProfileCompletionWizard />}

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.name} />
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
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  {profile.is_verified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={
                      profileCompletion === 100 ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                    }
                  >
                    {profileCompletion}% Complete
                  </Badge>
                </div>
                <p className="text-muted-foreground capitalize">{profile.user_type}</p>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{profile.completed_tasks}</div>
                  <div className="text-sm text-muted-foreground">Tasks Completed</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-2xl font-bold">{profile.rating.toFixed(1)}</span>
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats?.completionRate ? `${stats.completionRate}%` : "N/A"}</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {profile.hourly_rate ? formatCurrency(profile.hourly_rate) : "Not Set"}
                  </div>
                  <div className="text-sm text-muted-foreground">Hourly Rate</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.skills.length > 0 ? (
                  profile.skills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No skills added yet</p>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  Joined {formatDate(profile.join_date)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="about" className="space-y-4">
        <TabsList>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio ({portfolio.length})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-4">
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
                  <Button asChild variant="outline">
                    <Link href="/dashboard/profile/edit">Add Bio</Link>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.skills.map((skill) => (
                    <div key={skill} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{skill}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No skills added yet</p>
                  <Button asChild variant="outline">
                    <Link href="/dashboard/profile/edit">Add Skills</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Earnings Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Earnings Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(profile.total_earned)}</div>
                  <div className="text-sm text-muted-foreground">Total Earned</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{stats?.activeTasks || 0}</div>
                  <div className="text-sm text-muted-foreground">Active Tasks</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{stats?.pendingApplications || 0}</div>
                  <div className="text-sm text-muted-foreground">Pending Applications</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          {portfolio.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {portfolio.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted">
                    <img
                      src={item.image_url || "/placeholder.svg?height=200&width=300"}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(item.created_at)}</p>
                      </div>
                      {item.project_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={item.project_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">No portfolio items yet</p>
                <Button asChild variant="outline">
                  <Link href="/dashboard/profile/edit">Add Portfolio Items</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={review.reviewer.avatar_url || "/placeholder.svg?height=40&width=40"} />
                        <AvatarFallback>{getInitials(review.reviewer.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{review.reviewer.name}</p>
                            {review.project_title && (
                              <p className="text-sm text-muted-foreground">{review.project_title}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm text-muted-foreground">{formatDate(review.created_at)}</span>
                          </div>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">No reviews yet</p>
                <p className="text-sm text-muted-foreground">
                  Complete some tasks to start receiving reviews from clients
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
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
