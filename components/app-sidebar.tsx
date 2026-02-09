"use client"

import {
  Briefcase,
  CreditCard,
  FileText,
  Home,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Users,
  User,
  Banknote,
  Shield,
  Scale,
  TestTube,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { SupportModal } from "@/components/support-modal"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Browse Tasks",
    url: "/dashboard/browse",
    icon: Search,
  },
  {
    title: "My Tasks",
    url: "/dashboard/tasks",
    icon: FileText,
    adminOnly: true,
  },
  {
    title: "Applications",
    url: "/dashboard/applications",
    icon: Users,
  },
]

const quickActions = [
  {
    title: "Post New Task",
    url: "/dashboard/tasks/new",
    icon: Plus,
  },
  {
    title: "Find Work",
    url: "/dashboard/browse",
    icon: Briefcase,
  },
]

const paymentsAndMessagesItems = [
  { title: "Messages", url: "/dashboard/messages", icon: MessageSquare },
  { title: "Payments", url: "/dashboard/payments", icon: CreditCard },
  { title: "Escrow", url: "/dashboard/escrow", icon: Shield },
  { title: "Withdrawals", url: "/dashboard/payments/withdrawals", icon: Banknote },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const isActive = (url: string) => {
    if (url === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(url)
  }

  return (
    <Sidebar className="bg-gray-900 border-r border-gray-800 w-64 text-white tracking-[0.02em]" style={{ fontFamily: '"Helvetica Neue", Arial, Helvetica, sans-serif' }}>
      <SidebarHeader className="border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-2 px-2 py-2">
          <img src="/logo-icon.svg" alt="Tasklinkers Logo" className="h-8 w-8" />
          <span className="text-lg font-bold text-white">Tasklinkers</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gray-900">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-[#04A466] data-[active=true]:text-white"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500">Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-[#04A466] data-[active=true]:text-white"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500">Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/dashboard/profile")}
                  className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-[#04A466] data-[active=true]:text-white"
                >
                  <Link href="/dashboard/profile">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/dashboard/verification")}
                  className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-[#04A466] data-[active=true]:text-white"
                >
                  <Link href="/dashboard/verification">
                    <Shield className="h-4 w-4" />
                    <span>Verification</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/dashboard/youverify-test")}
                  className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-[#04A466] data-[active=true]:text-white"
                >
                  <Link href="/dashboard/youverify-test">
                    <TestTube className="h-4 w-4" />
                    <span>YouVerify API Test</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500">Payments & Messages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {paymentsAndMessagesItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-[#04A466] data-[active=true]:text-white"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500">Legal & Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/legal")}
                  className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-[#04A466] data-[active=true]:text-white"
                >
                  <Link href="/legal">
                    <Scale className="h-4 w-4" />
                    <span>Privacy & Terms</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SupportModal />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-800 bg-gray-900">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/dashboard/settings")}
              className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-[#04A466] data-[active=true]:text-white"
            >
              <Link href="/dashboard/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
