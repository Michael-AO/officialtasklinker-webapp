"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { DollarSign, CreditCard, Shield, Bell, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function PaymentSettings() {
  const [settings, setSettings] = useState({
    autoAcceptEscrow: false,
    autoReleaseEnabled: true,
    autoReleaseDays: 7,
    requirePinForWithdrawals: true,
    instantPaymentEnabled: true,
    paymentNotifications: true,
    lowBalanceAlert: true,
    lowBalanceThreshold: 10000, // ₦100 in kobo
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Payment Settings Saved",
        description: "Your payment preferences have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save payment settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Payment Settings
          </h2>
          <p className="text-muted-foreground">Configure your payment preferences and escrow settings</p>
        </div>
        <Button onClick={handleSave} disabled={true}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Escrow Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Escrow Settings
            </CardTitle>
            <CardDescription>Configure how escrow transactions are handled</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Accept Escrow</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically accept escrow requests from trusted clients
                </p>
              </div>
              <Switch
                checked={settings.autoAcceptEscrow}
                onCheckedChange={(checked) => updateSetting("autoAcceptEscrow", checked)}
                disabled={true}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Release Funds</Label>
                <p className="text-xs text-muted-foreground">Automatically release funds after project completion</p>
              </div>
              <Switch
                checked={settings.autoReleaseEnabled}
                onCheckedChange={(checked) => updateSetting("autoReleaseEnabled", checked)}
                disabled={true}
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
                  disabled={true}
                />
                <p className="text-xs text-muted-foreground">Days after completion before automatic release</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Payment Security
            </CardTitle>
            <CardDescription>Security settings for payments and withdrawals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require PIN for Withdrawals</Label>
                <p className="text-xs text-muted-foreground">Always require PIN verification for withdrawals</p>
              </div>
              <Switch
                checked={settings.requirePinForWithdrawals}
                onCheckedChange={(checked) => updateSetting("requirePinForWithdrawals", checked)}
                disabled={true}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Instant Payments</Label>
                <p className="text-xs text-muted-foreground">Enable instant payment processing</p>
              </div>
              <Switch
                checked={settings.instantPaymentEnabled}
                onCheckedChange={(checked) => updateSetting("instantPaymentEnabled", checked)}
                disabled={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Payment Notifications
            </CardTitle>
            <CardDescription>Configure payment-related notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Payment Notifications</Label>
                <p className="text-xs text-muted-foreground">Get notified about payments and withdrawals</p>
              </div>
              <Switch
                checked={settings.paymentNotifications}
                onCheckedChange={(checked) => updateSetting("paymentNotifications", checked)}
                disabled={true}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Low Balance Alerts</Label>
                <p className="text-xs text-muted-foreground">Get notified when balance is low</p>
              </div>
              <Switch
                checked={settings.lowBalanceAlert}
                onCheckedChange={(checked) => updateSetting("lowBalanceAlert", checked)}
                disabled={true}
              />
            </div>

            {settings.lowBalanceAlert && (
              <div className="space-y-2">
                <Label htmlFor="lowBalanceThreshold">Low Balance Threshold (₦)</Label>
                <Input
                  id="lowBalanceThreshold"
                  type="number"
                  min="0"
                  value={settings.lowBalanceThreshold / 100}
                  onChange={(e) => updateSetting("lowBalanceThreshold", (Number.parseFloat(e.target.value) || 0) * 100)}
                  disabled={true}
                />
                <p className="text-xs text-muted-foreground">Alert when balance falls below this amount</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>Manage your preferred payment methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Payment Method</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Bank Transfer</Badge>
                <Badge variant="secondary">Primary</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Bank transfers are the primary payment method for this platform
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Supported Methods</Label>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Bank Transfer</Badge>
                <Badge variant="outline">Paystack</Badge>
                <Badge variant="outline">Card Payment</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
