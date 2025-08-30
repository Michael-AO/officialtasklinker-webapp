import { useDojahScript } from "./useDojahScript";

declare global {
  interface Window {
    DojahKYC: any;
  }
}

export function useDojahModal() {
  const { loaded: scriptLoaded, error: scriptError } = useDojahScript();

  const openDojah = (verificationType: "identity" | "business" = "identity") => {
    if (!scriptLoaded || !window.DojahKYC) {
      console.error("⚠️ Dojah script not loaded yet", { scriptLoaded, scriptError });
      return;
    }

    const dojah = new window.DojahKYC({
      app_id: "6875f7ffcb4d46700c74336e",
      public_key: "test_pk_TNoLXCX4T96k0WdbLnFJGYipd",
      type: "modal", // 👈 important for popup
      config: {
        debug: true,
        aml: true,
        selfie: true,
        pages: verificationType === "business" 
          ? ["government-data", "selfie", "business"] 
          : ["government-data", "selfie"],
      },
      onSuccess: (res: any) => {
        console.log("✅ Verification success:", res);
        // Handle success - you can add a callback here
      },
      onError: (err: any) => {
        console.error("❌ Verification error:", err);
        // Handle error - you can add a callback here
      },
      onClose: () => {
        console.log("🔒 Dojah modal closed");
        // Handle close - you can add a callback here
      },
    });

    dojah.open(); // 👈 opens popup
  };

  return { openDojah, scriptLoaded, scriptError };
}
