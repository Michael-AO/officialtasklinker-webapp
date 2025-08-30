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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Clean up Dojah scripts on page load
              (function() {
                console.log("🧹 Cleaning up existing Dojah scripts...");
                
                // Remove any existing Dojah scripts
                const dojahScripts = document.querySelectorAll('script[src*="dojah"], script[src*="widget.js"]');
                dojahScripts.forEach(script => {
                  console.log("Removing Dojah script:", script.src);
                  script.remove();
                });
                
                // Remove any Dojah-related global variables
                if (window.dojahSpinnerHtml) {
                  delete window.dojahSpinnerHtml;
                  console.log("Removed dojahSpinnerHtml from window");
                }
                
                // Remove any Dojah-related elements
                const dojahElements = document.querySelectorAll('[data-dojah-widget], [data-dojah-wrapper]');
                dojahElements.forEach(el => {
                  console.log("Removing Dojah element:", el);
                  el.remove();
                });
                
                console.log("✅ Dojah cleanup completed");
              })();
            `,
          }}
        />
        <script src="https://widget.dojah.io/widget.js" async></script>
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
