import type React from "react"
import { NotificationProvider } from "@/contexts/notification-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { EscrowProvider } from "@/contexts/escrow-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <EscrowProvider>
        <NotificationProvider>
          <AppSidebar />
          <SidebarInset>
            <div className="flex h-full w-full flex-col">
              <DashboardHeader />
              <div className="flex-1 space-y-4 p-6 pt-6">{children}</div>
            </div> 
          </SidebarInset>
        </NotificationProvider>
      </EscrowProvider>
    </SidebarProvider>
  )
}
