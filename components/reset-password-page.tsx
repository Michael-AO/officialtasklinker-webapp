"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Zap, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    resetCode: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const router = useRouter()
  const searchParams = useSearchParams()

  // Safe email extraction with fallback
  const [email, setEmail] = useState("")

  // Handle client-side initialization
  useEffect(() => {
    if (typeof window !== "undefined") {
      const emailParam = searchParams.get("email") || ""
      setEmail(emailParam)

      // Redirect if no email parameter
      if (!emailParam) {
        router.push("/forgot-password")
      }
    }
  }, [searchParams, router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.resetCode.trim()) {
      newErrors.resetCode = "Reset code is required"
    } else if (formData.resetCode.length !== 6) {
      newErrors.resetCode = "Reset code must be 6 digits"
    } else if (!/^\d{6}$/.test(formData.resetCode)) {
      newErrors.resetCode = "Reset code must contain only numbers"
    }

    if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters"
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      // Simulate API call to reset password
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // For demo purposes, accept any 6-digit code
      if (formData.resetCode.length === 6) {
        setIsSuccess(true)

        // Redirect to login after success
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setErrors({ resetCode: "Invalid reset code. Please try again." })
      }
    } catch (err) {
      setErrors({ general: "Something went wrong. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const updateResetCode = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, "").slice(0, 6)
    updateFormData("resetCode", numericValue)
  }

  const isFormValid =
    formData.resetCode.length === 6 &&
    formData.newPassword.length >= 8 &&
    formData.newPassword === formData.confirmPassword

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Password Reset Successful!</CardTitle>
            <CardDescription>
              Your password has been successfully reset. You can now sign in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="animate-pulse text-sm text-muted-foreground">Redirecting to login page...</div>
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
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
            <Zap className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">Tasklinkers</span>
          </div>
          <CardTitle className="text-2xl">Reset your password</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to <span className="font-medium text-foreground">{email}</span> and create a new
            password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {errors.general}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="resetCode">Reset Code</Label>
              <Input
                id="resetCode"
                type="text"
                placeholder="Enter 6-digit code"
                value={formData.resetCode}
                onChange={(e) => updateResetCode(e.target.value)}
                className={`text-center text-lg tracking-widest ${errors.resetCode ? "border-red-500" : ""}`}
                maxLength={6}
              />
              {errors.resetCode && <p className="text-sm text-red-600">{errors.resetCode}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Create a new password"
                  value={formData.newPassword}
                  onChange={(e) => updateFormData("newPassword", e.target.value)}
                  className={errors.newPassword ? "border-red-500" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.newPassword && <p className="text-sm text-red-600">{errors.newPassword}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
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

            <Button type="submit" className="w-full" disabled={isLoading || !isFormValid}>
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-800">
                <strong>Demo tip:</strong> Use any 6-digit number as the reset code
              </p>
            </div>

            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to forgot password
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
