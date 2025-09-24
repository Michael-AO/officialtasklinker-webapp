'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DojahMinimalProps {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

export function DojahMinimal({ onSuccess, onError }: DojahMinimalProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dojah Minimal Test</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is a minimal test component for Dojah integration.</p>
        <Button 
          onClick={() => onSuccess?.({ status: 'success', type: 'minimal' })}
        >
          Simulate Success
        </Button>
      </CardContent>
    </Card>
  )
}
