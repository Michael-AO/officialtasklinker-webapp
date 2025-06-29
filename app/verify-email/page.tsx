"use client"

import type React from "react"
import { supabase } from "@/lib/supabase"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Zap, Mail, RefreshCw, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"

export default function VerifyEmailPage() {
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [resendCooldown, setResendCooldown] = useState(0)

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

  // Redirect if user is already verified
  useEffect(() => {
    if (user && user.isVerified) {
      router.push("/dashboard")
    }
  }, [user, router])

  const validateCode = () => {
    const newErrors: Record<string, string> = {}

    if (!verificationCode.trim()) {
      newErrors.code = "Verification code is required"
    } else if (verificationCode.length !== 6) {
      newErrors.code = "Verification code must be 6 digits"
    } else if (!/^\d{6}$/.test(verificationCode)) {
      newErrors.code = "Verification code must contain only numbers"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleResendCode = async () => {
    setIsResending(true)
    setErrors({})

    try {
      // Get email from URL params or user context
      const email = user?.email || userEmail

      if (!email) {
        throw new Error("Email address is missing.")
      }

      // 1. Generate new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      console.log("DEV RESEND OTP:", otp) // For development testing

      // 2. Store new OTP in database
      const { error: otpError } = await supabase.from("email_otps").upsert({
        email: email,
        otp: otp,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      })

      if (otpError) throw otpError

      // 3. Send new OTP email via Brevo API
      const emailResponse = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          otp: otp,
          type: "resend",
        }),
      })

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json()
        throw new Error(errorData.error || "Failed to send verification email")
      }

      // 4. Start cooldown and show success
      setResendCooldown(60) // 60 second cooldown
      setErrors({})

      // Show success message
      const successDiv = document.createElement("div")
      successDiv.className = "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50"
      successDiv.textContent = "New verification code sent!"
      document.body.appendChild(successDiv)

      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv)
        }
      }, 3000)
    } catch (err) {
      console.error("Error resending OTP:", err)
      setErrors({
        general: err instanceof Error ? err.message : "Failed to resend OTP",
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateCode()) return

    setIsLoading(true)
    setErrors({})

    try {
      // Get email from URL params or user context
      const email = user?.email || userEmail

      if (!email) {
        throw new Error("Email address is missing.")
      }

      // 1. Verify OTP against database
      const { data: otpData, error: otpError } = await supabase
        .from("email_otps")
        .select("*")
        .eq("email", email)
        .eq("otp", verificationCode)
        .gt("expires_at", new Date().toISOString())
        .single()

      if (otpError || !otpData) {
        throw new Error("Invalid or expired verification code")
      }

      // 2. Delete used OTP
      await supabase.from("email_otps").delete().eq("email", email).eq("otp", verificationCode)

      // 3. Verify the OTP with Supabase (this will confirm the user)
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email: email,
        token: verificationCode,
        type: 'signup'
      })

      if (verifyError) {
        console.error("OTP verification error:", verifyError)
        throw new Error("Failed to verify OTP")
      }

      console.log("✅ OTP verified successfully:", verifyData)

      // 4. Create user record in the users table
      if (verifyData.user) {
        const fullName = `${verifyData.user.user_metadata?.first_name || ""} ${verifyData.user.user_metadata?.last_name || ""}`.trim()
        
        console.log("🔍 Creating user record with name:", fullName)
        
        const { error: userCreateError } = await supabase
          .from("users")
          .upsert({
            id: verifyData.user.id,
            email: verifyData.user.email!,
            name: fullName || verifyData.user.email!.split("@")[0],
            user_type: (verifyData.user.user_metadata?.user_type as "freelancer" | "client") || "freelancer",
            avatar_url: verifyData.user.user_metadata?.avatar_url || null,
            is_verified: true,
            phone: verifyData.user.user_metadata?.phone || null,
            bio: null,
            location: null,
            hourly_rate: null,
            skills: [],
            rating: 0,
            completed_tasks: 0,
            total_earned: 0,
            join_date: verifyData.user.created_at || new Date().toISOString(),
            last_active: new Date().toISOString(),
            is_active: true,
            created_at: verifyData.user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (userCreateError) {
          console.error("❌ Error creating user record:", userCreateError)
          // Don't fail the verification if user record creation fails
          console.warn("User record creation failed, but verification continues")
        } else {
          console.log("✅ User record created successfully")
        }

        // Create user object for auth context
        const userData = {
          id: verifyData.user.id,
          email: verifyData.user.email!,
          name: fullName || verifyData.user.email!.split("@")[0],
          userType: (verifyData.user.user_metadata?.user_type as "freelancer" | "client") || "freelancer",
          avatar: verifyData.user.user_metadata?.avatar_url || undefined,
          isVerified: true,
          joinDate: new Date().toISOString(),
          completedTasks: 0,
          rating: 0,
          skills: [],
          bio: "",
          location: undefined,
          hourlyRate: undefined,
          portfolio: [],
        }

        // Update auth context with verified user
        await updateProfile(userData)
      }

      // 5. Show success and redirect
      setIsVerified(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      console.error("Verification error:", err)
      setErrors({
        general: err instanceof Error ? err.message : "Verification failed",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateVerificationCode = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, "").slice(0, 6)
    setVerificationCode(numericValue)

    if (errors.code) {
      setErrors((prev) => ({ ...prev, code: "" }))
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
            <img src="/logo-icon.svg" alt="Tasklinkers Logo" className="h-8 w-8" />
            <span className="text-xl font-bold">Tasklinkers</span>
          </div>
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>Enter the 6-digit code sent to your email</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            {errors.general && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {errors.general}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <div className="relative">
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => updateVerificationCode(e.target.value)}
                  className={`text-center text-lg tracking-widest ${errors.code ? "border-red-500" : ""}`}
                  maxLength={6}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || verificationCode.length !== 6}>
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Didn't receive the code?</p>
              <Button
                variant="outline"
                onClick={handleResendCode}
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
                  "Resend Code"
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

          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Check your email for the 6-digit verification code from Tasklinkers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
