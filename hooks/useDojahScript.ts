import { useEffect, useState } from "react";

export function useDojahScript() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Temporarily disable script loading to prevent conflicts with React SDK
    console.log("[useDojahScript] Script loading disabled - using React SDK instead");
    setLoaded(false);
    setError("Script loading disabled - using React SDK");
    
    // Comment out the original script loading logic to prevent conflicts
    /*
    // Check if Dojah is already available (try different possible names)
    const checkDojahAvailable = () => {
      const win = window as any;
      return win.DojahKYC || win.Dojah || win.dojah || win.DOJAH;
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
      // Wait a bit for the script to load if it exists
      setTimeout(() => {
        if (checkDojahAvailable()) {
          console.log("[useDojahScript] Dojah loaded from existing script");
          setLoaded(true);
        } else {
          console.log("[useDojahScript] Existing script not loaded yet, creating new one");
          createScript();
        }
      }, 2000); // Increased timeout
      return;
    }

    createScript();

    function createScript() {
      console.log("[useDojahScript] Creating Dojah script...");
      const script = document.createElement("script");
      script.src = "https://widget.dojah.io/widget.js";
      script.async = true;
      script.id = "dojah-script";
      
      script.onload = () => {
        console.log("[useDojahScript] Script loaded successfully");
        // Wait a bit more for Dojah to be available
        setTimeout(() => {
          if (checkDojahAvailable()) {
            console.log("[useDojahScript] Dojah available after script load");
            setLoaded(true);
          } else {
            console.error("[useDojahScript] Script loaded but Dojah not available");
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
          }
        }, 1000); // Increased timeout
      };
      
      script.onerror = (e) => {
        console.error("[useDojahScript] Script failed to load:", e);
        setError("Failed to load Dojah script");
      };
      
      document.body.appendChild(script);
    }
    */

    return () => {
      // Don't remove script on cleanup to avoid issues
    };
  }, []);

  return { loaded, error };
}
