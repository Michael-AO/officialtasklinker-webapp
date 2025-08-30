"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DojahModal } from "@/components/dojah-modal"

export function DojahTest() {
  const [isOpen, setIsOpen] = useState(false)

  const handleSuccess = (result: any) => {
    console.log("✅ Dojah verification successful:", result)
    setIsOpen(false)
  }

  const handleClose = () => {
    console.log("❌ Dojah modal closed")
    setIsOpen(false)
  }

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Dojah Modal Test</h2>
      <p className="text-gray-600">Click the button below to test the Dojah verification modal</p>
      
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Test Dojah Modal
      </Button>

      <DojahModal
        open={isOpen}
        onOpenChange={setIsOpen}
        onSuccess={handleSuccess}
        onClose={handleClose}
        verificationType="identity"
      />
    </div>
  )
}
