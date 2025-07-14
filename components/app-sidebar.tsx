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
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { isVerifiedEmail } from "@/lib/utils"
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
  SidebarRail,
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

const disabledItems = [
  {
    title: "Messages",
    icon: MessageSquare,
    disabled: true,
  },
  {
    title: "Payments",
    icon: CreditCard,
    disabled: true,
  },
  {
    title: "Escrow",
    icon: Shield,
    disabled: true,
  },
  {
    title: "Withdrawals",
    icon: Banknote,
    disabled: true,
  },
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

  // Check if user can post tasks (only admin emails)
  const canPostTasks = user && isVerifiedEmail(user.email)

  return (
    <Sidebar className="bg-black border-r border-gray-800">
      <SidebarHeader className="border-b border-gray-800 bg-black">
        <div className="flex items-center gap-2 px-2 py-2">
          <img src="/logo-icon.svg" alt="Tasklinkers Logo" className="h-8 w-8" />
          <span className="text-lg font-bold text-white">Tasklinkers</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-black">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-300">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                // Check if this is an admin-only item and user is not admin
                const isAdminOnly = item.adminOnly
                const shouldDisable = isAdminOnly && !canPostTasks
                
                return (
                  <SidebarMenuItem key={item.title}>
                    {shouldDisable ? (
                      <SidebarMenuButton 
                        disabled 
                        className="text-gray-500 cursor-not-allowed opacity-60"
                        title="Only admin accounts can access this feature"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    ) : (
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
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-300">Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((item) => {
                // Check if this is the "Post New Task" item and user is not admin
                const isPostTask = item.title === "Post New Task"
                const shouldDisable = isPostTask && !canPostTasks
                
                return (
                  <SidebarMenuItem key={item.title}>
                    {shouldDisable ? (
                      <SidebarMenuButton 
                        disabled 
                        className="text-gray-500 cursor-not-allowed opacity-60"
                        title="Only admin accounts can post tasks"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    ) : (
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
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-300">Account</SidebarGroupLabel>
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {disabledItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton disabled className="text-gray-500 cursor-not-allowed opacity-60">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-300">Legal & Support</SidebarGroupLabel>
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

      <SidebarFooter className="border-t border-gray-800 bg-black">
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
