"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DojahPopupModal } from "@/components/dojah-popup-modal"

export function DojahPopupTest() {
  const [isOpen, setIsOpen] = useState(false)

  const handleSuccess = (result: any) => {
    console.log("✅ Dojah popup verification successful:", result)
    setIsOpen(false)
  }

  const handleClose = () => {
    console.log("❌ Dojah popup modal closed")
    setIsOpen(false)
  }

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Dojah Popup Modal Test</h2>
      <p className="text-gray-600">
        This tests the new popup modal approach. Click the button below to test the Dojah verification popup.
      </p>
      
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Test Dojah Popup Modal
      </Button>

      <DojahPopupModal
        open={isOpen}
        onOpenChange={setIsOpen}
        onSuccess={handleSuccess}
        onClose={handleClose}
        verificationType="identity"
      />
    </div>
  )
}
