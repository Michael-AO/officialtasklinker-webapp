"use client"

import type React from "react"
import { supabase } from "@/lib/supabase"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Zap, User, Briefcase } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "@/contexts/auth-context"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "freelancer" as "freelancer" | "client",
    agreeToTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [otpSent, setOtpSent] = useState(false)
  const [signupCooldown, setSignupCooldown] = useState(0)

  const { login } = useAuth()
  const router = useRouter()

  // Cooldown timer for signup attempts
  useEffect(() => {
    if (signupCooldown > 0) {
      const timer = setTimeout(() => setSignupCooldown(signupCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [signupCooldown])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    // Check if we're in cooldown
    if (signupCooldown > 0) {
      setErrors({
        general: `Please wait ${signupCooldown} seconds before trying again.`
      })
      return
    }

    setIsLoading(true)
    setErrors({})

    console.log("Starting signup process...")

    try {
      // 1. Create user in Supabase (with default email confirmation enabled)
      console.log("Creating user in Supabase...")
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            user_type: formData.userType,
            // You can still store first/last name in metadata if you want
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      })

      if (authError) {
        console.error("Supabase auth error:", authError)
        if (authError.message?.includes("rate limit") || authError.message?.includes("429")) {
          setSignupCooldown(60)
          throw new Error("Too many signup attempts. Please wait 60 seconds and try again, or use a different email address.")
        }
        if (authError.message?.includes("already registered") || authError.message?.includes("already exists")) {
          throw new Error("An account with this email already exists. Please try signing in instead.")
        }
        throw authError
      }
      if (!authData.user) {
        throw new Error("Failed to create user account. Please try again.")
      }
      console.log("User created successfully:", authData.user.id)

      // 2. Create user record in the users table (only columns that exist)
      console.log("Creating user record in users table...")
      const fullName = `${formData.firstName} ${formData.lastName}`.trim()
      const { error: userCreateError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: authData.user.email!,
        name: fullName || authData.user.email!.split("@")[0],
        user_type: formData.userType,
        avatar_url: null,
        is_verified: false,
        phone: null,
        bio: null,
        location: null,
        hourly_rate: null,
        skills: [],
        rating: 0,
        completed_tasks: 0,
        total_earned: 0,
        join_date: authData.user.created_at || new Date().toISOString(),
        last_active: new Date().toISOString(),
        is_active: true,
        created_at: authData.user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      if (userCreateError) {
        console.error("❌ Error creating user record:", userCreateError)
        console.warn("User record creation failed, but auth user was created. User ID:", authData.user.id)
      } else {
        console.log("✅ User record created successfully")
      }

      // 3. Generate OTP for our custom verification
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      console.log("Generated OTP:", otp)

      // 4. Store OTP in database
      console.log("Storing OTP in database...")
      const { error: otpError } = await supabase.from("email_otps").insert({
        email: formData.email,
        otp: otp,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      })
      if (otpError) {
        console.error("OTP storage error:", otpError)
        throw new Error(`Failed to store verification code: ${otpError.message}`)
      }
      console.log("OTP stored successfully")

      // 5. Send custom OTP email via Brevo API
      console.log("Sending custom OTP email...")
      const emailResponse = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otp,
          type: "signup",
        }),
      })
      const emailResult = await emailResponse.json()
      console.log("Email API response:", emailResult)
      if (!emailResponse.ok) {
        console.error("Email sending failed:", emailResult)
        console.warn("Email sending failed, but OTP was stored. OTP:", otp)
      } else {
        console.log("Custom email sent successfully!")
      }

      // 6. Show success message and redirect
      setOtpSent(true)
      console.log("Redirecting to verify-email page...")
      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)
      }, 1500)
    } catch (error) {
      console.error("Signup error:", error)
      setErrors({
        general: error instanceof Error ? error.message : "Registration failed. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const isFormValid =
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.password.length >= 8 &&
    formData.password === formData.confirmPassword &&
    formData.agreeToTerms

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo-icon.svg" alt="Tasklinkers Logo" className="h-8 w-8" />
            <span className="text-xl font-bold">Tasklinkers</span>
          </div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Join thousands of freelancers and clients</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {errors.general}
              </div>
            )}
            {otpSent && (
              <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                Account created! Check your email for the verification code.
              </div>
            )}

            {/* User Type Selection */}
            <div className="space-y-3">
              <Label>I want to:</Label>
              <RadioGroup
                value={formData.userType}
                onValueChange={(value) => updateFormData("userType", value)}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="freelancer" id="freelancer" className="peer sr-only" />
                  <Label
                    htmlFor="freelancer"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <User className="mb-3 h-6 w-6" />
                    Find Work
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="client" id="client" className="peer sr-only" />
                  <Label
                    htmlFor="client"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Briefcase className="mb-3 h-6 w-6" />
                    Hire Talent
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => updateFormData("firstName", e.target.value)}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => updateFormData("lastName", e.target.value)}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => updateFormData("password", e.target.value)}
                  className={errors.password ? "border-red-500" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => updateFormData("agreeToTerms", checked)}
                className={errors.agreeToTerms ? "border-red-500" : ""}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {errors.agreeToTerms && <p className="text-sm text-red-600">{errors.agreeToTerms}</p>}

            <Button type="submit" className="w-full" disabled={isLoading || !isFormValid || signupCooldown > 0}>
              {isLoading ? "Creating account..." : signupCooldown > 0 ? `Wait ${signupCooldown}s...` : "Create account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
