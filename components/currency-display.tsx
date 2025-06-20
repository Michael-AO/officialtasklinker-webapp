"use client"

import { Badge } from "@/components/ui/badge"
import { CURRENCY } from "@/lib/currency"

interface CurrencyDisplayProps {
  showBadge?: boolean
  className?: string
}

export function CurrencyDisplay({ showBadge = false, className }: CurrencyDisplayProps) {
  if (showBadge) {
    return (
      <Badge variant="secondary" className={className}>
        {CURRENCY.symbol} {CURRENCY.code}
      </Badge>
    )
  }

  return (
    <span className={className}>
      {CURRENCY.symbol} {CURRENCY.name}
    </span>
  )
}

// Usage example in forms or settings
export function CurrencySelector() {
  return (
    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
      <span className="text-sm font-medium">Currency:</span>
      <CurrencyDisplay showBadge />
    </div>
  )
}
