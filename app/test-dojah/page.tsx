"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DojahSdkModal } from "@/components/dojah-sdk-modal"

export default function TestDojahPage() {
  const [showModal, setShowModal] = useState(false)

  const handleSuccess = (result: any) => {
    console.log("✅ Dojah verification successful:", result)
    alert("Verification completed successfully! Check console for details.")
  }

  const handleError = (error: any) => {
    console.error("❌ Dojah verification failed:", error)
    alert("Verification failed. Check console for details.")
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Dojah Integration Test</h1>
      <p className="text-gray-600 mb-8">
        This page tests the Dojah verification integration with improved error handling and instance management.
      </p>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Test Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click the "Test Dojah Verification" button below</li>
            <li>The Dojah widget should open without JavaScript errors</li>
            <li>Complete the verification process</li>
            <li>Check the console for any error messages</li>
            <li>Verify that the response is handled correctly</li>
          </ol>
        </div>

        <div className="p-4 border rounded-lg bg-blue-50">
          <h3 className="font-semibold mb-2">Expected Behavior:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>No "dojahSpinnerHtml" errors in console</li>
            <li>No duplicate element warnings</li>
            <li>Clean widget initialization</li>
            <li>Proper cleanup when modal closes</li>
          </ul>
        </div>

        <div className="p-6 border rounded-lg bg-white">
          <h3 className="text-lg font-semibold mb-4">Dojah SDK Modal Test</h3>
          <p className="text-sm text-gray-600 mb-4">
            This tests the improved Dojah SDK modal with better error handling and instance management.
          </p>
          
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Test Dojah Verification
          </Button>
        </div>
      </div>

      <DojahSdkModal
        open={showModal}
        onOpenChange={setShowModal}
        onSuccess={handleSuccess}
        onClose={handleError}
        verificationType="identity"
      />
    </div>
  )
}
