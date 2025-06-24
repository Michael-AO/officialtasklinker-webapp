"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Settings,
  Download,
  Eye,
  RefreshCw,
} from "lucide-react"
import { WithdrawalModal } from "@/components/withdrawal-modal"
import { BankAccountManagement } from "@/components/bank-account-management"
import { PinSetupModal } from "@/components/pin-setup-modal"
import { useAuth } from "@/contexts/auth-context"
import { formatNaira } from "@/lib/currency"
import { NairaIcon } from "@/components/naira-icon"

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

interface WithdrawalRequest {
  id: string
  amount: number
  fee: number
  netAmount: number
  bankAccount: BankAccount
  status: "pending" | "processing" | "completed" | "failed" | "cancelled"
  requestDate: string
  processedDate?: string
  reference: string
  narration: string
  failureReason?: string
}

export default function WithdrawalsPage() {
  const { user } = useAuth()
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
  const [showBankModal, setShowBankModal] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinModalMode, setPinModalMode] = useState<"setup" | "change" | "verify">("setup")
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [availableBalance, setAvailableBalance] = useState(250000) // In kobo
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      // Fetch bank accounts
      const bankResponse = await fetch("/api/bank-accounts")
      if (bankResponse.ok) {
        const bankData = await bankResponse.json()
        setBankAccounts(bankData.accounts || [])
      }

      // Fetch withdrawal history
      const withdrawalResponse = await fetch("/api/withdrawals")
      if (withdrawalResponse.ok) {
        const withdrawalData = await withdrawalResponse.json()
        setWithdrawals(withdrawalData.withdrawals || [])
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateFee = (amount: number) => {
    // Fee structure: 1.5% + ₦100 (minimum ₦50, maximum ₦2000)
    const percentageFee = Math.round(amount * 0.015)
    const fixedFee = 100 * 100 // ₦100 in kobo
    const totalFee = percentageFee + fixedFee

    // Apply min/max limits
    const minFee = 50 * 100 // ₦50 in kobo
    const maxFee = 2000 * 100 // ₦2000 in kobo

    return Math.max(minFee, Math.min(maxFee, totalFee))
  }

  const handlePinSetup = () => {
    setPinModalMode("setup")
    setShowPinModal(true)
  }

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
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "failed":
        return <AlertTriangle className="h-4 w-4" />
      case "cancelled":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const totalWithdrawn = withdrawals.filter((w) => w.status === "completed").reduce((sum, w) => sum + w.netAmount, 0)

  const pendingWithdrawals = withdrawals.filter((w) => ["pending", "processing"].includes(w.status))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Withdrawals</h1>
          <p className="text-muted-foreground">Manage your earnings and bank account withdrawals</p>
        </div>
        <div className="flex gap-2">
          {!user?.hasPinSetup && (
            <Button variant="outline" onClick={handlePinSetup}>
              <Settings className="mr-2 h-4 w-4" />
              Setup Security PIN
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowBankModal(true)}>
            <CreditCard className="mr-2 h-4 w-4" />
            Manage Banks
          </Button>
          <Button onClick={() => setShowWithdrawalModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Withdrawal
          </Button>
        </div>
      </div>

      {/* Security Alerts */}
      {!user?.hasPinSetup && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Security PIN Required:</strong> Set up your 4-digit security PIN to make withdrawals and manage your
            funds securely.{" "}
            <Button variant="link" className="p-0 h-auto" onClick={handlePinSetup}>
              Set up now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {bankAccounts.filter((acc) => acc.isVerified).length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Bank Account Required:</strong> Add and verify a bank account to make withdrawals.{" "}
            <Button variant="link" className="p-0 h-auto" onClick={() => setShowBankModal(true)}>
              Add bank account
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Balance Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <NairaIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatNaira(availableBalance / 100)}</div>
            <p className="text-xs text-muted-foreground">Ready for withdrawal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNaira(totalWithdrawn / 100)}</div>
            <p className="text-xs text-muted-foreground">All time withdrawals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNaira(pendingWithdrawals.reduce((sum, w) => sum + w.netAmount, 0) / 100)}
            </div>
            <p className="text-xs text-muted-foreground">{pendingWithdrawals.length} requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bank Accounts</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bankAccounts.filter((acc) => acc.isVerified).length}</div>
            <p className="text-xs text-muted-foreground">Verified accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal History */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Withdrawal History</TabsTrigger>
          <TabsTrigger value="banks">Bank Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          {withdrawals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Withdrawals Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't made any withdrawal requests. Start by requesting your first withdrawal.
                  </p>
                  <Button onClick={() => setShowWithdrawalModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Request Withdrawal
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <Card key={withdrawal.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <NairaIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{formatNaira(withdrawal.netAmount / 100)}</h3>
                              <p className="text-sm text-muted-foreground">
                                To {withdrawal.bankAccount.bankName} •••{withdrawal.bankAccount.accountNumber.slice(-4)}
                              </p>
                            </div>
                            <Badge className={getStatusColor(withdrawal.status)}>
                              {getStatusIcon(withdrawal.status)}
                              <span className="ml-1 capitalize">{withdrawal.status}</span>
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Amount</p>
                              <p className="font-medium">{formatNaira(withdrawal.amount / 100)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Fee</p>
                              <p className="font-medium">{formatNaira(withdrawal.fee / 100)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Reference</p>
                              <p className="font-medium text-xs">{withdrawal.reference}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Date</p>
                              <p className="font-medium">{new Date(withdrawal.requestDate).toLocaleDateString()}</p>
                            </div>
                          </div>

                          {withdrawal.narration && (
                            <div>
                              <p className="text-muted-foreground text-sm">Note</p>
                              <p className="text-sm">{withdrawal.narration}</p>
                            </div>
                          )}

                          {withdrawal.failureReason && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                              <p className="font-medium text-sm text-red-800">Failure Reason:</p>
                              <p className="text-sm text-red-700">{withdrawal.failureReason}</p>
                            </div>
                          )}

                          {withdrawal.status === "completed" && withdrawal.processedDate && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                              <p className="font-medium text-sm text-green-800">
                                Completed on {new Date(withdrawal.processedDate).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
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

                      {withdrawal.status === "pending" && (
                        <Button variant="outline" size="sm">
                          Cancel Request
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="banks" className="space-y-4">
          <BankAccountManagement />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <WithdrawalModal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        availableBalance={availableBalance}
        bankAccounts={bankAccounts}
        calculateFee={calculateFee}
      />

      <BankAccountManagement />

      <PinSetupModal isOpen={showPinModal} onClose={() => setShowPinModal(false)} mode={pinModalMode} />
    </div>
  )
}
