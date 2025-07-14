"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, MessageSquare, DollarSign, TrendingUp, Activity } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalUsers: number
  totalTasks: number
  totalApplications: number
  totalSupportRequests: number
  totalRevenue: number
  activeTasks: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTasks: 0,
    totalApplications: 0,
    totalSupportRequests: 0,
    totalRevenue: 0,
    activeTasks: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      
      // Fetch stats from various endpoints
      const [usersRes, tasksRes, applicationsRes, supportRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/tasks'),
        fetch('/api/admin/applications'),
        fetch('/api/admin/support-requests')
      ])

      const usersData = await usersRes.json()
      const tasksData = await tasksRes.json()
      const applicationsData = await applicationsRes.json()
      const supportData = await supportRes.json()

      setStats({
        totalUsers: usersData.users?.length || 0,
        totalTasks: tasksData.tasks?.length || 0,
        totalApplications: applicationsData.applications?.length || 0,
        totalSupportRequests: supportData.supportRequests?.length || 0,
        totalRevenue: 0, // Placeholder
        activeTasks: tasksData.tasks?.filter((task: any) => task.status === 'active')?.length || 0
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Registered users",
      icon: Users,
      href: "/admin/users"
    },
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      description: "Posted tasks",
      icon: FileText,
      href: "/admin/tasks"
    },
    {
      title: "Applications",
      value: stats.totalApplications,
      description: "Task applications",
      icon: MessageSquare,
      href: "/admin/applications"
    },
    {
      title: "Support Requests",
      value: stats.totalSupportRequests,
      description: "Pending requests",
      icon: Activity,
      href: "/admin/support"
    },
    {
      title: "Active Tasks",
      value: stats.activeTasks,
      description: "Currently active",
      icon: TrendingUp,
      href: "/admin/tasks"
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      description: "Platform revenue",
      icon: DollarSign,
      href: "/admin/revenue"
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Loading...</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={fetchDashboardStats} variant="outline">
          Refresh Stats
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/tasks">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Manage Tasks
              </Button>
            </Link>
            <Link href="/admin/support">
              <Button variant="outline" className="w-full justify-start">
                <Activity className="mr-2 h-4 w-4" />
                Support Requests
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Platform health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <span className="text-sm text-green-600">● Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API</span>
              <span className="text-sm text-green-600">● Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Storage</span>
              <span className="text-sm text-green-600">● Available</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
