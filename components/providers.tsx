"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { EscrowProvider } from "@/contexts/escrow-context"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
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
  )
}
