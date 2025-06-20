"use client"

export interface WithdrawalRequest {
  amount: number // in kobo
  bankAccountId: string
  pin: string
  reference?: string
}

export interface WithdrawalResponse {
  success: boolean
  message: string
  data?: {
    reference: string
    status: string
    transferCode: string
  }
}

export interface BankVerificationRequest {
  bankCode: string
  accountNumber: string
}

export interface BankVerificationResponse {
  success: boolean
  data?: {
    accountName: string
    accountNumber: string
    bankCode: string
  }
  message: string
}

class WithdrawalService {
  private baseUrl = "https://api.paystack.co"

  // Verify bank account using Paystack
  async verifyBankAccount(request: BankVerificationRequest): Promise<BankVerificationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/bank/resolve`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        // Note: In a real implementation, this would be a server-side call
      })

      const result = await response.json()

      if (result.status) {
        return {
          success: true,
          data: {
            accountName: result.data.account_name,
            accountNumber: result.data.account_number,
            bankCode: request.bankCode,
          },
          message: "Account verified successfully",
        }
      } else {
        return {
          success: false,
          message: result.message || "Account verification failed",
        }
      }
    } catch (error) {
      return {
        success: false,
        message: "Network error during verification",
      }
    }
  }

  // Create transfer recipient
  async createTransferRecipient(bankAccount: {
    bankCode: string
    accountNumber: string
    accountName: string
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/transferrecipient`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "nuban",
          name: bankAccount.accountName,
          account_number: bankAccount.accountNumber,
          bank_code: bankAccount.bankCode,
          currency: "NGN",
        }),
      })

      return response.json()
    } catch (error) {
      throw new Error("Failed to create transfer recipient")
    }
  }

  // Initiate transfer
  async initiateTransfer(request: WithdrawalRequest): Promise<WithdrawalResponse> {
    try {
      // In a real implementation, you would:
      // 1. Validate the PIN
      // 2. Check available balance
      // 3. Create transfer recipient if not exists
      // 4. Initiate the transfer

      const response = await fetch(`${this.baseUrl}/transfer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "balance",
          amount: request.amount,
          recipient: request.bankAccountId, // This would be the recipient code from Paystack
          reason: "Tasklinkers withdrawal",
          reference: request.reference || this.generateReference(),
        }),
      })

      const result = await response.json()

      if (result.status) {
        return {
          success: true,
          message: "Transfer initiated successfully",
          data: {
            reference: result.data.reference,
            status: result.data.status,
            transferCode: result.data.transfer_code,
          },
        }
      } else {
        return {
          success: false,
          message: result.message || "Transfer failed",
        }
      }
    } catch (error) {
      return {
        success: false,
        message: "Network error during transfer",
      }
    }
  }

  // Generate unique reference
  private generateReference(): string {
    return `TL_WD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Get Nigerian banks list
  async getBanksList() {
    try {
      const response = await fetch(`${this.baseUrl}/bank`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()
      return result.data || []
    } catch (error) {
      // Return fallback list if API fails
      return [
        { code: "044", name: "Access Bank" },
        { code: "011", name: "First Bank of Nigeria" },
        { code: "058", name: "Guaranty Trust Bank" },
        { code: "057", name: "Zenith Bank" },
        // ... other banks
      ]
    }
  }

  // Calculate withdrawal fee
  calculateWithdrawalFee(amount: number): number {
    // Paystack transfer fee structure
    if (amount <= 5000) return 1000 // ₦10
    if (amount <= 50000) return 2500 // ₦25
    return Math.min(amount * 0.025, 10000) // 2.5% capped at ₦100
  }
}

export const withdrawalService = new WithdrawalService()
