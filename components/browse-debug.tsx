"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function BrowseDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    try {
      console.log("Testing browse API...")

      const response = await fetch("/api/tasks?limit=5")
      const data = await response.json()

      setDebugInfo({
        status: response.status,
        success: data.success,
        taskCount: data.tasks?.length || 0,
        firstTask: data.tasks?.[0] || null,
        pagination: data.pagination,
        error: data.error,
        timestamp: new Date().toISOString(),
      })

      console.log("API Response:", data)
    } catch (error) {
      setDebugInfo({
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
    }
    setLoading(false)
  }

  const testDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test")
      const data = await response.json()

      setDebugInfo({
        type: "Database Test",
        ...data,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      setDebugInfo({
        type: "Database Test",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
    }
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Browse Page Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testAPI} disabled={loading} variant="outline">
            Test Tasks API
          </Button>
          <Button onClick={testDatabase} disabled={loading} variant="outline">
            Test Database
          </Button>
        </div>

        {debugInfo && (
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <div>
                  <strong>Test Type:</strong> {debugInfo.type || "Tasks API"}
                </div>
                <div>
                  <strong>Timestamp:</strong> {debugInfo.timestamp}
                </div>

                {debugInfo.status && (
                  <div>
                    <strong>Status:</strong> {debugInfo.status}
                  </div>
                )}

                {debugInfo.success !== undefined && (
                  <div>
                    <strong>Success:</strong> {debugInfo.success ? "✅ Yes" : "❌ No"}
                  </div>
                )}

                {debugInfo.taskCount !== undefined && (
                  <div>
                    <strong>Tasks Found:</strong> {debugInfo.taskCount}
                  </div>
                )}

                {debugInfo.firstTask && (
                  <div>
                    <strong>First Task:</strong>
                    <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                      {JSON.stringify(
                        {
                          id: debugInfo.firstTask.id,
                          title: debugInfo.firstTask.title,
                          category: debugInfo.firstTask.category,
                          created_at: debugInfo.firstTask.created_at,
                          client: debugInfo.firstTask.client,
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                )}

                {debugInfo.error && (
                  <div className="text-red-600">
                    <strong>Error:</strong> {debugInfo.error}
                  </div>
                )}

                {debugInfo.database && (
                  <div>
                    <strong>Database:</strong> {debugInfo.database}
                  </div>
                )}

                {debugInfo.user && (
                  <div>
                    <strong>User:</strong> {debugInfo.user}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
