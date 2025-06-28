// Currency utilities for Naira formatting
export const CURRENCY = {
  code: "NGN",
  symbol: "₦",
  name: "Nigerian Naira",
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

export function formatNairaCompact(amount: number): string {
  if (amount >= 1000000) {
    return `₦${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `₦${(amount / 1000).toFixed(1)}K`
  }
  return formatNaira(amount)
}

// Convert USD to NGN (you can update this rate or fetch from an API)
export const USD_TO_NGN_RATE = 1650 // Current approximate rate

export function convertUsdToNgn(usdAmount: number): number {
  return usdAmount * USD_TO_NGN_RATE
}

// Parse Naira string back to number
export function parseNaira(nairaString: string): number {
  return Number.parseFloat(nairaString.replace(/[₦,]/g, ""))
}

// Add this function to the existing currency.ts file
export function formatCurrency(amount: number, currency = "NGN"): string {
  if (currency === "NGN") {
    return formatNaira(amount)
  }

  // For other currencies, use basic formatting
  return `${currency} ${amount.toLocaleString()}`
}
