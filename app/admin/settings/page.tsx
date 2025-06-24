"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Save, Shield, Bell, DollarSign, Users, Building2, X, Plus, Download, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    // Platform Settings
    platformName: "Tasklinkers",
    platformDescription: "Connect with talented freelancers and clients",
    maintenanceMode: false,
    registrationEnabled: true,

    // Payment Settings
    platformFeeFreelancer: 5,
    platformFeeClient: 3,
    minimumWithdrawal: 1000,
    paymentMethods: ["paystack", "bank_transfer"],

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,

    // Security Settings
    twoFactorRequired: false,
    sessionTimeout: 30,
    passwordMinLength: 8,

    // User Settings
    autoVerifyUsers: false,
    maxTasksPerUser: 50,
    profileCompletionRequired: true,
  })

  // Company Settings State
  const [companyData, setCompanyData] = useState({
    // Basic Company Info
    name: "Tasklinkers",
    tagline: "Connect with talented freelancers and clients",
    description: "A platform that connects businesses with skilled freelancers for project-based work.",
    website: "https://tasklinkers.com",
    email: "hello@tasklinkers.com",
    phone: "+234 123 456 7890",

    // Address
    address: "123 Business District, Victoria Island",
    city: "Lagos",
    state: "Lagos State",
    country: "Nigeria",
    postalCode: "101001",

    // Bank Account Details
    bankName: "",
    accountNumber: "",
    accountName: "",
    remittanceDay: "friday",
    minimumRemittanceAmount: 5000,
    autoRemittanceEnabled: false,
    remittanceNotifications: true,

    // Business Details
    registrationNumber: "RC123456789",
    taxId: "TIN987654321",
    businessType: "technology",
    foundedYear: "2023",

    // Escrow Configuration
    escrowFeePercentage: 2.5,
    minimumEscrowAmount: 1000,
    maximumEscrowAmount: 10000000,
    autoReleaseEnabled: true,
    autoReleaseDays: 7,
    disputeResolutionEnabled: true,

    // Features
    features: ["Escrow Protection", "Real-time Messaging", "Secure Payments", "Dispute Resolution"],
    newFeature: "",

    // Social Media
    socialMedia: {
      twitter: "@tasklinkers",
      linkedin: "company/tasklinkers",
      facebook: "tasklinkers",
      instagram: "@tasklinkers",
    },

    // Settings
    emailVerificationRequired: true,
    profileVerificationRequired: false,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [pendingRevenue, setPendingRevenue] = useState(0)

  // Load settings on component mount
  useEffect(() => {
    loadSettings()
    loadPendingRevenue()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }))
        }
        if (data.companyData) {
          setCompanyData((prev) => ({ ...prev, ...data.companyData }))
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadPendingRevenue = async () => {
    try {
      const response = await fetch("/api/admin/revenue/pending")
      if (response.ok) {
        const data = await response.json()
        setPendingRevenue(data.amount || 0)
      }
    } catch (error) {
      console.error("Error loading pending revenue:", error)
    }
  }

  const handleManualWithdrawal = async () => {
    if (!companyData.bankName || !companyData.accountNumber || !companyData.accountName) {
      toast({
        title: "Bank Account Required",
        description: "Please configure your company bank account first.",
        variant: "destructive",
      })
      return
    }

    if (pendingRevenue < companyData.minimumRemittanceAmount) {
      toast({
        title: "Insufficient Amount",
        description: `Minimum withdrawal amount is ₦${companyData.minimumRemittanceAmount.toLocaleString()}`,
        variant: "destructive",
      })
      return
    }

    setIsWithdrawing(true)
    try {
      const response = await fetch("/api/admin/revenue/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: pendingRevenue,
          bankName: companyData.bankName,
          accountNumber: companyData.accountNumber,
          accountName: companyData.accountName,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({
          title: "Withdrawal Initiated",
          description: `₦${pendingRevenue.toLocaleString()} withdrawal has been initiated. Reference: ${result.reference}`,
        })
        // Refresh pending revenue
        loadPendingRevenue()
      } else {
        throw new Error(result.message || "Withdrawal failed")
      }
    } catch (error) {
      console.error("Error initiating withdrawal:", error)
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsWithdrawing(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings,
          companyData,
        }),
      })

      if (response.ok) {
        toast({
          title: "Settings saved",
          description: "All settings have been updated successfully.",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error saving settings",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const updateCompanyField = (field: string, value: any) => {
    setCompanyData((prev) => ({ ...prev, [field]: value }))
  }

  const updateSocialMedia = (platform: string, value: string) => {
    setCompanyData((prev) => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [platform]: value },
    }))
  }

  const addFeature = () => {
    if (companyData.newFeature.trim() && !companyData.features.includes(companyData.newFeature.trim())) {
      setCompanyData({
        ...companyData,
        features: [...companyData.features, companyData.newFeature.trim()],
        newFeature: "",
      })
    }
  }

  const removeFeature = (featureToRemove: string) => {
    setCompanyData({
      ...companyData,
      features: companyData.features.filter((feature) => feature !== featureToRemove),
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Platform Settings</h1>
          <p className="text-muted-foreground">Configure platform-wide settings and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          {/* Basic Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>Basic information about your company</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyData.name}
                    onChange={(e) => updateCompanyField("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={companyData.tagline}
                    onChange={(e) => updateCompanyField("tagline", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  value={companyData.description}
                  onChange={(e) => updateCompanyField("description", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={companyData.website}
                    onChange={(e) => updateCompanyField("website", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companyData.email}
                    onChange={(e) => updateCompanyField("email", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={companyData.phone}
                    onChange={(e) => updateCompanyField("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="foundedYear">Founded Year</Label>
                  <Input
                    id="foundedYear"
                    value={companyData.foundedYear}
                    onChange={(e) => updateCompanyField("foundedYear", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Business Address</CardTitle>
              <CardDescription>Your company's registered business address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={companyData.address}
                  onChange={(e) => updateCompanyField("address", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={companyData.city}
                    onChange={(e) => updateCompanyField("city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={companyData.state}
                    onChange={(e) => updateCompanyField("state", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={companyData.country} onValueChange={(value) => updateCompanyField("country", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nigeria">Nigeria</SelectItem>
                      <SelectItem value="Ghana">Ghana</SelectItem>
                      <SelectItem value="Kenya">Kenya</SelectItem>
                      <SelectItem value="South Africa">South Africa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={companyData.postalCode}
                    onChange={(e) => updateCompanyField("postalCode", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Bank Account */}
          <Card>
            <CardHeader>
              <CardTitle>Company Bank Account</CardTitle>
              <CardDescription>
                Configure your company's bank account for receiving escrow fees and remittances
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Select
                    value={companyData.bankName || ""}
                    onValueChange={(value) => updateCompanyField("bankName", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="access-bank">Access Bank</SelectItem>
                      <SelectItem value="gtbank">Guaranty Trust Bank (GTBank)</SelectItem>
                      <SelectItem value="zenith-bank">Zenith Bank</SelectItem>
                      <SelectItem value="first-bank">First Bank of Nigeria</SelectItem>
                      <SelectItem value="uba">United Bank for Africa (UBA)</SelectItem>
                      <SelectItem value="fidelity-bank">Fidelity Bank</SelectItem>
                      <SelectItem value="union-bank">Union Bank</SelectItem>
                      <SelectItem value="sterling-bank">Sterling Bank</SelectItem>
                      <SelectItem value="stanbic-ibtc">Stanbic IBTC Bank</SelectItem>
                      <SelectItem value="fcmb">First City Monument Bank (FCMB)</SelectItem>
                      <SelectItem value="ecobank">Ecobank Nigeria</SelectItem>
                      <SelectItem value="wema-bank">Wema Bank</SelectItem>
                      <SelectItem value="polaris-bank">Polaris Bank</SelectItem>
                      <SelectItem value="keystone-bank">Keystone Bank</SelectItem>
                      <SelectItem value="providus-bank">Providus Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={companyData.accountNumber || ""}
                    onChange={(e) => updateCompanyField("accountNumber", e.target.value)}
                    placeholder="Enter 10-digit account number"
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={companyData.accountName || ""}
                    onChange={(e) => updateCompanyField("accountName", e.target.value)}
                    placeholder="Account holder name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remittanceDay">Weekly Remittance Day</Label>
                  <Select
                    value={companyData.remittanceDay || "friday"}
                    onValueChange={(value) => updateCompanyField("remittanceDay", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="tuesday">Tuesday</SelectItem>
                      <SelectItem value="wednesday">Wednesday</SelectItem>
                      <SelectItem value="thursday">Thursday</SelectItem>
                      <SelectItem value="friday">Friday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumRemittance">Minimum Remittance Amount (₦)</Label>
                <Input
                  id="minimumRemittance"
                  type="number"
                  value={companyData.minimumRemittanceAmount || 5000}
                  onChange={(e) => updateCompanyField("minimumRemittanceAmount", Number.parseInt(e.target.value))}
                  placeholder="5000"
                />
                <p className="text-sm text-muted-foreground">
                  Minimum amount required before automatic remittance is triggered
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Remittance Enabled</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically transfer escrow fees to bank account weekly
                    </p>
                  </div>
                  <Switch
                    checked={companyData.autoRemittanceEnabled || false}
                    onCheckedChange={(checked) => updateCompanyField("autoRemittanceEnabled", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Remittance Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send email notifications for successful remittances</p>
                  </div>
                  <Switch
                    checked={companyData.remittanceNotifications || true}
                    onCheckedChange={(checked) => updateCompanyField("remittanceNotifications", checked)}
                  />
                </div>
              </div>

              {/* Manual Withdrawal Section */}
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-orange-900">Manual Withdrawal</h4>
                    <p className="text-sm text-orange-800">Withdraw pending revenue immediately via Paystack</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-orange-700">Pending Revenue</p>
                    <p className="text-lg font-bold text-orange-900">₦{pendingRevenue.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleManualWithdrawal}
                    disabled={
                      isWithdrawing ||
                      !companyData.bankName ||
                      !companyData.accountNumber ||
                      !companyData.accountName ||
                      pendingRevenue < companyData.minimumRemittanceAmount
                    }
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {isWithdrawing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Withdraw Now
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadPendingRevenue}
                    className="text-orange-700 border-orange-300"
                  >
                    Refresh Balance
                  </Button>
                </div>

                {pendingRevenue < companyData.minimumRemittanceAmount && (
                  <p className="text-xs text-orange-600 mt-2">
                    Minimum withdrawal amount: ₦{companyData.minimumRemittanceAmount.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Remittance Schedule</h4>
                <div className="text-sm text-green-800 space-y-1">
                  <p>
                    • <strong>Frequency:</strong> Every {companyData.remittanceDay || "Friday"}
                  </p>
                  <p>
                    • <strong>Time:</strong> 10:00 AM WAT
                  </p>
                  <p>
                    • <strong>Minimum Amount:</strong> ₦{(companyData.minimumRemittanceAmount || 5000).toLocaleString()}
                  </p>
                  <p>
                    • <strong>Processing Time:</strong> 1-2 business days
                  </p>
                  <p>
                    • <strong>Status:</strong> {companyData.autoRemittanceEnabled ? "✅ Active" : "❌ Disabled"}
                  </p>
                </div>
              </div>

              {companyData.accountNumber && companyData.bankName && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Connected Account</h4>
                  <div className="text-sm text-blue-800">
                    <p>
                      <strong>Bank:</strong>{" "}
                      {companyData.bankName.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                    <p>
                      <strong>Account:</strong> {companyData.accountNumber}
                    </p>
                    <p>
                      <strong>Name:</strong> {companyData.accountName}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Escrow Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Escrow Configuration</CardTitle>
              <CardDescription>Configure escrow service settings and fees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="escrowFee">Escrow Service Fee (%)</Label>
                  <Input
                    id="escrowFee"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={companyData.escrowFeePercentage}
                    onChange={(e) => updateCompanyField("escrowFeePercentage", Number.parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Fee deducted from freelancer's payment and transferred to company account
                  </p>
                  <p className="text-xs text-orange-600">
                    Note: This fee is automatically remitted to your connected bank account weekly
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minEscrow">Minimum Amount (₦)</Label>
                  <Input
                    id="minEscrow"
                    type="number"
                    value={companyData.minimumEscrowAmount}
                    onChange={(e) => updateCompanyField("minimumEscrowAmount", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxEscrow">Maximum Amount (₦)</Label>
                  <Input
                    id="maxEscrow"
                    type="number"
                    value={companyData.maximumEscrowAmount}
                    onChange={(e) => updateCompanyField("maximumEscrowAmount", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="autoReleaseDays">Auto-Release Days</Label>
                <Input
                  id="autoReleaseDays"
                  type="number"
                  value={companyData.autoReleaseDays}
                  onChange={(e) => updateCompanyField("autoReleaseDays", Number.parseInt(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Number of days after which funds are automatically released if no disputes
                </p>
              </div>

              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border">
                <h4 className="font-medium text-blue-900">Escrow Fee Structure</h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>
                    • <strong>Fee Source:</strong> Deducted from freelancer's final payment
                  </p>
                  <p>
                    • <strong>Fee Destination:</strong> Transferred to company escrow account
                  </p>
                  <p>
                    • <strong>Remittance:</strong> Weekly automatic transfer to connected bank account
                  </p>
                  <p>
                    • <strong>Example:</strong> Task budget ₦10,000 → Freelancer receives ₦
                    {(10000 * (1 - companyData.escrowFeePercentage / 100)).toLocaleString()}, Company fee ₦
                    {((10000 * companyData.escrowFeePercentage) / 100).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Release Enabled</Label>
                    <p className="text-sm text-muted-foreground">Automatically release funds after specified days</p>
                  </div>
                  <Switch
                    checked={companyData.autoReleaseEnabled}
                    onCheckedChange={(checked) => updateCompanyField("autoReleaseEnabled", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Dispute Resolution</Label>
                    <p className="text-sm text-muted-foreground">Enable dispute resolution system</p>
                  </div>
                  <Switch
                    checked={companyData.disputeResolutionEnabled}
                    onCheckedChange={(checked) => updateCompanyField("disputeResolutionEnabled", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Features */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Features</CardTitle>
              <CardDescription>Highlight key features of your platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Features</Label>
                <div className="flex flex-wrap gap-2">
                  {companyData.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                      {feature}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeFeature(feature)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  value={companyData.newFeature}
                  onChange={(e) => updateCompanyField("newFeature", e.target.value)}
                  placeholder="Add a new feature"
                  onKeyPress={(e) => e.key === "Enter" && addFeature()}
                />
                <Button onClick={addFeature} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>Your company's social media presence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={companyData.socialMedia.twitter}
                    onChange={(e) => updateSocialMedia("twitter", e.target.value)}
                    placeholder="@username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={companyData.socialMedia.linkedin}
                    onChange={(e) => updateSocialMedia("linkedin", e.target.value)}
                    placeholder="company/name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={companyData.socialMedia.facebook}
                    onChange={(e) => updateSocialMedia("facebook", e.target.value)}
                    placeholder="page-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={companyData.socialMedia.instagram}
                    onChange={(e) => updateSocialMedia("instagram", e.target.value)}
                    placeholder="@username"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Platform Configuration
              </CardTitle>
              <CardDescription>Basic platform settings and information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Platform Name</Label>
                  <Input
                    id="platformName"
                    value={settings.platformName}
                    onChange={(e) => updateSetting("platformName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting("sessionTimeout", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="platformDescription">Platform Description</Label>
                <Textarea
                  id="platformDescription"
                  value={settings.platformDescription}
                  onChange={(e) => updateSetting("platformDescription", e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable to temporarily disable platform access</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => updateSetting("maintenanceMode", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>User Registration</Label>
                  <p className="text-sm text-muted-foreground">Allow new users to register on the platform</p>
                </div>
                <Switch
                  checked={settings.registrationEnabled}
                  onCheckedChange={(checked) => updateSetting("registrationEnabled", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment Configuration
              </CardTitle>
              <CardDescription>Configure payment processing and fees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platformFeeFreelancer">Freelancer Fee (%)</Label>
                  <Input
                    id="platformFeeFreelancer"
                    type="number"
                    value={settings.platformFeeFreelancer}
                    onChange={(e) => updateSetting("platformFeeFreelancer", Number.parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platformFeeClient">Client Fee (%)</Label>
                  <Input
                    id="platformFeeClient"
                    type="number"
                    value={settings.platformFeeClient}
                    onChange={(e) => updateSetting("platformFeeClient", Number.parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumWithdrawal">Minimum Withdrawal (₦)</Label>
                  <Input
                    id="minimumWithdrawal"
                    type="number"
                    value={settings.minimumWithdrawal}
                    onChange={(e) => updateSetting("minimumWithdrawal", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethods">Enabled Payment Methods</Label>
                <Select
                  value={settings.paymentMethods[0]}
                  onValueChange={(value) => updateSetting("paymentMethods", [value])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paystack">Paystack</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="flutterwave">Flutterwave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure platform notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send email notifications to users</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send SMS notifications for important updates</p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => updateSetting("smsNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send browser push notifications</p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => updateSetting("pushNotifications", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure platform security and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => updateSetting("passwordMinLength", Number.parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting("sessionTimeout", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Force all users to enable 2FA</p>
                </div>
                <Switch
                  checked={settings.twoFactorRequired}
                  onCheckedChange={(checked) => updateSetting("twoFactorRequired", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>Configure user registration and verification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxTasksPerUser">Maximum Tasks Per User</Label>
                <Input
                  id="maxTasksPerUser"
                  type="number"
                  value={settings.maxTasksPerUser}
                  onChange={(e) => updateSetting("maxTasksPerUser", Number.parseInt(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Verify New Users</Label>
                  <p className="text-sm text-muted-foreground">Automatically verify new user accounts</p>
                </div>
                <Switch
                  checked={settings.autoVerifyUsers}
                  onCheckedChange={(checked) => updateSetting("autoVerifyUsers", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Profile Completion</Label>
                  <p className="text-sm text-muted-foreground">
                    Users must complete their profile before posting tasks
                  </p>
                </div>
                <Switch
                  checked={settings.profileCompletionRequired}
                  onCheckedChange={(checked) => updateSetting("profileCompletionRequired", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
