import type React from "react"
import { NotificationProvider } from "@/contexts/notification-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { EscrowProvider } from "@/contexts/escrow-context"
import { NotificationContainer } from "@/components/ui/notification"
import { DashboardVerificationGate } from "@/components/dashboard-verification-gate"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <EscrowProvider>
        <NotificationProvider>
          <DashboardVerificationGate>
            <AppSidebar />
            <SidebarInset>
              <div className="flex h-full w-full flex-col bg-background">
                <DashboardHeader />
                <div className="flex-1 space-y-4 p-6 pt-6 bg-background">{children}</div>
              </div>
            </SidebarInset>
            <NotificationContainer />
          </DashboardVerificationGate>
        </NotificationProvider>
      </EscrowProvider>
    </SidebarProvider>
  )
}
