import type React from "react"
import { Suspense } from "react"
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
          <Suspense fallback={
            <>
              <AppSidebar />
              <SidebarInset>
                <div className="flex h-full w-full flex-col bg-white">
                  <DashboardHeader />
                  <div className="flex-1 flex items-center justify-center p-6 bg-white">
                    <div className="animate-spin h-8 w-8 border-2 border-[#04A466] border-t-transparent rounded-full" />
                  </div>
                </div>
              </SidebarInset>
              <NotificationContainer />
            </>
          }>
          <DashboardVerificationGate>
            <AppSidebar />
            <SidebarInset>
              <div className="flex h-full w-full flex-col bg-white">
                <DashboardHeader />
                <div className="flex-1 space-y-4 p-6 pt-6 bg-white">{children}</div>
              </div>
            </SidebarInset>
            <NotificationContainer />
          </DashboardVerificationGate>
          </Suspense>
        </NotificationProvider>
      </EscrowProvider>
    </SidebarProvider>
  )
}
