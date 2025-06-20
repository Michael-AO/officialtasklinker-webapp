"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, CreditCard, AlertTriangle } from "lucide-react"

interface BankAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BankAccountModal({ isOpen, onClose }: BankAccountModalProps) {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [accountData, setAccountData] = useState({
    bankCode: "",
    accountNumber: "",
    accountName: "",
    isDefault: false,
  })
  const [verificationResult, setVerificationResult] = useState<{
    accountName: string
    isValid: boolean
  } | null>(null)

  // Nigerian banks list (simplified)
  const nigerianBanks = [
    { code: "044", name: "Access Bank" },
    { code: "014", name: "Afribank Nigeria Plc" },
    { code: "023", name: "Citibank Nigeria Limited" },
    { code: "050", name: "Ecobank Nigeria Plc" },
    { code: "040", name: "Equitorial Trust Bank" },
    { code: "011", name: "First Bank of Nigeria" },
    { code: "214", name: "First City Monument Bank" },
    { code: "070", name: "Fidelity Bank" },
    { code: "058", name: "Guaranty Trust Bank" },
    { code: "030", name: "Heritage Bank" },
    { code: "301", name: "Jaiz Bank" },
    { code: "082", name: "Keystone Bank" },
    { code: "526", name: "Parallex Bank" },
    { code: "076", name: "Polaris Bank" },
    { code: "101", name: "Providus Bank" },
    { code: "221", name: "Stanbic IBTC Bank" },
    { code: "068", name: "Standard Chartered Bank" },
    { code: "232", name: "Sterling Bank" },
    { code: "100", name: "Suntrust Bank" },
    { code: "032", name: "Union Bank of Nigeria" },
    { code: "033", name: "United Bank For Africa" },
    { code: "215", name: "Unity Bank" },
    { code: "035", name: "Wema Bank" },
    { code: "057", name: "Zenith Bank" },
  ]

  const handleVerifyAccount = async () => {
    if (!accountData.bankCode || !accountData.accountNumber) return

    setIsLoading(true)
    try {
      // Simulate account verification API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock verification result
      const mockAccountName = "John Doe" // This would come from the API
      setVerificationResult({
        accountName: mockAccountName,
        isValid: true,
      })

      setAccountData((prev) => ({ ...prev, accountName: mockAccountName }))
    } catch (error) {
      setVerificationResult({
        accountName: "",
        isValid: false,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (step === 1) {
      if (!verificationResult?.isValid) return
      setStep(2)
      return
    }

    // Save bank account
    setIsLoading(true)
    try {
      // Simulate API call to save bank account
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Here you would call your API to save the bank account
      // const result = await saveBankAccount(accountData)

      setStep(3)
    } catch (error) {
      console.error("Failed to save bank account:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetModal = () => {
    setStep(1)
    setAccountData({
      bankCode: "",
      accountNumber: "",
      accountName: "",
      isDefault: false,
    })
    setVerificationResult(null)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const selectedBank = nigerianBanks.find((bank) => bank.code === accountData.bankCode)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Add Bank Account"}
            {step === 2 && "Confirm Bank Account"}
            {step === 3 && "Account Added Successfully"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Add a new bank account for withdrawals"}
            {step === 2 && "Review and confirm your bank account details"}
            {step === 3 && "Your bank account has been added successfully"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bank">Bank</Label>
                <Select
                  value={accountData.bankCode}
                  onValueChange={(value) => {
                    setAccountData((prev) => ({ ...prev, bankCode: value }))
                    setVerificationResult(null)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {nigerianBanks.map((bank) => (
                      <SelectItem key={bank.code} value={bank.code}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="accountNumber"
                    value={accountData.accountNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 10)
                      setAccountData((prev) => ({ ...prev, accountNumber: value }))
                      setVerificationResult(null)
                    }}
                    placeholder="0123456789"
                    maxLength={10}
                  />
                  <Button
                    onClick={handleVerifyAccount}
                    disabled={!accountData.bankCode || accountData.accountNumber.length !== 10 || isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </div>

              {verificationResult && (
                <Card>
                  <CardContent className="pt-4">
                    {verificationResult.isValid ? (
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">Account Verified</p>
                          <p className="text-sm text-green-600">Account Name: {verificationResult.accountName}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium text-red-800">Verification Failed</p>
                          <p className="text-sm text-red-600">Please check your bank and account number</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!verificationResult?.isValid}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                  <div className="space-y-1">
                    <p className="font-medium">{selectedBank?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {accountData.accountName} • {accountData.accountNumber}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={accountData.isDefault}
                  onChange={(e) => setAccountData((prev) => ({ ...prev, isDefault: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isDefault">Set as default withdrawal account</Label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-blue-900">Account Security</p>
                  <p className="text-sm text-blue-700">
                    Your bank account information is encrypted and stored securely. We never store your full account
                    details on our servers.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Adding Account..." : "Add Account"}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Bank Account Added!</h3>
              <p className="text-muted-foreground">
                Your {selectedBank?.name} account has been successfully added and verified.
              </p>
            </div>

            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Bank:</span>
                    <span className="font-medium">{selectedBank?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Account:</span>
                    <span className="font-medium">***{accountData.accountNumber.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge className="bg-green-100 text-green-800">Verified</Badge>
                  </div>
                  {accountData.isDefault && (
                    <div className="flex justify-between">
                      <span>Default:</span>
                      <Badge variant="secondary">Yes</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                You can now use this account for withdrawals. All future withdrawals will be processed to your verified
                accounts.
              </p>
            </div>

            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
