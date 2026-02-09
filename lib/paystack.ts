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

  // Verify payment (client-side method)
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

  // Server-side verify transaction (for API routes)
  async verifyTransaction(reference: string): Promise<VerificationResponse> {
    const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    return response.json()
  }

  // Initialize transaction (server-side)
  async initializeTransaction(paymentData: PaymentData): Promise<PaymentResponse> {
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

// Create a server-side service that works in API routes
class ServerPaystackService {
  private baseUrl = "https://api.paystack.co"

  // Server-side verify transaction
  async verifyTransaction(reference: string): Promise<VerificationResponse> {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured")
    }

    const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Paystack API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Initialize transaction (server-side)
  async initializeTransaction(paymentData: PaymentData): Promise<PaymentResponse> {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured")
    }

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

    if (!response.ok) {
      throw new Error(`Paystack API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Generate unique reference
  private generateReference(): string {
    return `TL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Create transfer recipient (for payouts)
  async createTransferRecipient(params: {
    type: string
    name: string
    account_number: string
    bank_code: string
    currency?: string
  }): Promise<{ status: boolean; message: string; data?: { recipient_code: string } }> {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured")
    }
    const response = await fetch(`${this.baseUrl}/transferrecipient`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: params.type || "nuban",
        name: params.name,
        account_number: params.account_number,
        bank_code: params.bank_code,
        currency: params.currency || "NGN",
      }),
    })
    const data = await response.json()
    return data
  }

  // Initiate transfer (amount in Naira; converted to kobo internally for Paystack)
  async initiateTransfer(params: {
    source: string
    amount: number
    recipient: string
    reason: string
    reference: string
  }): Promise<{ status: boolean; message: string; data?: unknown }> {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured")
    }
    const amountNaira = Number(params.amount)
    const amountKobo = Math.round(amountNaira * 100) // Paystack expects kobo (1 Naira = 100 kobo)
    const response = await fetch(`${this.baseUrl}/transfer`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: params.source || "balance",
        amount: amountKobo,
        recipient: params.recipient,
        reason: params.reason,
        reference: params.reference,
      }),
    })
    const data = await response.json()
    return data
  }
}

// Export both client and server instances
export const paystack = new PaystackService(process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "")
export const paystackService = new ServerPaystackService()
