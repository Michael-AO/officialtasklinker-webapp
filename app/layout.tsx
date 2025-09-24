import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { EscrowProvider } from "@/contexts/escrow-context"
import { DojahModalProvider } from "@/contexts/dojah-modal-context"
import { DojahModal } from "@/components/dojah-modal"
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
        {/* Dojah SDK is now loaded dynamically by DojahModal */}
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <NotificationProvider>
              <EscrowProvider>
                <DojahModalProvider>
                  {children}
                  <DojahModal />
                  <Toaster />
                </DojahModalProvider>
              </EscrowProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
