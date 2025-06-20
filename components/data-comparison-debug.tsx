// Debug component to compare mock vs real data
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRealProfileData, useRealDashboardData, useRealSettingsData } from "@/hooks/use-real-data"

export function DataComparisonDebug() {
  const [showDebug, setShowDebug] = useState(false)
  const profileData = useRealProfileData()
  const dashboardData = useRealDashboardData()
  const settingsData = useRealSettingsData()

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setShowDebug(true)}
          variant="outline"
          size="sm"
          className="bg-blue-50 border-blue-200 text-blue-700"
        >
          🔍 Debug Data
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Database Data Debug</CardTitle>
            <Button onClick={() => setShowDebug(false)} variant="outline" size="sm">
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Data */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              Profile Data
              <Badge variant={profileData.profile ? "default" : "secondary"}>
                {profileData.profile ? "✅ Has Data" : "❌ No Data"}
              </Badge>
            </h3>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <pre>{JSON.stringify(profileData, null, 2)}</pre>
            </div>
          </div>

          {/* Dashboard Data */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              Dashboard Data
              <Badge variant={dashboardData.stats ? "default" : "secondary"}>
                {dashboardData.stats ? "✅ Has Data" : "❌ No Data"}
              </Badge>
            </h3>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <pre>{JSON.stringify(dashboardData, null, 2)}</pre>
            </div>
          </div>

          {/* Settings Data */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              Settings Data
              <Badge variant={settingsData.notifications || settingsData.privacy ? "default" : "secondary"}>
                {settingsData.notifications || settingsData.privacy ? "✅ Has Data" : "❌ No Data"}
              </Badge>
            </h3>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <pre>{JSON.stringify(settingsData, null, 2)}</pre>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Quick Actions</h3>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" onClick={() => window.open("/dashboard/profile", "_blank")}>
                Open Profile
              </Button>
              <Button size="sm" onClick={() => window.open("/dashboard", "_blank")}>
                Open Dashboard
              </Button>
              <Button size="sm" onClick={() => window.open("/dashboard/settings", "_blank")}>
                Open Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


