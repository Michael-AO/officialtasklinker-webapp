"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying your email...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash fragment from URL (Supabase sends token in URL)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        if (type === 'recovery') {
          // Password recovery flow (if needed later)
          router.push('/reset-password')
          return
        }

        if (accessToken && refreshToken) {
          // Set the session from the tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error) {
            throw error
          }

          if (data.session) {
            setStatus('success')
            setMessage('Email verified successfully! Redirecting...')
            
            // Redirect to dashboard after a brief moment
            setTimeout(() => {
              router.push('/dashboard')
              router.refresh()
            }, 1500)
          } else {
            throw new Error('No session created')
          }
        } else {
          // No tokens in URL, check if we already have a session
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            router.push('/dashboard')
          } else {
            throw new Error('Invalid authentication link')
          }
        }
      } catch (error: any) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage(error.message || 'Failed to verify email. Please try again.')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {status === 'loading' && '🔄 Verifying Email'}
            {status === 'success' && '✅ Email Verified'}
            {status === 'error' && '❌ Verification Failed'}
          </CardTitle>
          <CardDescription className="text-center">
            {message}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {status === 'loading' && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {status === 'error' && (
            <Alert variant="destructive">
              <AlertDescription>
                {message}
                <div className="mt-4">
                  <a 
                    href="/login" 
                    className="text-sm underline hover:no-underline"
                  >
                    Return to Login
                  </a>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {status === 'success' && (
            <div className="text-center py-4">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-green-600 font-medium">
                Welcome to TaskLinkers!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

