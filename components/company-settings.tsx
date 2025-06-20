"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Building2, Percent, DollarSign, Settings, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface CompanySettings {
  name: string
  email: string
  phone: string
  address: string
  escrowFeePercentage: number
  withdrawalFeeFlat: number
  withdrawalFeePercentage: number
  withdrawalFeeMax: number
  minimumWithdrawal: number
  maximumWithdrawal: number
  autoReleaseEnabled: boolean
  autoReleaseDays: number
  disputeResolutionFee: number
}

export function CompanySettings() {
  const [settings, setSettings] = useState<CompanySettings>({
    name: "TaskLance",
    email: "admin@tasklance.com",
    phone: "+234 800 123 4567",
    address: "123 Business District, Lagos, Nigeria",
    escrowFeePercentage: 2.5,
    withdrawalFeeFlat: 1000, // ₦10 in kobo
    withdrawalFeePercentage: 2.5,
    withdrawalFeeMax: 10000, // ₦100 in kobo
    minimumWithdrawal: 10000, // ₦100 in kobo
    maximumWithdrawal: 500000000, // ₦5,000,000 in kobo
    autoReleaseEnabled: true,
    autoReleaseDays: 7,
    disputeResolutionFee: 500, // ₦5 in kobo
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/settings")
      const result = await response.json()
      if (result.success) {
        setSettings(result.data)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      const result = await response.json()
      if (result.success) {
        toast({
          title: "Settings Saved",
          description: "Company settings have been updated successfully.",
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (key: keyof CompanySettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const calculateEscrowFee = (amount: number) => {
    return (amount * settings.escrowFeePercentage) / 100
  }

  const calculateWithdrawalFee = (amount: number) => {
    if (amount <= 5000) return settings.withdrawalFeeFlat
    const percentageFee = (amount * settings.withdrawalFeePercentage) / 100
    return Math.min(percentageFee, settings.withdrawalFeeMax)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Company Settings
          </h2>
          <p className="text-muted-foreground">Manage your platform configuration and fees</p>
        </div>
        <Button onClick={saveSettings} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>Basic company details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" value={settings.name} onChange={(e) => updateSetting("name", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyEmail">Email</Label>
              <Input
                id="companyEmail"
                type="email"
                value={settings.email}
                onChange={(e) => updateSetting("email", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyPhone">Phone</Label>
              <Input
                id="companyPhone"
                value={settings.phone}
                onChange={(e) => updateSetting("phone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyAddress">Address</Label>
              <Textarea
                id="companyAddress"
                value={settings.address}
                onChange={(e) => updateSetting("address", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Fee Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Fee Configuration
            </CardTitle>
            <CardDescription>Set platform fees and commission rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="escrowFee">Escrow Fee (%)</Label>
              <Input
                id="escrowFee"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={settings.escrowFeePercentage}
                onChange={(e) => updateSetting("escrowFeePercentage", Number.parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">Fee charged on each escrow transaction</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="withdrawalFeeFlat">Withdrawal Fee (Flat - ₦)</Label>
              <Input
                id="withdrawalFeeFlat"
                type="number"
                min="0"
                value={settings.withdrawalFeeFlat / 100}
                onChange={(e) => updateSetting("withdrawalFeeFlat", (Number.parseFloat(e.target.value) || 0) * 100)}
              />
              <p className="text-xs text-muted-foreground">Flat fee for small withdrawals (≤ ₦50)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdrawalFeePercentage">Withdrawal Fee (%)</Label>
              <Input
                id="withdrawalFeePercentage"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={settings.withdrawalFeePercentage}
                onChange={(e) => updateSetting("withdrawalFeePercentage", Number.parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">Percentage fee for larger withdrawals</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdrawalFeeMax">Maximum Withdrawal Fee (₦)</Label>
              <Input
                id="withdrawalFeeMax"
                type="number"
                min="0"
                value={settings.withdrawalFeeMax / 100}
                onChange={(e) => updateSetting("withdrawalFeeMax", (Number.parseFloat(e.target.value) || 0) * 100)}
              />
              <p className="text-xs text-muted-foreground">Cap on withdrawal fees</p>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Withdrawal Limits
            </CardTitle>
            <CardDescription>Set minimum and maximum withdrawal amounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="minWithdrawal">Minimum Withdrawal (₦)</Label>
              <Input
                id="minWithdrawal"
                type="number"
                min="0"
                value={settings.minimumWithdrawal / 100}
                onChange={(e) => updateSetting("minimumWithdrawal", (Number.parseFloat(e.target.value) || 0) * 100)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxWithdrawal">Maximum Withdrawal (₦)</Label>
              <Input
                id="maxWithdrawal"
                type="number"
                min="0"
                value={settings.maximumWithdrawal / 100}
                onChange={(e) => updateSetting("maximumWithdrawal", (Number.parseFloat(e.target.value) || 0) * 100)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="disputeFee">Dispute Resolution Fee (₦)</Label>
              <Input
                id="disputeFee"
                type="number"
                min="0"
                value={settings.disputeResolutionFee / 100}
                onChange={(e) => updateSetting("disputeResolutionFee", (Number.parseFloat(e.target.value) || 0) * 100)}
              />
              <p className="text-xs text-muted-foreground">Fee charged for dispute mediation services</p>
            </div>
          </CardContent>
        </Card>

        {/* Auto-Release Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Auto-Release Settings</CardTitle>
            <CardDescription>Configure automatic fund release policies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Auto-Release</Label>
                <p className="text-xs text-muted-foreground">Automatically release funds after completion</p>
              </div>
              <Switch
                checked={settings.autoReleaseEnabled}
                onCheckedChange={(checked) => updateSetting("autoReleaseEnabled", checked)}
              />
            </div>

            {settings.autoReleaseEnabled && (
              <div className="space-y-2">
                <Label htmlFor="autoReleaseDays">Auto-Release Days</Label>
                <Input
                  id="autoReleaseDays"
                  type="number"
                  min="1"
                  max="30"
                  value={settings.autoReleaseDays}
                  onChange={(e) => updateSetting("autoReleaseDays", Number.parseInt(e.target.value) || 7)}
                />
                <p className="text-xs text-muted-foreground">Days after completion before automatic release</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fee Calculator Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Calculator Preview</CardTitle>
          <CardDescription>See how your fee structure affects different transaction amounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[100000, 500000, 1000000].map((amount) => (
              <div key={amount} className="p-4 border rounded-lg">
                <div className="text-center">
                  <p className="text-lg font-semibold">₦{(amount / 100).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Transaction Amount</p>
                </div>
                <Separator className="my-2" />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Escrow Fee:</span>
                    <Badge variant="outline">₦{(calculateEscrowFee(amount) / 100).toFixed(2)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Withdrawal Fee:</span>
                    <Badge variant="outline">₦{(calculateWithdrawalFee(amount) / 100).toFixed(2)}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
