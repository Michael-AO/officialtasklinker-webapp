import { useEffect, useState } from "react";

export function useDojahScript() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDojahScript = async () => {
      try {
        console.log("[useDojahScript] Starting Dojah script load...");
        
        // Check if Dojah is already available
        const checkDojahAvailable = () => {
          const win = window as any;
          return win.DojahKYC || win.Dojah || win.dojah || win.DOJAH || win.dojahWidget;
        };

        if (checkDojahAvailable()) {
          console.log("[useDojahScript] Dojah already available");
          setLoaded(true);
          return;
        }

        // Check if script element exists
        const existingScript = document.getElementById("dojah-script");
        if (existingScript) {
          console.log("[useDojahScript] Script element exists, waiting for load...");
          // Wait for the script to load
          await waitForDojah(10000);
          return;
        }

        // Create and load the script
        await createScript();
        
      } catch (error) {
        console.error("[useDojahScript] Error loading Dojah script:", error);
        setError("Failed to load Dojah script");
      }
    };

    const createScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        console.log("[useDojahScript] Creating Dojah script...");
        const script = document.createElement("script");
        script.src = "https://widget.dojah.io/widget.js";
        script.async = true;
        script.id = "dojah-script";
        
        script.onload = async () => {
          console.log("[useDojahScript] Script loaded successfully");
          // Wait for Dojah to be available
          await waitForDojah(10000);
          resolve();
        };
        
        script.onerror = (e) => {
          console.error("[useDojahScript] Script failed to load:", e);
          setError("Failed to load Dojah script");
          reject(new Error("Script failed to load"));
        };
        
        document.head.appendChild(script);
      });
    };

    const waitForDojah = (timeoutMs: number): Promise<void> => {
      return new Promise((resolve) => {
        const startTime = Date.now();
        
        const checkDojah = () => {
          const win = window as any;
          if (win.DojahKYC || win.Dojah || win.dojah || win.DOJAH || win.dojahWidget) {
            console.log("[useDojahScript] Dojah available after script load");
            setLoaded(true);
            resolve();
            return;
          }
          
          const elapsed = Date.now() - startTime;
          if (elapsed >= timeoutMs) {
            console.error("[useDojahScript] Dojah failed to initialize within timeout");
            console.log("[useDojahScript] Checking for alternative Dojah objects...");
            
            // Log all window objects that might be Dojah-related
            const win = window as any;
            const dojahKeys = Object.keys(win).filter(key => 
              key.toLowerCase().includes('dojah') || 
              key.toLowerCase().includes('kyc') ||
              key.toLowerCase().includes('widget')
            );
            console.log("[useDojahScript] Found Dojah-related keys:", dojahKeys);
            
            setError("Dojah widget failed to initialize - script loaded but widget not available");
            resolve();
            return;
          }
          
          // Check again in 100ms
          setTimeout(checkDojah, 100);
        };
        
        checkDojah();
      });
    };

    // Start loading
    loadDojahScript();

    return () => {
      // Don't remove script on cleanup to avoid issues
    };
  }, []);

  return { loaded, error };
}
