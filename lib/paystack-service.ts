"use client"

export interface PaymentVerificationResult {
  status: string
  escrowId?: string
  message?: string
}

export class ClientPaystackService {
  async verifyPayment(reference: string): Promise<PaymentVerificationResult> {
    try {
      const response = await fetch(`/api/paystack/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.data?.status === "success") {
        return {
          status: "verified",
          escrowId: data.data.metadata?.escrow_id,
          message: "Payment verified successfully",
        }
      } else {
        return {
          status: "failed",
          message: data.message || "Payment verification failed",
        }
      }
    } catch (error) {
      console.error("Payment verification error:", error)
      return {
        status: "failed",
        message: error instanceof Error ? error.message : "Payment verification failed",
      }
    }
  }

  async initializePayment(paymentData: {
    email: string
    amount: number
    reference?: string
    metadata?: Record<string, any>
  }) {
    try {
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Payment initialization error:", error)
      throw error
    }
  }
}

// Export a default instance
export const paystackService = new ClientPaystackService()
