'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, Info, Loader2, RefreshCw } from 'lucide-react'

export default function DebugDojahPage() {
  const [sdkStatus, setSdkStatus] = useState<'checking' | 'loaded' | 'error'>('checking')
  const [sdkDetails, setSdkDetails] = useState<any>({})
  const [scriptStatus, setScriptStatus] = useState<any>({})
  const [environmentVars, setEnvironmentVars] = useState<any>({})

  useEffect(() => {
    checkDojahStatus()
    checkEnvironmentVariables()
  }, [])

  const checkDojahStatus = () => {
    setSdkStatus('checking')
    
    // Check for Dojah objects on window
    const win = window as any
    const dojahObjects = {
      'window.Dojah': win.Dojah,
      'window.dojahWidget': win.dojahWidget,
      'window.DojahKYC': win.DojahKYC,
      'window.dojah': win.dojah,
      'window.DOJAH': win.DOJAH
    }
    
    setSdkDetails(dojahObjects)
    
    // Check if any Dojah object exists
    if (win.Dojah || win.dojahWidget || win.DojahKYC || win.dojah || win.DOJAH) {
      setSdkStatus('loaded')
    } else {
      setSdkStatus('error')
    }
  }

  const checkEnvironmentVariables = () => {
    setEnvironmentVars({
      'NEXT_PUBLIC_DOJAH_APP_ID': process.env.NEXT_PUBLIC_DOJAH_APP_ID || 'Not set',
      'NEXT_PUBLIC_DOJAH_PUBLIC_KEY': process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY ? 
        `${process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY.substring(0, 20)}...` : 'Not set',
      'NEXT_PUBLIC_DOJAH_ENVIRONMENT': process.env.NEXT_PUBLIC_DOJAH_ENVIRONMENT || 'Not set'
    })
  }

  const checkScriptStatus = () => {
    const script = document.getElementById('dojah-script')
    const allScripts = document.querySelectorAll('script[src*="dojah"]')
    
    setScriptStatus({
      'dojah-script element': script ? 'Found' : 'Not found',
      'dojah-script src': script?.getAttribute('src') || 'N/A',
      'All dojah scripts': Array.from(allScripts).map(s => s.getAttribute('src')),
      'Script count': allScripts.length
    })
  }

  const manuallyLoadScript = () => {
    // Remove existing script if any
    const existingScript = document.getElementById('dojah-script')
    if (existingScript) {
      existingScript.remove()
    }
    
    // Create new script
    const script = document.createElement('script')
    script.src = 'https://widget.dojah.io/widget.js'
    script.async = true
    script.id = 'dojah-script'
    
    script.onload = () => {
      console.log('✅ Dojah script loaded manually')
      checkDojahStatus()
      checkScriptStatus()
    }
    
    script.onerror = () => {
      console.error('❌ Failed to load Dojah script manually')
    }
    
    document.head.appendChild(script)
    checkScriptStatus()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loaded':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'loaded':
        return <Badge className="bg-green-100 text-green-800">✅ Loaded</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">❌ Error</Badge>
      default:
        return <Badge className="bg-blue-100 text-blue-800">⏳ Checking</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">🔍 Dojah SDK Debug</h1>
        <p className="text-xl text-gray-600">
          Debug and troubleshoot Dojah SDK loading issues
        </p>
      </div>

      {/* SDK Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(sdkStatus)}
            SDK Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium">Current Status:</span>
            {getStatusBadge(sdkStatus)}
          </div>
          
          <div className="space-y-2">
            {Object.entries(sdkDetails).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="font-mono text-sm">{key}:</span>
                <span className={value ? 'text-green-600 font-medium' : 'text-red-600'}>
                  {value ? 'Available' : 'Not available'}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <Button onClick={checkDojahStatus} variant="outline" className="mr-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Recheck Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>
            Check if Dojah environment variables are properly set
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(environmentVars).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="font-mono text-sm">{key}:</span>
                <span className={value !== 'Not set' ? 'text-green-600 font-medium' : 'text-red-600'}>
                  {value}
                </span>
              </div>
            ))}
          </div>
          
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Make sure these environment variables are set in your <code>.env.local</code> file
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Script Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Script Status</CardTitle>
          <CardDescription>
            Check Dojah script loading status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(scriptStatus).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="font-mono text-sm">{key}:</span>
                <span className="text-gray-700">
                  {Array.isArray(value) ? value.join(', ') : value}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <Button onClick={checkScriptStatus} variant="outline" className="mr-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Scripts
            </Button>
            <Button onClick={manuallyLoadScript} variant="outline">
              <Loader2 className="h-4 w-4 mr-2" />
              Load Script Manually
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold mt-0.5">
                1
              </div>
              <div>
                <h4 className="font-medium">Check Environment Variables</h4>
                <p className="text-sm text-gray-600">
                  Ensure <code>NEXT_PUBLIC_DOJAH_APP_ID</code> and <code>NEXT_PUBLIC_DOJAH_PUBLIC_KEY</code> are set in <code>.env.local</code>
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold mt-0.5">
                2
              </div>
              <div>
                <h4 className="font-medium">Check Network</h4>
                <p className="text-sm text-gray-600">
                  Ensure your domain can access <code>https://widget.dojah.io/widget.js</code>
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold mt-0.5">
                3
              </div>
              <div>
                <h4 className="font-medium">Check Console</h4>
                <p className="text-sm text-gray-600">
                  Look for any JavaScript errors or network failures in the browser console
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold mt-0.5">
                4
              </div>
              <div>
                <h4 className="font-medium">Domain Whitelist</h4>
                <p className="text-sm text-gray-600">
                  Ensure your domain is whitelisted in the Dojah dashboard
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
