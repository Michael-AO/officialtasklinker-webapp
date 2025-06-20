"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, Palette, Clock, Globe, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function DashboardPreferences() {
  const [preferences, setPreferences] = useState({
    compactMode: false,
    showWelcomeMessage: true,
    autoRefresh: true,
    refreshInterval: 30, // seconds
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12h",
    currency: "NGN",
    timezone: "Africa/Lagos",
    showNotifications: true,
    showQuickActions: true,
    defaultView: "overview",
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Dashboard Preferences Saved",
        description: "Your dashboard preferences have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save dashboard preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updatePreference = (key: string, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            Dashboard Preferences
          </h2>
          <p className="text-muted-foreground">Customize your dashboard layout and display options</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Display Settings
            </CardTitle>
            <CardDescription>Configure how your dashboard looks and feels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compact Mode</Label>
                <p className="text-xs text-muted-foreground">Use a more compact layout to show more information</p>
              </div>
              <Switch
                checked={preferences.compactMode}
                onCheckedChange={(checked) => updatePreference("compactMode", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Welcome Message</Label>
                <p className="text-xs text-muted-foreground">Display welcome message on dashboard</p>
              </div>
              <Switch
                checked={preferences.showWelcomeMessage}
                onCheckedChange={(checked) => updatePreference("showWelcomeMessage", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Notifications</Label>
                <p className="text-xs text-muted-foreground">Display notification panel on dashboard</p>
              </div>
              <Switch
                checked={preferences.showNotifications}
                onCheckedChange={(checked) => updatePreference("showNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Quick Actions</Label>
                <p className="text-xs text-muted-foreground">Display quick action buttons</p>
              </div>
              <Switch
                checked={preferences.showQuickActions}
                onCheckedChange={(checked) => updatePreference("showQuickActions", checked)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="defaultView">Default Dashboard View</Label>
              <Select value={preferences.defaultView} onValueChange={(value) => updatePreference("defaultView", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="tasks">Tasks</SelectItem>
                  <SelectItem value="escrow">Escrow</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data Refresh Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Data Refresh
            </CardTitle>
            <CardDescription>Configure how often dashboard data is updated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Refresh</Label>
                <p className="text-xs text-muted-foreground">Automatically refresh dashboard data</p>
              </div>
              <Switch
                checked={preferences.autoRefresh}
                onCheckedChange={(checked) => updatePreference("autoRefresh", checked)}
              />
            </div>

            {preferences.autoRefresh && (
              <div className="space-y-2">
                <Label htmlFor="refreshInterval">Refresh Interval</Label>
                <Select
                  value={preferences.refreshInterval.toString()}
                  onValueChange={(value) => updatePreference("refreshInterval", Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Format Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Format Settings
            </CardTitle>
            <CardDescription>Configure date, time, and currency formats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select value={preferences.dateFormat} onValueChange={(value) => updatePreference("dateFormat", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select value={preferences.timeFormat} onValueChange={(value) => updatePreference("timeFormat", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12 Hour</SelectItem>
                  <SelectItem value="24h">24 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={preferences.currency} onValueChange={(value) => updatePreference("currency", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="GBP">British Pound (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={preferences.timezone} onValueChange={(value) => updatePreference("timezone", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Lagos">Lagos (WAT)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">New York (EST)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Current Settings Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Current Settings</CardTitle>
            <CardDescription>Overview of your current dashboard configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Layout:</span>
              <Badge variant="outline">{preferences.compactMode ? "Compact" : "Standard"}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Default View:</span>
              <Badge variant="outline" className="capitalize">
                {preferences.defaultView}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Auto Refresh:</span>
              <Badge className={preferences.autoRefresh ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {preferences.autoRefresh ? `${preferences.refreshInterval}s` : "Disabled"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Format:</span>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">
                  {preferences.dateFormat}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {preferences.timeFormat}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Currency:</span>
              <Badge variant="outline">{preferences.currency}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
