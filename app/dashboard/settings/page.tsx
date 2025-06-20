"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BankAccountManagement } from "@/components/bank-account-management"
import { SecuritySettings } from "@/components/security-settings"
import { PaymentSettings } from "@/components/payment-settings"
import { DashboardPreferences } from "@/components/dashboard-preferences"
import { Settings, CreditCard, Lock, LayoutDashboard, DollarSign } from "lucide-react"

export default function DashboardSettingsPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("security")

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["security", "payment", "bank-accounts", "dashboard"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Dashboard Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your dashboard preferences, payment settings, and security options
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="bank-accounts" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Bank Accounts
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-0">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="payment" className="space-y-0">
          <PaymentSettings />
        </TabsContent>

        <TabsContent value="bank-accounts" className="space-y-0">
          <BankAccountManagement />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-0">
          <DashboardPreferences />
        </TabsContent>
      </Tabs>
    </div>
  )
}
