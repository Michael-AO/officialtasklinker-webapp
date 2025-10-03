"use client"

import type React from "react"
import { supabase } from "@/lib/supabase"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, RefreshCw, CheckCircle, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [resendCooldown, setResendCooldown] = useState(0)
  const [otp, setOtp] = useState("")

  // Get email from URL params
  const [userEmail, setUserEmail] = useState<string>("")

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const emailFromUrl = urlParams.get("email")
    if (emailFromUrl) {
      setUserEmail(emailFromUrl)
    }
  }, [])

  const { user, updateProfile } = useAuth()
  const router = useRouter()

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Check if user is already verified
  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (user?.email) {
        try {
          const { data: userData, error } = await supabase
            .from("users")
            .select("is_verified")
            .eq("email", user.email)
            .single()

          if (!error && userData?.is_verified) {
            setIsVerified(true)
            setTimeout(() => {
              router.push("/dashboard")
            }, 2000)
          }
        } catch (err) {
          console.error("Error checking verification status:", err)
        }
      }
    }

    checkVerificationStatus()
  }, [user, router])

  const handleResendEmail = async () => {
    setIsResending(true)
    setErrors({})

    try {
      const email = user?.email || userEmail

      if (!email) {
        throw new Error("Email address is missing.")
      }

      // Resend confirmation email via Supabase
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) throw error

      // Start cooldown and show success
      setResendCooldown(60) // 60 second cooldown
      setErrors({})

      // Show success message
      const successDiv = document.createElement("div")
      successDiv.className = "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50"
      successDiv.textContent = "Confirmation email sent!"
      document.body.appendChild(successDiv)

      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv)
        }
      }, 3000)
    } catch (err) {
      console.error("Error resending email:", err)
      setErrors({
        general: err instanceof Error ? err.message : "Failed to resend confirmation email",
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleCheckVerification = async () => {
    setIsLoading(true)
    setErrors({})

    try {
      const email = user?.email || userEmail

      if (!email) {
        throw new Error("Email address is missing.")
      }

      // Check if user is verified in our database
      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single()

      if (error || !userData) {
        throw new Error("User not found. Please try signing up again.")
      }

      if (userData.is_verified) {
        // Update auth context
        const fullName = `${userData.first_name || ""} ${userData.last_name || ""}`.trim()
        const userDataForContext = {
          id: userData.id,
          email: userData.email,
          name: fullName || userData.email.split("@")[0],
          userType: userData.user_type || "freelancer",
          avatar: userData.avatar_url || undefined,
          isVerified: true,
          joinDate: userData.created_at || new Date().toISOString(),
          completedTasks: userData.completed_tasks || 0,
          rating: userData.rating || 0,
          skills: userData.skills || [],
          bio: userData.bio || "",
          location: userData.location || undefined,
          hourlyRate: userData.hourly_rate || undefined,
          portfolio: [],
        }
        await updateProfile(userDataForContext)

        setIsVerified(true)
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        setErrors({
          general: "Email not yet verified. Please check your email and click the confirmation link.",
        })
      }
    } catch (err) {
      console.error("Verification check error:", err)
      setErrors({
        general: err instanceof Error ? err.message : "Failed to check verification status",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading if we don't have email from either source
  if (!user && !userEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Email Verified!</CardTitle>
            <CardDescription>Your email has been successfully verified. Redirecting to dashboard...</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin mx-auto h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo-icon.svg" alt="Tasklinkers Logo" className="h-10 w-10 md:h-12 md:w-12" />
            <span className="text-xl md:text-2xl font-bold">Tasklinkers</span>
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>Check your email and click the confirmation link</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Email Verification Instructions */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>Step 1:</strong> Check your email inbox for a confirmation email from Tasklinkers.</p>
                <p><strong>Step 2:</strong> Click the "Confirm Email" button or link in the email.</p>
                <p><strong>Step 3:</strong> Return here and click "I've Confirmed My Email" below.</p>
                <p className="text-xs mt-2">Can't find the email? Check your spam folder.</p>
              </div>
            </div>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {errors.general}
            </div>
          )}

          <div className="space-y-4">
            <Button 
              onClick={handleCheckVerification} 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  I've Confirmed My Email
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Didn't receive the email?</p>
              <Button
                variant="outline"
                onClick={handleResendEmail}
                disabled={isResending || resendCooldown > 0}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  "Resend Confirmation Email"
                )}
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Wrong email? </span>
              <Link href="/signup" className="text-blue-600 hover:underline">
                Go back to signup
              </Link>
            </div>
          </div>

          <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-xs text-green-800">
              <strong>Tip:</strong> After clicking the confirmation link in your email, you'll be automatically logged in and redirected to the dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
