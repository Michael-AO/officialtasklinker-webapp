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
  UserCheck,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"

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
  const [profileCompletion, setProfileCompletion] = useState(0)

  const isActive = (url: string) => {
    if (url === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(url)
  }

  // Calculate profile completion percentage
  useEffect(() => {
    if (user) {
      let completed = 0
      const total = 5 // Total sections to complete

      if (user.bio && user.bio.trim()) completed++
      if (user.skills && user.skills.length > 0) completed++
      if (user.location && user.location.trim()) completed++
      if (user.hourlyRate && user.hourlyRate > 0) completed++
      if (user.portfolio && user.portfolio.length > 0) completed++
      if (user.avatar) completed++ // Include profile picture

      setProfileCompletion(Math.round((completed / total) * 100))
    }
  }, [user])

  const isProfileIncomplete = profileCompletion < 100

  return (
    <Sidebar className="bg-black border-r border-gray-800">
      <SidebarHeader className="border-b border-gray-800 bg-black">
        <div className="flex items-center gap-2 px-2 py-2">
          <img src="/logo-icon.svg" alt="Tasklinkers Logo" className="h-6 w-6" />
          <span className="text-lg font-bold text-white">Tasklinkers</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-black">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-300">Navigation</SidebarGroupLabel>
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
          <SidebarGroupLabel className="text-gray-300">Quick Actions</SidebarGroupLabel>
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
              
              {/* Show "Complete your profile" link only when profile is incomplete */}
              {isProfileIncomplete && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/dashboard/profile/edit")}
                    className="text-yellow-300 hover:text-yellow-200 hover:bg-yellow-900/20 data-[active=true]:bg-yellow-900/30 data-[active=true]:text-yellow-200"
                  >
                    <Link href="/dashboard/profile/edit">
                      <UserCheck className="h-4 w-4" />
                      <span>Complete Profile ({profileCompletion}%)</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
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
          <SidebarGroupLabel className="text-gray-300">Legal</SidebarGroupLabel>
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

      <SidebarRail />
    </Sidebar>
  )
}
