"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, FileText, MessageSquare, Settings, Shield, HelpCircle } from "lucide-react"

interface AdminSidebarProps {
  open: boolean
  onClose: () => void
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ open, onClose }) => {
  const pathname = usePathname()

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Applications",
      href: "/admin/applications",
      icon: MessageSquare,
    },
    {
      name: "Tasks",
      href: "/admin/tasks",
      icon: FileText,
    },
    {
      name: "Support",
      href: "/admin/support",
      icon: HelpCircle,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={onClose}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Admin info */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              Admin Panel
            </p>
            <p className="text-xs text-gray-500">Tasklinkers</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSidebar
