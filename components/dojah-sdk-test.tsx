"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DojahSdkModal } from "@/components/dojah-sdk-modal"

export function DojahSdkTest() {
  const [isOpen, setIsOpen] = useState(false)

  const handleSuccess = (result: any) => {
    console.log("✅ Dojah SDK verification successful:", result)
    setIsOpen(false)
  }

  const handleClose = () => {
    console.log("❌ Dojah SDK modal closed")
    setIsOpen(false)
  }

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Dojah SDK Modal Test</h2>
      <p className="text-gray-600">
        This tests the official Dojah React SDK approach. Click the button below to test the Dojah verification using the official SDK.
      </p>
      
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-green-600 hover:bg-green-700"
      >
        Test Dojah SDK Modal
      </Button>

      <DojahSdkModal
        open={isOpen}
        onOpenChange={setIsOpen}
        onSuccess={handleSuccess}
        onClose={handleClose}
        verificationType="identity"
      />
    </div>
  )
}
