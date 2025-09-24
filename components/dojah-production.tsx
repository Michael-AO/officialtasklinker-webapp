'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DojahProductionProps {
  verificationType?: string
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

export function DojahProduction({ verificationType, onSuccess, onError }: DojahProductionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dojah Production Test</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is a test component for Dojah production integration.</p>
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
