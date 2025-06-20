"use client"

export interface PaystackConfig {
  publicKey: string
  secretKey?: string
}

export interface PaymentData {
  email: string
  amount: number // in kobo (smallest currency unit)
  currency?: string
  reference?: string
  callback_url?: string
  metadata?: Record<string, any>
  channels?: string[]
}

export interface PaymentResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export interface VerificationResponse {
  status: boolean
  message: string
  data: {
    id: number
    domain: string
    status: string
    reference: string
    amount: number
    message: string
    gateway_response: string
    paid_at: string
    created_at: string
    channel: string
    currency: string
    ip_address: string
    metadata: Record<string, any>
    fees: number
    customer: {
      id: number
      first_name: string
      last_name: string
      email: string
      phone: string
    }
    authorization: {
      authorization_code: string
      bin: string
      last4: string
      exp_month: string
      exp_year: string
      channel: string
      card_type: string
      bank: string
      country_code: string
      brand: string
    }
  }
}

class PaystackService {
  private publicKey: string
  private baseUrl = "https://api.paystack.co"

  constructor(publicKey: string) {
    this.publicKey = publicKey
  }

  // Initialize payment
  async initializePayment(paymentData: PaymentData): Promise<PaymentResponse> {
    const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...paymentData,
        reference: paymentData.reference || this.generateReference(),
      }),
    })

    return response.json()
  }

  // Verify payment
  async verifyPayment(reference: string): Promise<VerificationResponse> {
    const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    return response.json()
  }

  // Generate unique reference
  private generateReference(): string {
    return `TL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Open Paystack popup (client-side)
  openPaymentModal(paymentData: PaymentData, onSuccess: (response: any) => void, onClose: () => void) {
    if (typeof window !== "undefined" && (window as any).PaystackPop) {
      const handler = (window as any).PaystackPop.setup({
        key: this.publicKey,
        email: paymentData.email,
        amount: paymentData.amount,
        currency: paymentData.currency || "NGN",
        ref: paymentData.reference || this.generateReference(),
        metadata: paymentData.metadata,
        callback: onSuccess,
        onClose: onClose,
      })
      handler.openIframe()
    }
  }
}

export const paystack = new PaystackService(process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "")
