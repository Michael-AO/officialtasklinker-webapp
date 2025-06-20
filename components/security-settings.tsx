"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Lock, Shield, Key, Smartphone, Mail, AlertTriangle } from "lucide-react"
import { PinSetupModal } from "@/components/pin-setup-modal"
import { toast } from "@/hooks/use-toast"

export function SecuritySettings() {
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinModalMode, setPinModalMode] = useState<"setup" | "change" | "verify">("setup")
  const [hasPinSetup, setHasPinSetup] = useState(false) // In real app, fetch from user data
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)

  const handlePinSetup = () => {
    setPinModalMode("setup")
    setShowPinModal(true)
  }

  const handlePinChange = () => {
    setPinModalMode("change")
    setShowPinModal(true)
  }

  const handlePinModalClose = () => {
    setShowPinModal(false)
    // In a real app, you might want to refresh user data here
    setHasPinSetup(true) // Mock setting PIN as setup
  }

  const handleTwoFactorToggle = async (enabled: boolean) => {
    try {
      // In a real app, make API call to enable/disable 2FA
      setTwoFactorEnabled(enabled)
      toast({
        title: enabled ? "2FA Enabled" : "2FA Disabled",
        description: enabled
          ? "Two-factor authentication has been enabled for your account."
          : "Two-factor authentication has been disabled.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update two-factor authentication settings.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Security Settings
        </h2>
        <p className="text-muted-foreground">Manage your account security and authentication preferences</p>
      </div>

      {/* Withdrawal PIN */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Withdrawal PIN
          </CardTitle>
          <CardDescription>Set up a 4-digit PIN to secure your withdrawal requests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">PIN Status</p>
                {hasPinSetup ? (
                  <Badge className="bg-green-100 text-green-800">
                    <Key className="h-3 w-3 mr-1" />
                    Configured
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Not Set
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {hasPinSetup
                  ? "Your withdrawal PIN is active and protecting your account"
                  : "Set up a PIN to secure your withdrawal requests"}
              </p>
            </div>
            <div className="flex gap-2">
              {hasPinSetup ? (
                <Button variant="outline" onClick={handlePinChange}>
                  Change PIN
                </Button>
              ) : (
                <Button onClick={handlePinSetup}>Setup PIN</Button>
              )}
            </div>
          </div>

          {!hasPinSetup && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">PIN Required for Withdrawals</p>
                  <p>You must set up a withdrawal PIN before you can request any withdrawals from your account.</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">2FA Status</p>
                {twoFactorEnabled ? (
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                ) : (
                  <Badge variant="outline">Disabled</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {twoFactorEnabled
                  ? "Your account is protected with two-factor authentication"
                  : "Enable 2FA for enhanced account security"}
              </p>
            </div>
            <Switch checked={twoFactorEnabled} onCheckedChange={handleTwoFactorToggle} />
          </div>

          {twoFactorEnabled && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium">2FA Active</p>
                  <p>You'll be prompted for a verification code when logging in from new devices.</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Security Notifications
          </CardTitle>
          <CardDescription>Choose how you want to be notified about security events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive security alerts and login notifications via email
                </p>
              </div>
              <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive critical security alerts via SMS</p>
              </div>
              <Switch id="sms-notifications" checked={smsNotifications} onCheckedChange={setSmsNotifications} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Security Best Practices</CardTitle>
          <CardDescription>Follow these tips to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-sm">Use a strong, unique password</p>
                <p className="text-sm text-muted-foreground">
                  Choose a password that's at least 12 characters long and includes a mix of letters, numbers, and
                  symbols.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-sm">Keep your PIN confidential</p>
                <p className="text-sm text-muted-foreground">
                  Never share your withdrawal PIN with anyone. We will never ask for your PIN via email or phone.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-sm">Monitor your account regularly</p>
                <p className="text-sm text-muted-foreground">
                  Check your account activity frequently and report any suspicious transactions immediately.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-sm">Log out from shared devices</p>
                <p className="text-sm text-muted-foreground">
                  Always log out when using public or shared computers to protect your account.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PIN Setup Modal */}
      <PinSetupModal isOpen={showPinModal} onClose={handlePinModalClose} mode={pinModalMode} />
    </div>
  )
}
