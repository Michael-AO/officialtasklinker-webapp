// Paystack configuration and utilities
export const PAYSTACK_CONFIG = {
    secretKey: process.env.PAYSTACK_SECRET_KEY || "sk_test_ef56928a6d163751f875d2dd5319b957846b86ad",
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_50596166815e556fc669cd96003c1d2851d40621",
    baseUrl: "https://api.paystack.co",
    isConfigured: function () {
      return !!(this.secretKey && this.secretKey.startsWith("sk_"))
    },
    isLive: function () {
      return this.secretKey.startsWith("sk_live_")
    },
  }
  
  // Nigerian bank codes for Paystack
  export const NIGERIAN_BANKS = {
    "access-bank": { code: "044", name: "Access Bank" },
    gtbank: { code: "058", name: "Guaranty Trust Bank" },
    "zenith-bank": { code: "057", name: "Zenith Bank" },
    "first-bank": { code: "011", name: "First Bank of Nigeria" },
    uba: { code: "033", name: "United Bank for Africa" },
    "fidelity-bank": { code: "070", name: "Fidelity Bank" },
    "union-bank": { code: "032", name: "Union Bank of Nigeria" },
    "sterling-bank": { code: "232", name: "Sterling Bank" },
    "stanbic-ibtc": { code: "221", name: "Stanbic IBTC Bank" },
    fcmb: { code: "214", name: "First City Monument Bank" },
    ecobank: { code: "050", name: "Ecobank Nigeria" },
    "wema-bank": { code: "035", name: "Wema Bank" },
    "polaris-bank": { code: "076", name: "Polaris Bank" },
    "keystone-bank": { code: "082", name: "Keystone Bank" },
    "providus-bank": { code: "101", name: "Providus Bank" },
  }
  
  export function getBankCode(bankName: string): string {
    const bank = NIGERIAN_BANKS[bankName as keyof typeof NIGERIAN_BANKS]
    return bank?.code || "044" // Default to Access Bank
  }
  
  export function getBankName(bankKey: string): string {
    const bank = NIGERIAN_BANKS[bankKey as keyof typeof NIGERIAN_BANKS]
    return bank?.name || bankKey.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }
  