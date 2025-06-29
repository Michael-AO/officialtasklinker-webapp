"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreditCard, AlertTriangle, Settings } from "lucide-react"
import { NairaIcon } from "@/components/naira-icon"
import { toast } from "@/hooks/use-toast"

interface BankAccount {
  id: string
  bankName: string
  bankCode: string
  accountNumber: string
  accountName: string
  isDefault: boolean
  isVerified: boolean
  addedDate: string
}

interface WithdrawalModalProps {
  isOpen: boolean
  onClose: () => void
  availableBalance: number
  bankAccounts: BankAccount[]
  calculateFee: (amount: number) => number
}

export function WithdrawalModal({
  isOpen,
  onClose,
  availableBalance,
  bankAccounts,
  calculateFee,
}: WithdrawalModalProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    amount: "",
    bankAccountId: "",
    narration: "",
  })
  const [loading, setLoading] = useState(false)
  const [hasPinSetup, setHasPinSetup] = useState(false) // In real app, fetch from user data

  const verifiedAccounts = bankAccounts.filter((acc) => acc.isVerified)
  const selectedAccount = verifiedAccounts.find((acc) => acc.id === formData.bankAccountId)
  const amount = Number.parseFloat(formData.amount || "0") * 100 // Convert to kobo
  const fee = amount > 0 ? calculateFee(amount) : 0
  const netAmount = amount - fee

  const handleSubmit = async () => {
    if (!formData.amount || !formData.bankAccountId || amount > availableBalance) return

    // Check if user has PIN setup
    if (!hasPinSetup) {
      toast({
        title: "PIN Required",
        description: "Please set up your withdrawal PIN first in Settings.",
        variant: "destructive",
      })

      // Close modal and redirect to settings
      onClose()
      router.push("/settings?tab=security")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/withdrawals/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          bankAccountId: formData.bankAccountId,
          narration: formData.narration || "Withdrawal request",
        }),
      })

      if (!response.ok) throw new Error("Failed to request withdrawal")

      // Reset form and close modal
      setFormData({ amount: "", bankAccountId: "", narration: "" })
      onClose()

      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted successfully.",
      })
    } catch (error) {
      console.error("Withdrawal request failed:", error)
      toast({
        title: "Request Failed",
        description: "Failed to submit withdrawal request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoToSettings = () => {
    onClose()
    router.push("/settings?tab=security")
  }

  const isValidAmount = amount > 0 && amount <= availableBalance
  const hasMinimumAmount = amount >= 100 * 100 // Minimum ₦100

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <NairaIcon className="h-5 w-5" />
            Request Withdrawal
          </DialogTitle>
          <DialogDescription>Transfer your available balance to your bank account</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Balance Overview */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-2xl font-bold text-green-600">₦{(availableBalance / 100).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Minimum Withdrawal</p>
                  <p className="font-medium">₦100</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PIN Setup Warning */}
          {!hasPinSetup && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-yellow-800">Withdrawal PIN Required</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      You need to set up a 4-digit withdrawal PIN before you can request withdrawals. This adds an extra
                      layer of security to your account.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                      onClick={handleGoToSettings}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Set Up PIN in Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Withdrawal Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Withdrawal Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  max={availableBalance / 100}
                  disabled={!hasPinSetup}
                />
                {!isValidAmount && formData.amount && (
                  <p className="text-sm text-red-600">Amount exceeds available balance</p>
                )}
                {!hasMinimumAmount && formData.amount && amount > 0 && (
                  <p className="text-sm text-red-600">Minimum withdrawal amount is ₦100</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccount">Bank Account</Label>
                <Select
                  value={formData.bankAccountId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, bankAccountId: value }))}
                  disabled={!hasPinSetup}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {verifiedAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <span>
                            {account.bankName} - ***{account.accountNumber.slice(-4)}
                          </span>
                          {account.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {verifiedAccounts.length === 0 && (
                  <p className="text-sm text-red-600">
                    No verified bank accounts found. Please add and verify a bank account first.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="narration">Narration (Optional)</Label>
              <Input
                id="narration"
                placeholder="e.g., Project payment withdrawal"
                value={formData.narration}
                onChange={(e) => setFormData((prev) => ({ ...prev, narration: e.target.value }))}
                disabled={!hasPinSetup}
              />
            </div>
          </div>

          {/* Selected Account Details */}
          {selectedAccount && hasPinSetup && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Transfer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Bank</span>
                  <span className="font-medium">{selectedAccount.bankName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Account Name</span>
                  <span className="font-medium">{selectedAccount.accountName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Account Number</span>
                  <span className="font-medium">{selectedAccount.accountNumber}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Withdrawal Amount</span>
                  <span className="font-medium">₦{(amount / 100).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Transfer Fee</span>
                  <span className="font-medium text-red-600">-₦{(fee / 100).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-medium">Net Amount</span>
                  <span className="font-bold text-green-600">₦{(netAmount / 100).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fee Information */}
          {amount > 0 && hasPinSetup && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Transfer Fee: ₦{(fee / 100).toLocaleString()}</p>
                  <p>
                    Fees are automatically deducted from your withdrawal amount. Transfers typically complete within 1-4
                    hours.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {!hasMinimumAmount && amount > 0 && hasPinSetup && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Minimum withdrawal amount is ₦100</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {hasPinSetup ? (
              <Button
                onClick={handleSubmit}
                disabled={
                  !isValidAmount ||
                  !hasMinimumAmount ||
                  !formData.bankAccountId ||
                  verifiedAccounts.length === 0 ||
                  loading
                }
              >
                {loading ? "Processing..." : `Withdraw ₦${(netAmount / 100).toLocaleString()}`}
              </Button>
            ) : (
              <Button onClick={handleGoToSettings}>
                <Settings className="h-4 w-4 mr-2" />
                Set Up PIN First
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
