"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { Sparkles, Clock, MapPin, Target, Zap, CheckCircle, Calendar, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { NairaIcon } from "@/components/naira-icon"
import { isVerifiedEmail } from "@/lib/utils"

interface SmartMatch {
  id: string
  title: string
  description: string
  budget: string
  budget_min: number
  budget_max: number
  client: string
  client_id: string
  client_email: string
  client_avatar: string
  clientRating: number
  postedDate: string
  matchScore: number
  matchReasons: string[]
  urgency: "low" | "medium" | "high"
  skills: string[]
  location: string
  applications_count: number
  views_count: number
  category: string
  deadline: string | null
}



export function SmartTaskMatching() {
  const { user } = useAuth()
  const router = useRouter()
  const [matches, setMatches] = useState<SmartMatch[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSmartMatches = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Fetch smart matches
        const matchesResponse = await fetch("/api/tasks/smart-matches", {
          credentials: "include",
        })

        if (!matchesResponse.ok) {
          throw new Error(`Failed to fetch matches: ${matchesResponse.status}`)
        }

        const matchesData = await matchesResponse.json()

        if (matchesData.success) {
          setMatches(matchesData.matches || [])
        } else {
          throw new Error(matchesData.error || "Failed to fetch matches")
        }


      } catch (error) {
        console.error("Error fetching smart matches:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch matches")
        setMatches([]) // Show empty state on error
      } finally {
        setIsLoading(false)
      }
    }

    fetchSmartMatches()
  }, [user])

  const handleViewDetails = (taskId: string) => {
    router.push(`/dashboard/browse/${taskId}`)
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-gray-600"
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(0)}K`
    } else {
      return `₦${amount.toLocaleString()}`
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} days ago`
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Smart Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-red-500" />
            Smart Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
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
              <Sparkles className="h-5 w-5 text-green-600" />
              Smart Matches for You
            </CardTitle>
            <CardDescription>Personalized task recommendations based on your skills</CardDescription>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            {matches.length} matches
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {matches.slice(0, 2).map((match) => (
          <Card key={match.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/browse/${match.id}`} className="hover:underline">
                      <CardTitle className="text-lg">{match.title}</CardTitle>
                    </Link>
                    {isVerifiedEmail(match.client_email) && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    <Badge variant="outline" className="text-xs">
                      {match.id.slice(0, 8).toUpperCase()}
                    </Badge>
                    {match.urgency === "high" && <Badge variant="destructive">Urgent</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <NairaIcon className="h-4 w-4" />
                      {formatCurrency(match.budget_max)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Flexible
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {match.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatTimeAgo(match.postedDate)}
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-2xl font-bold text-green-600">
                    75%
                  </div>
                  <div className="text-xs text-muted-foreground">Match Score</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{match.description}</p>

                <div className="flex flex-wrap gap-2">
                  {match.skills.slice(0, 4).map((skill) => (
                    <Badge
                      key={skill}
                      variant={user?.skills?.includes(skill) ? "default" : "outline"}
                      className={user?.skills?.includes(skill) ? "bg-green-100 text-green-800" : ""}
                    >
                      {skill}
                      {user?.skills?.includes(skill) && <Zap className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                  {match.skills.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{match.skills.length - 4} more
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={match.client_avatar} />
                        <AvatarFallback>
                          {match.client
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{match.client}</span>
                      {isVerifiedEmail(match.client_email) && (
                        <span className="text-xs text-muted-foreground">(Verified)</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {match.applications_count}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(match.id)}>
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      className="bg-black hover:bg-gray-800"
                      asChild
                    >
                      <Link href={`/dashboard/browse/${match.id}`}>Apply Now</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="pt-4 border-t">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard/browse">See More</Link>
          </Button>
        </div>

        {matches.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matches yet</h3>
            <p className="text-gray-600 mb-4">Complete your profile to get personalized task recommendations</p>
            <Button asChild>
              <Link href="/dashboard/profile/edit">Complete Profile</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
