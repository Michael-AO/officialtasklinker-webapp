import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { EscrowProvider } from "@/contexts/escrow-context"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TaskLinker - Connect, Complete, Earn",
  description: "A platform connecting freelancers with clients for task completion and secure payments",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://widget.dojah.io/widget.js" async></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Check if Dojah script loads
              (function() {
                console.log("🔍 Checking Dojah script loading...");
                
                // Check if script is already loaded
                if (window.Dojah) {
                  console.log("✅ Dojah already available");
                  return;
                }
                
                // Wait for script to load
                let attempts = 0;
                const checkDojah = () => {
                  attempts++;
                  console.log("⏳ Checking Dojah availability... (attempt " + attempts + ")");
                  
                  if (window.Dojah) {
                    console.log("✅ Dojah loaded successfully");
                  } else if (attempts < 20) {
                    setTimeout(checkDojah, 500);
                  } else {
                    console.error("❌ Dojah failed to load after 10 seconds");
                  }
                };
                
                // Start checking after a short delay
                setTimeout(checkDojah, 1000);
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <NotificationProvider>
              <EscrowProvider>
                {children}
                <Toaster />
              </EscrowProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
