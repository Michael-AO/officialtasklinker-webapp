'use client'

import { useState } from 'react'
import DojahVerification from '../../components/DojahVerification'

export default function VerificationTestPage() {
  const [verificationData, setVerificationData] = useState<any>(null)
  const [verificationError, setVerificationError] = useState<any>(null)

  const handleSuccess = (data: any) => {
    setVerificationData(data)
    setVerificationError(null)
    console.log('Verification successful!', data)
    // Here you can send the data to your backend
  }

  const handleError = (error: any) => {
    setVerificationError(error)
    console.error('Verification failed:', error)
  }

  const handleClose = () => {
    console.log('User closed the verification modal')
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Identity Verification Test</h1>
      
      {verificationData ? (
        <div className="bg-green-100 p-4 rounded">
          <h3 className="text-green-800 font-bold">✅ Verification Complete!</h3>
          <pre className="text-xs mt-2">{JSON.stringify(verificationData, null, 2)}</pre>
        </div>
      ) : (
        <DojahVerification 
          onSuccess={handleSuccess}
          onError={handleError}
          onClose={handleClose}
        />
      )}

      {verificationError && (
        <div className="bg-red-100 p-4 rounded mt-4">
          <h3 className="text-red-800 font-bold">❌ Verification Failed</h3>
          <p className="text-red-600">{verificationError.message}</p>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Environment Variables Status:</h3>
        <ul className="text-sm space-y-1">
          <li><strong>NEXT_PUBLIC_DOJAH_APP_ID:</strong> {process.env.NEXT_PUBLIC_DOJAH_APP_ID || "Not set"}</li>
          <li><strong>NEXT_PUBLIC_DOJAH_PUBLIC_KEY:</strong> {process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY ? `${process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY.substring(0, 10)}...` : "Not set"}</li>
          <li><strong>NEXT_PUBLIC_DOJAH_ENVIRONMENT:</strong> {process.env.NEXT_PUBLIC_DOJAH_ENVIRONMENT || "Not set"}</li>
        </ul>
      </div>
    </div>
  )
}
