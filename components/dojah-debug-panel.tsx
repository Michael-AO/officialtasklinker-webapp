"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Bug, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Code,
  Settings,
  Play,
  Square
} from "lucide-react"

interface DojahDebugInfo {
  scriptLoaded: boolean
  widgetAvailable: boolean
  modalOpen: boolean
  containerExists: boolean
  apiKeyValid: boolean
  lastError?: string
  initializationAttempts: number
}

export function DojahDebugPanel() {
  const [debugInfo, setDebugInfo] = useState<DojahDebugInfo>({
    scriptLoaded: false,
    widgetAvailable: false,
    modalOpen: false,
    containerExists: false,
    apiKeyValid: false,
    initializationAttempts: 0
  })
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const checkDojahStatus = () => {
    const newDebugInfo: DojahDebugInfo = {
      scriptLoaded: !!(window as any).Dojah,
      widgetAvailable: !!(window as any).Dojah?.init,
      modalOpen: !!document.querySelector('[data-state="open"]'),
      containerExists: !!document.getElementById("dojah-widget-container"),
      apiKeyValid: true, // We'll check this separately
      initializationAttempts: debugInfo.initializationAttempts
    }

    setDebugInfo(newDebugInfo)
    addLog(`Status check: Script=${newDebugInfo.scriptLoaded}, Widget=${newDebugInfo.widgetAvailable}, Modal=${newDebugInfo.modalOpen}, Container=${newDebugInfo.containerExists}`)
  }

  const startMonitoring = () => {
    setIsMonitoring(true)
    addLog("Started Dojah monitoring...")
    
    const interval = setInterval(() => {
      if (isMonitoring) {
        checkDojahStatus()
      }
    }, 1000)

    return () => clearInterval(interval)
  }

  const stopMonitoring = () => {
    setIsMonitoring(false)
    addLog("Stopped Dojah monitoring")
  }

  const testDojahInit = () => {
    addLog("Testing Dojah initialization...")
    
    if (!(window as any).Dojah) {
      addLog("ERROR: Dojah not available")
      return
    }

    try {
      const testConfig = {
        appID: "6875f7ffcb4d46700c74336e",
        publicKey: "test_pk_TNoLXCX4T96k0WdbLnFJGYipd",
        type: "custom",
        containerID: "dojah-widget-container",
        config: {
          pages: ["government-data", "selfie"],
        },
        callback: (result: any) => {
          addLog(`CALLBACK: ${JSON.stringify(result)}`)
        },
        onClose: () => {
          addLog("WIDGET CLOSED")
        },
      }

      ;(window as any).Dojah.init(testConfig)
      addLog("SUCCESS: Dojah.init() called successfully")
      setDebugInfo(prev => ({ ...prev, initializationAttempts: prev.initializationAttempts + 1 }))
    } catch (error) {
      addLog(`ERROR: Dojah.init() failed - ${error}`)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  const getStatusColor = (status: boolean) => status ? "text-green-600" : "text-red-600"
  const getStatusIcon = (status: boolean) => status ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-800">🔧 Dojah Debug Panel</CardTitle>
          </div>
          <Badge variant="outline" className="border-blue-300 text-blue-700">
            Debug Mode
          </Badge>
        </div>
        <CardDescription className="text-blue-700">
          Comprehensive debugging for Dojah widget integration issues
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">System Status:</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Script Loaded:</span>
                <div className={`flex items-center gap-1 ${getStatusColor(debugInfo.scriptLoaded)}`}>
                  {getStatusIcon(debugInfo.scriptLoaded)}
                  <span className="text-xs">{debugInfo.scriptLoaded ? "Yes" : "No"}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Widget Available:</span>
                <div className={`flex items-center gap-1 ${getStatusColor(debugInfo.widgetAvailable)}`}>
                  {getStatusIcon(debugInfo.widgetAvailable)}
                  <span className="text-xs">{debugInfo.widgetAvailable ? "Yes" : "No"}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Modal Open:</span>
                <div className={`flex items-center gap-1 ${getStatusColor(debugInfo.modalOpen)}`}>
                  {getStatusIcon(debugInfo.modalOpen)}
                  <span className="text-xs">{debugInfo.modalOpen ? "Yes" : "No"}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Container Exists:</span>
                <div className={`flex items-center gap-1 ${getStatusColor(debugInfo.containerExists)}`}>
                  {getStatusIcon(debugInfo.containerExists)}
                  <span className="text-xs">{debugInfo.containerExists ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">API Configuration:</h4>
            <div className="space-y-2 text-xs">
              <div>
                <strong>App ID:</strong> 6875f7ffcb4d46700c74336e
              </div>
              <div>
                <strong>Public Key:</strong> test_pk_TNoLXCX4T96k0WdbLnFJGYipd
              </div>
              <div>
                <strong>Environment:</strong> Test
              </div>
              <div>
                <strong>Init Attempts:</strong> {debugInfo.initializationAttempts}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            size="sm" 
            variant="outline"
            onClick={checkDojahStatus}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Check Status
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={testDojahInit}
            disabled={!debugInfo.scriptLoaded}
          >
            <Play className="h-3 w-3 mr-1" />
            Test Init
          </Button>
          
          <Button 
            size="sm" 
            variant={isMonitoring ? "destructive" : "outline"}
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
          >
            {isMonitoring ? (
              <>
                <Square className="h-3 w-3 mr-1" />
                Stop Monitor
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1" />
                Start Monitor
              </>
            )}
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={clearLogs}
          >
            <Code className="h-3 w-3 mr-1" />
            Clear Logs
          </Button>
        </div>

        {/* Debug Logs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Debug Logs:</h4>
            <span className="text-xs text-muted-foreground">{logs.length} entries</span>
          </div>
          <div className="bg-black text-green-400 p-3 rounded-lg text-xs font-mono h-40 overflow-y-auto">
            {logs.length === 0 ? (
              <span className="text-gray-500">No logs yet. Start monitoring or perform actions to see logs.</span>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Troubleshooting Tips */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Troubleshooting Tips:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Test API keys have limited functionality - use production keys for full testing</li>
              <li>• Ensure modal is fully open before initializing widget</li>
              <li>• Check browser console for additional error details</li>
              <li>• Verify container element exists before calling Dojah.init()</li>
              <li>• Network issues may prevent script loading</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
