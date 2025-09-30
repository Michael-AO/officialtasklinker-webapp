'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function VerificationTestPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the manual verification page since Dojah has been removed
    router.push('/dashboard/verification')
  }, [router])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Verification Test</h1>
      <div className="bg-blue-100 p-4 rounded">
        <h3 className="text-blue-800 font-bold">ℹ️ Redirecting to Manual Verification</h3>
        <p className="text-blue-600 mt-2">
          Dojah integration has been removed. You will be redirected to the manual verification page.
        </p>
      </div>
    </div>
  )
}
