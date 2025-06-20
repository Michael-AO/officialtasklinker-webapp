// Utility functions for API calls and data formatting

export function formatCurrency(amount: number, currency = "USD"): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  }
  
  export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
  
  export function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  
  export function getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      // Task statuses
      draft: "bg-gray-100 text-gray-800 border-gray-200",
      active: "bg-blue-100 text-blue-800 border-blue-200",
      in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
  
      // Application statuses
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      accepted: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      withdrawn: "bg-gray-100 text-gray-800 border-gray-200",
      interviewing: "bg-purple-100 text-purple-800 border-purple-200",
  
      // Escrow statuses
      funded: "bg-blue-100 text-blue-800 border-blue-200",
      released: "bg-green-100 text-green-800 border-green-200",
      disputed: "bg-red-100 text-red-800 border-red-200",
      refunded: "bg-orange-100 text-orange-800 border-orange-200",
    }
  
    return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200"
  }
  
  export function getPriorityColor(urgency: string): string {
    const priorityColors: Record<string, string> = {
      low: "bg-green-100 text-green-800 border-green-200",
      normal: "bg-blue-100 text-blue-800 border-blue-200",
      high: "bg-red-100 text-red-800 border-red-200",
    }
  
    return priorityColors[urgency] || "bg-gray-100 text-gray-800 border-gray-200"
  }
  
  export function generateTaskCode(id: string): string {
    // Generate a user-friendly task code from UUID
    // Example: TSK-ABC123 (first 6 chars of UUID)
    return `TSK-${id.substring(0, 6).toUpperCase()}`
  }
  
  export function generateApplicationCode(id: string): string {
    // Generate a user-friendly application code from UUID
    // Example: APP-XYZ789
    return `APP-${id.substring(0, 6).toUpperCase()}`
  }
  
  export function generateEscrowCode(id: string): string {
    // Generate a user-friendly escrow code from UUID
    // Example: ESC-DEF456
    return `ESC-${id.substring(0, 6).toUpperCase()}`
  }
  
  // API error handling
  export class ApiError extends Error {
    constructor(
      message: string,
      public status: number,
      public code?: string,
    ) {
      super(message)
      this.name = "ApiError"
    }
  }
  
  export async function handleApiResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(errorData.message || "An error occurred", response.status, errorData.code)
    }
  
    return response.json()
  }
  
  // Time formatting utilities
  export function timeAgo(date: string | Date): string {
    const now = new Date()
    const posted = new Date(date)
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60))
  
    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`
      } else if (diffInDays < 30) {
        const diffInWeeks = Math.floor(diffInDays / 7)
        return `${diffInWeeks} week${diffInWeeks !== 1 ? "s" : ""} ago`
      } else {
        const diffInMonths = Math.floor(diffInDays / 30)
        return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`
      }
    }
  }
  
  // Budget range utilities
  export function getBudgetRangeFilter(range: string) {
    switch (range) {
      case "Under $500":
        return { min: 0, max: 500 }
      case "$500 - $1,000":
        return { min: 500, max: 1000 }
      case "$1,000 - $2,500":
        return { min: 1000, max: 2500 }
      case "$2,500 - $5,000":
        return { min: 2500, max: 5000 }
      case "Over $5,000":
        return { min: 5000, max: undefined }
      default:
        return undefined
    }
  }
  
  // Validation utilities
  export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  export function validateBudget(budget: string): boolean {
    const budgetNum = Number.parseFloat(budget)
    return !Number.isNaN(budgetNum) && budgetNum > 0
  }
  
  // File size formatting
  export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"
  
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
  
    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }
  