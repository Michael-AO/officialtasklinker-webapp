'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DojahReactSdkProps {
  verificationType?: string
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

export function DojahReactSdk({ verificationType, onSuccess, onError }: DojahReactSdkProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dojah React SDK Test</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is a test component for Dojah React SDK integration.</p>
        <p className="text-sm text-gray-600">Type: {verificationType || 'identity'}</p>
        <Button 
          onClick={() => onSuccess?.({ type: verificationType, status: 'success' })}
        >
          Simulate Success
        </Button>
      </CardContent>
    </Card>
  )
}
