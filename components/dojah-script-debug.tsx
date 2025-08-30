"use client"

import { useEffect, useState } from "react"
import { useDojahScript } from "@/hooks/useDojahScript"

export function DojahScriptDebug() {
  const { loaded, error } = useDojahScript()
  const [windowDojah, setWindowDojah] = useState<any>(null)
  const [scriptElement, setScriptElement] = useState<HTMLElement | null>(null)
  const [windowKeys, setWindowKeys] = useState<string[]>([])
  const [dojahObjects, setDojahObjects] = useState<any[]>([])

  useEffect(() => {
    const checkDojah = () => {
      const win = window as any
      setWindowDojah(win.DojahKYC)
      setScriptElement(document.getElementById("dojah-script"))
      
      // Check for different possible Dojah objects
      const possibleDojahKeys = [
        'DojahKYC', 'Dojah', 'dojah', 'DOJAH', 'dojahKYC', 'dojah_kyc',
        'DojahWidget', 'dojahWidget', 'DOJAH_WIDGET'
      ]
      
      const foundDojahObjects = possibleDojahKeys
        .filter(key => win[key])
        .map(key => ({ key, value: win[key] }))
      
      setDojahObjects(foundDojahObjects)
      
      // Get all window keys that might be Dojah-related
      const allKeys = Object.keys(win).filter(key => 
        key.toLowerCase().includes('dojah') || 
        key.toLowerCase().includes('kyc') ||
        key.toLowerCase().includes('widget')
      )
      setWindowKeys(allKeys)
    }

    checkDojah()
    const interval = setInterval(checkDojah, 1000)
    return () => clearInterval(interval)
  }, [])

  const tryManualLoad = () => {
    console.log("🔄 Trying manual Dojah script load...")
    
    // Remove existing script if any
    const existingScript = document.getElementById("dojah-script")
    if (existingScript) {
      existingScript.remove()
    }
    
    // Create new script
    const script = document.createElement("script")
    script.src = "https://widget.dojah.io/widget.js"
    script.async = true
    script.id = "dojah-script-manual"
    
    script.onload = () => {
      console.log("✅ Manual script load successful")
      setTimeout(() => {
        const win = window as any
        console.log("Manual load - DojahKYC:", win.DojahKYC)
        console.log("Manual load - Dojah:", win.Dojah)
        console.log("Manual load - All keys:", Object.keys(win).filter(k => k.toLowerCase().includes('dojah')))
      }, 1000)
    }
    
    script.onerror = (e) => {
      console.error("❌ Manual script load failed:", e)
    }
    
    document.body.appendChild(script)
  }

  const tryAlternativeURL = () => {
    console.log("🔄 Trying alternative Dojah script URL...")
    
    const script = document.createElement("script")
    script.src = "https://cdn.dojah.io/widget.js" // Alternative URL
    script.async = true
    script.id = "dojah-script-alt"
    
    script.onload = () => {
      console.log("✅ Alternative script load successful")
      setTimeout(() => {
        const win = window as any
        console.log("Alternative - DojahKYC:", win.DojahKYC)
        console.log("Alternative - Dojah:", win.Dojah)
      }, 1000)
    }
    
    script.onerror = (e) => {
      console.error("❌ Alternative script load failed:", e)
    }
    
    document.body.appendChild(script)
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
      <h3 className="font-semibold">Dojah Script Debug</h3>
      
      <div className="text-sm space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Script Loaded:</strong> {loaded ? "✅ Yes" : "❌ No"}</p>
            <p><strong>Script Error:</strong> {error || "None"}</p>
            <p><strong>Window.DojahKYC:</strong> {windowDojah ? "✅ Available" : "❌ Not Available"}</p>
            <p><strong>Script Element:</strong> {scriptElement ? "✅ Exists" : "❌ Not Found"}</p>
            <p><strong>Script Src:</strong> {scriptElement?.getAttribute("src") || "N/A"}</p>
          </div>
          
          <div>
            <p><strong>Script Element ID:</strong> {scriptElement?.id || "N/A"}</p>
            <p><strong>Script Element Type:</strong> {scriptElement?.tagName || "N/A"}</p>
            <p><strong>Script Element Parent:</strong> {scriptElement?.parentElement?.tagName || "N/A"}</p>
          </div>
        </div>

        {dojahObjects.length > 0 && (
          <div>
            <p><strong>Found Dojah Objects:</strong></p>
            <ul className="ml-4 space-y-1">
              {dojahObjects.map((obj, index) => (
                <li key={index} className="text-green-600">
                  ✅ {obj.key}: {typeof obj.value}
                </li>
              ))}
            </ul>
          </div>
        )}

        {windowKeys.length > 0 && (
          <div>
            <p><strong>Dojah-related Window Keys:</strong></p>
            <ul className="ml-4 space-y-1">
              {windowKeys.map((key, index) => (
                <li key={index} className="text-blue-600">
                  🔍 {key}: {typeof (window as any)[key]}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <p><strong>Manual Tests:</strong></p>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => {
                const win = window as any
                console.log("Window objects:", Object.keys(win).filter(k => k.toLowerCase().includes('dojah')))
                console.log("DojahKYC:", win.DojahKYC)
                console.log("Dojah:", win.Dojah)
                console.log("All window keys:", Object.keys(win).slice(0, 20))
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
            >
              Log Window Objects
            </button>
            
            <button 
              onClick={tryManualLoad}
              className="px-3 py-1 bg-green-500 text-white rounded text-xs"
            >
              Try Manual Load
            </button>
            
            <button 
              onClick={tryAlternativeURL}
              className="px-3 py-1 bg-orange-500 text-white rounded text-xs"
            >
              Try Alternative URL
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
