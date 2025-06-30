"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CallbackPageContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get token from URL parameters
        const token = searchParams.get("token")
        const type = searchParams.get("type")

        if (!token || type !== "signup") {
          setStatus("error")
          setMessage("Invalid confirmation link")
          return
        }

        // Verify the token with Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        })

        if (error) {
          console.error("Token verification error:", error)
          setStatus("error")
          setMessage("Invalid or expired confirmation link. Please try signing up again.")
          return
        }

        if (data.user) {
          // Mark user as verified in our database
          const { error: updateError } = await supabase
            .from("users")
            .update({
              is_verified: true,
              updated_at: new Date().toISOString(),
            })
            .eq("email", data.user.email)

          if (updateError) {
            console.error("Database update error:", updateError)
            // Don't fail the whole process if database update fails
            // The user is still confirmed in Supabase Auth
          }

          setStatus("success")
          setMessage("Email confirmed successfully! Redirecting to dashboard...")

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
        } else {
          setStatus("error")
          setMessage("Confirmation failed. Please try again.")
        }
      } catch (error) {
        console.error("Email confirmation error:", error)
        setStatus("error")
        setMessage("An unexpected error occurred. Please try again.")
      }
    }

    handleEmailConfirmation()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo-icon.svg" alt="Tasklinkers Logo" className="h-8 w-8" />
            <span className="text-xl font-bold">Tasklinkers</span>
          </div>
          
          {status === "loading" && (
            <>
              <div className="flex items-center justify-center mb-4">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <CardTitle className="text-2xl">Confirming Email...</CardTitle>
              <CardDescription>Please wait while we verify your email address</CardDescription>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">Email Confirmed!</CardTitle>
              <CardDescription>Your email has been successfully verified</CardDescription>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-600">Confirmation Failed</CardTitle>
              <CardDescription>We couldn't verify your email address</CardDescription>
            </>
          )}
        </CardHeader>
        
        <CardContent className="text-center">
          {status === "loading" && (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <p className="text-sm text-green-700">{message}</p>
              <div className="animate-spin mx-auto h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <p className="text-sm text-red-700">{message}</p>
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push("/signup")}
                  className="w-full"
                >
                  Try Signing Up Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="w-full"
                >
                  Go to Login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 