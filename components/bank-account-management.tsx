"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreditCard, Plus, MoreVertical, CheckCircle, Loader2, Edit, Trash2, Star } from "lucide-react"
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

interface Bank {
  id: number
  name: string
  code: string
}

export function BankAccountManagement() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [banks, setBanks] = useState<Bank[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)

  // Form state
  const [selectedBankCode, setSelectedBankCode] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchBankAccounts()
    fetchBanks()
  }, [])

  const fetchBankAccounts = async () => {
    try {
      const response = await fetch("/api/bank-accounts")
      const result = await response.json()
      if (result.success) {
        setBankAccounts(result.data)
      }
    } catch (error) {
      console.error("Error fetching bank accounts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBanks = async () => {
    try {
      const response = await fetch("/api/banks")
      const result = await response.json()
      if (result.success) {
        setBanks(result.data)
      }
    } catch (error) {
      console.error("Error fetching banks:", error)
    }
  }

  const verifyAccount = async () => {
    if (!selectedBankCode || !accountNumber) return

    setIsVerifying(true)
    try {
      const response = await fetch("/api/banks/verify-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankCode: selectedBankCode,
          accountNumber,
        }),
      })

      const result = await response.json()
      if (result.accountName) {
        setAccountName(result.accountName)
        setIsVerified(true)
        toast({
          title: "Account Verified",
          description: `Account belongs to ${result.accountName}`,
        })
      } else {
        throw new Error("Account verification failed")
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Could not verify account. Please check details.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const addBankAccount = async () => {
    if (!isVerified) return

    setIsSaving(true)
    try {
      const selectedBank = banks.find((bank) => bank.code === selectedBankCode)
      const response = await fetch("/api/bank-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankName: selectedBank?.name,
          bankCode: selectedBankCode,
          accountNumber,
          accountName,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setBankAccounts([...bankAccounts, result.data])
        resetForm()
        setShowAddModal(false)
        toast({
          title: "Bank Account Added",
          description: "Your bank account has been added successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add bank account.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateBankAccount = async () => {
    if (!editingAccount || !isVerified) return

    setIsSaving(true)
    try {
      const selectedBank = banks.find((bank) => bank.code === selectedBankCode)
      const response = await fetch(`/api/bank-accounts/${editingAccount.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankName: selectedBank?.name,
          bankCode: selectedBankCode,
          accountNumber,
          accountName,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setBankAccounts(bankAccounts.map((account) => (account.id === editingAccount.id ? result.data : account)))
        resetForm()
        setShowEditModal(false)
        setEditingAccount(null)
        toast({
          title: "Bank Account Updated",
          description: "Your bank account has been updated successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bank account.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const setAsDefault = async (accountId: string) => {
    try {
      const response = await fetch(`/api/bank-accounts/${accountId}/default`, {
        method: "PUT",
      })

      const result = await response.json()
      if (result.success) {
        setBankAccounts(
          bankAccounts.map((account) => ({
            ...account,
            isDefault: account.id === accountId,
          })),
        )
        toast({
          title: "Default Account Set",
          description: "This account is now your default withdrawal account.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set default account.",
        variant: "destructive",
      })
    }
  }

  const deleteBankAccount = async (accountId: string) => {
    try {
      const response = await fetch(`/api/bank-accounts/${accountId}`, {
        method: "DELETE",
      })

      const result = await response.json()
      if (result.success) {
        setBankAccounts(bankAccounts.filter((account) => account.id !== accountId))
        toast({
          title: "Account Deleted",
          description: "Bank account has been removed successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete bank account.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setSelectedBankCode("")
    setAccountNumber("")
    setAccountName("")
    setIsVerified(false)
  }

  const openEditModal = (account: BankAccount) => {
    setEditingAccount(account)
    setSelectedBankCode(account.bankCode)
    setAccountNumber(account.accountNumber)
    setAccountName(account.accountName)
    setIsVerified(true)
    setShowEditModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Bank Accounts</h2>
          <p className="text-muted-foreground">Manage your withdrawal bank accounts</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} disabled={true}>
          <Plus className="h-4 w-4 mr-2" />
          Add Bank Account
        </Button>
      </div>

      <div className="grid gap-4">
        {bankAccounts.length > 0 ? (
          bankAccounts.map((account) => (
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
                        {account.isDefault && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Default
                          </Badge>
                        )}
                        {account.isVerified ? (
                          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
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

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" disabled={true}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditModal(account)} disabled={true}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {!account.isDefault && account.isVerified && (
                        <DropdownMenuItem onClick={() => setAsDefault(account.id)} disabled={true}>
                          <Star className="h-4 w-4 mr-2" />
                          Set as Default
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => deleteBankAccount(account.id)} className="text-red-600" disabled={true}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No Bank Accounts</h3>
              <p className="text-sm text-muted-foreground mb-4">Add a bank account to start receiving withdrawals</p>
              <Button onClick={() => setShowAddModal(true)} disabled={true}>
                <Plus className="h-4 w-4 mr-2" />
                Add Bank Account
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Bank Account Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Bank Account</DialogTitle>
            <DialogDescription>Add a new bank account for receiving withdrawals.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Bank</Label>
              <Select value={selectedBankCode} onValueChange={setSelectedBankCode} disabled={true}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
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
                  value={accountNumber}
                  onChange={(e) => {
                    setAccountNumber(e.target.value)
                    setIsVerified(false)
                    setAccountName("")
                  }}
                  placeholder="0123456789"
                  maxLength={10}
                  disabled={true}
                />
                <Button
                  onClick={verifyAccount}
                  disabled={true}
                  size="sm"
                >
                  {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                </Button>
              </div>
            </div>

            {isVerified && (
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{accountName}</p>
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={true}>
              Cancel
            </Button>
            <Button onClick={addBankAccount} disabled={true}>
              {isSaving ? "Adding..." : "Add Account"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Bank Account Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Bank Account</DialogTitle>
            <DialogDescription>Update your bank account information.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Bank</Label>
              <Select value={selectedBankCode} onValueChange={setSelectedBankCode} disabled={true}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.code} value={bank.code}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editAccountNumber">Account Number</Label>
              <div className="flex gap-2">
                <Input
                  id="editAccountNumber"
                  value={accountNumber}
                  onChange={(e) => {
                    setAccountNumber(e.target.value)
                    setIsVerified(false)
                    setAccountName("")
                  }}
                  placeholder="0123456789"
                  maxLength={10}
                  disabled={true}
                />
                <Button
                  onClick={verifyAccount}
                  disabled={true}
                  size="sm"
                >
                  {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                </Button>
              </div>
            </div>

            {isVerified && (
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{accountName}</p>
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setShowEditModal(false)} disabled={true}>
              Cancel
            </Button>
            <Button onClick={updateBankAccount} disabled={true}>
              {isSaving ? "Updating..." : "Update Account"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
