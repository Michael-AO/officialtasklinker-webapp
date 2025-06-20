"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { DollarSign, CreditCard, Clock, CheckCircle, AlertTriangle, Plus, Download, Eye, Banknote } from "lucide-react"
import { WithdrawalModal } from "@/components/withdrawal-modal"
import { BankAccountModal } from "@/components/bank-account-modal"

interface WithdrawalRequest {
  id: string
  amount: number
  currency: string
  status: "pending" | "processing" | "completed" | "failed"
  bankAccount: {
    bankName: string
    accountNumber: string
    accountName: string
  }
  requestDate: string
  processedDate?: string
  reference: string
  fee: number
  netAmount: number
}

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

export default function WithdrawalsPage() {
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
  const [showBankAccountModal, setShowBankAccountModal] = useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<string | null>(null)

  // Mock data - in real app, this would come from API/context
  const availableBalance = 375000 // 3,750 NGN in kobo
  const pendingWithdrawals = 125000 // 1,250 NGN in kobo
  const totalEarnings = 845000 // 8,450 NGN in kobo

  const withdrawalRequests: WithdrawalRequest[] = [
    {
      id: "wd_001",
      amount: 200000,
      currency: "NGN",
      status: "completed",
      bankAccount: {
        bankName: "GTBank",
        accountNumber: "0123456789",
        accountName: "John Doe",
      },
      requestDate: "2024-12-10T10:00:00Z",
      processedDate: "2024-12-10T14:30:00Z",
      reference: "TL_WD_1733832000_abc123",
      fee: 5000,
      netAmount: 195000,
    },
    {
      id: "wd_002",
      amount: 150000,
      currency: "NGN",
      status: "processing",
      bankAccount: {
        bankName: "Access Bank",
        accountNumber: "0987654321",
        accountName: "John Doe",
      },
      requestDate: "2024-12-12T09:15:00Z",
      reference: "TL_WD_1734004500_def456",
      fee: 3750,
      netAmount: 146250,
    },
    {
      id: "wd_003",
      amount: 100000,
      currency: "NGN",
      status: "pending",
      bankAccount: {
        bankName: "First Bank",
        accountNumber: "3001234567",
        accountName: "John Doe",
      },
      requestDate: "2024-12-13T16:20:00Z",
      reference: "TL_WD_1734115200_ghi789",
      fee: 2500,
      netAmount: 97500,
    },
  ]

  const bankAccounts: BankAccount[] = [
    {
      id: "bank_001",
      bankName: "GTBank",
      bankCode: "058",
      accountNumber: "0123456789",
      accountName: "John Doe",
      isDefault: true,
      isVerified: true,
      addedDate: "2024-11-15T10:00:00Z",
    },
    {
      id: "bank_002",
      bankName: "Access Bank",
      bankCode: "044",
      accountNumber: "0987654321",
      accountName: "John Doe",
      isDefault: false,
      isVerified: true,
      addedDate: "2024-11-20T14:30:00Z",
    },
    {
      id: "bank_003",
      bankName: "First Bank",
      bankCode: "011",
      accountNumber: "3001234567",
      accountName: "John Doe",
      isDefault: false,
      isVerified: false,
      addedDate: "2024-12-01T09:15:00Z",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "failed":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const calculateWithdrawalFee = (amount: number) => {
    // Paystack transfer fee structure (simplified)
    if (amount <= 5000) return 1000 // ₦10
    if (amount <= 50000) return 2500 // ₦25
    return Math.min(amount * 0.025, 10000) // 2.5% capped at ₦100
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Withdrawals</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBankAccountModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Bank Account
          </Button>
          <Button onClick={() => setShowWithdrawalModal(true)}>
            <Banknote className="h-4 w-4 mr-2" />
            Request Withdrawal
          </Button>
        </div>
      </div>

      {/* Balance Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₦{(availableBalance / 100).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Ready for withdrawal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">₦{(pendingWithdrawals / 100).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Being processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{(totalEarnings / 100).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">Successful withdrawals</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Withdrawal Requests</TabsTrigger>
          <TabsTrigger value="accounts">Bank Accounts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <div className="space-y-4">
            {withdrawalRequests.map((withdrawal) => (
              <Card key={withdrawal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                        <Banknote className="h-6 w-6 text-blue-600" />
                      </div>

                      <div className="space-y-2 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">
                            ₦{(withdrawal.amount / 100).toLocaleString()} Withdrawal
                          </h3>
                          <Badge className={getStatusColor(withdrawal.status)}>
                            {getStatusIcon(withdrawal.status)}
                            <span className="ml-1 capitalize">{withdrawal.status}</span>
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Bank</p>
                            <p className="font-medium">{withdrawal.bankAccount.bankName}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Account</p>
                            <p className="font-medium">***{withdrawal.bankAccount.accountNumber.slice(-4)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Fee</p>
                            <p className="font-medium">₦{(withdrawal.fee / 100).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Net Amount</p>
                            <p className="font-medium text-green-600">
                              ₦{(withdrawal.netAmount / 100).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Requested: {new Date(withdrawal.requestDate).toLocaleDateString()}</span>
                          {withdrawal.processedDate && (
                            <span>Processed: {new Date(withdrawal.processedDate).toLocaleDateString()}</span>
                          )}
                          <span>Ref: {withdrawal.reference}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      {withdrawal.status === "completed" && "Funds transferred successfully"}
                      {withdrawal.status === "processing" && "Transfer in progress"}
                      {withdrawal.status === "pending" && "Awaiting processing"}
                      {withdrawal.status === "failed" && "Transfer failed - contact support"}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      {withdrawal.status === "completed" && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <div className="space-y-4">
            {bankAccounts.map((account) => (
              <Card key={account.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
                        <CreditCard className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{account.bankName}</h3>
                          {account.isDefault && <Badge variant="secondary">Default</Badge>}
                          {account.isVerified ? (
                            <Badge className="bg-green-100 text-green-800">Verified</Badge>
                          ) : (
                            <Badge variant="outline">Pending Verification</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {account.accountName} • ***{account.accountNumber.slice(-4)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(account.addedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!account.isVerified && (
                        <Button variant="outline" size="sm">
                          Verify
                        </Button>
                      )}
                      {!account.isDefault && account.isVerified && (
                        <Button variant="outline" size="sm">
                          Set as Default
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Trends</CardTitle>
                <CardDescription>Your withdrawal patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">This Month</span>
                    <span className="font-medium">₦{(450000 / 100).toLocaleString()}</span>
                  </div>
                  <Progress value={75} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Month</span>
                    <span className="font-medium">₦{(320000 / 100).toLocaleString()}</span>
                  </div>
                  <Progress value={53} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Monthly</span>
                    <span className="font-medium">₦{(385000 / 100).toLocaleString()}</span>
                  </div>
                  <Progress value={64} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Processing Times</CardTitle>
                <CardDescription>Average time to process withdrawals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Instant Transfers</span>
                    <span className="font-medium">&lt; 1 hour</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Standard Transfers</span>
                    <span className="font-medium">2-4 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Your Average</span>
                    <span className="font-medium text-green-600">1.5 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Fee Breakdown</CardTitle>
              <CardDescription>Understanding withdrawal fees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 border rounded-lg">
                    <p className="font-medium">₦0 - ₦50</p>
                    <p className="text-muted-foreground">₦10 fee</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="font-medium">₦50 - ₦500</p>
                    <p className="text-muted-foreground">₦25 fee</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="font-medium">₦500+</p>
                    <p className="text-muted-foreground">2.5% (max ₦100)</p>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Withdraw larger amounts less frequently to minimize fees. Fees are
                    automatically calculated and shown before confirmation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <WithdrawalModal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        availableBalance={availableBalance}
        bankAccounts={bankAccounts}
        calculateFee={calculateWithdrawalFee}
      />

      <BankAccountModal isOpen={showBankAccountModal} onClose={() => setShowBankAccountModal(false)} />
    </div>
  )
}
