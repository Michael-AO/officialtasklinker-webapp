"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, FileText, CreditCard, TrendingUp, AlertTriangle, Eye, UserCheck } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { NairaIcon } from "@/components/naira-icon"

interface User {
  id: string
  email: string
  name: string
  user_type: "client" | "freelancer"
  created_at: string
  last_active: string
  is_verified: boolean
}

interface Task {
  id: string
  title: string
  budget_min: number
  budget_max: number
  status: string
  deadline: string
  created_at: string
  client: {
    name: string
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTasks: 0,
    totalRevenue: 0,
    pendingDisputes: 0,
  })
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [
        { count: userCount },
        { count: taskCount },
        { data: escrowData },
        { count: disputeCount },
        { data: usersData },
        { data: tasksData },
      ] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("tasks").select("*", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
        supabase.from("escrow").select("amount").eq("status", "released"),
        supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "disputed"),
        supabase
          .from("users")
          .select("id, email, name, user_type, created_at, last_active, is_verified")
          .order("created_at", { ascending: false })
          .limit(4),
        supabase
          .from("tasks")
          .select(`
            id,
            title,
            budget_min,
            budget_max,
            status,
            deadline,
            created_at,
            client:client_id(name)
          `)
          .order("created_at", { ascending: false })
          .limit(4),
      ])

      const totalRevenue = escrowData?.reduce((sum, escrow) => sum + (escrow.amount || 0), 0) || 0

      setStats({
        totalUsers: userCount || 0,
        activeTasks: taskCount || 0,
        totalRevenue,
        pendingDisputes: disputeCount || 0,
      })

      setRecentUsers(usersData || [])
      setRecentTasks(tasksData || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Tasks",
      value: stats.activeTasks.toLocaleString(),
      change: "+8%",
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Revenue",
      value: `₦${(stats.totalRevenue / 100).toLocaleString()}`,
      change: "+15%",
      icon: NairaIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending Disputes",
      value: stats.pendingDisputes.toString(),
      change: "-5%",
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Active: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Inactive: "bg-gray-100 text-gray-800",
      open: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      disputed: "bg-red-100 text-red-800",
    }
    return variants[status] || "bg-gray-100 text-gray-800"
  }

  const getUserStatus = (user: User) => {
    if (user.is_verified) return "Active"
    return "Pending"
  }

  const formatCurrency = (amount: number) => {
    return `₦${(amount / 100).toLocaleString()}`
  }

  const activityFeed = [
    {
      id: "1",
      user: "John Doe",
      action: "created a new task",
      task: "E-commerce Website Development",
      time: "5 minutes ago",
    },
    {
      id: "2",
      user: "Sarah Smith",
      action: "completed task",
      task: "Mobile App UI/UX Design",
      time: "10 minutes ago",
    },
    {
      id: "3",
      user: "Admin",
      action: "updated system settings",
      task: "Security Configuration",
      time: "30 minutes ago",
    },
    {
      id: "4",
      user: "Mike Johnson",
      action: "submitted task for review",
      task: "Content Writing & SEO",
      time: "1 hour ago",
    },
  ]

  const topPerformers = [
    {
      id: "1",
      name: "John Doe",
      tasksCompleted: 15,
      rating: 4.8,
    },
    {
      id: "2",
      name: "Sarah Smith",
      tasksCompleted: 20,
      rating: 4.9,
    },
    {
      id: "3",
      name: "Mike Johnson",
      tasksCompleted: 12,
      rating: 4.5,
    },
  ]

  const systemHealthData = [
    { name: "CPU", value: 75 },
    { name: "Memory", value: 60 },
    { name: "Disk", value: 80 },
  ]

  const platformAnalyticsData = [
    { month: "Jan", users: 1200, revenue: 2400 },
    { month: "Feb", users: 1320, revenue: 2500 },
    { month: "Mar", users: 1400, revenue: 2600 },
    { month: "Apr", users: 1450, revenue: 2750 },
    { month: "May", users: 1500, revenue: 2900 },
    { month: "Jun", users: 1550, revenue: 3000 },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of platform activity and key metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export Report</Button>
          <Button onClick={fetchDashboardData}>Refresh Data</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">
                <span className={stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}>{stat.change}</span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users - Real Data */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                          {user.name?.charAt(0) || user.email.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.name || "No name"}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.user_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(getUserStatus(user))}>{getUserStatus(user)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {recentUsers.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">No recent users found</div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tasks - Real Data */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>Latest task activities</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-gray-500">{task.client?.name || "Unknown Client"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(task.budget_max)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(task.status)} className="capitalize">
                        {task.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {recentTasks.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">No recent tasks found</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <UserCheck className="h-6 w-6" />
              <span>Verify Users</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <AlertTriangle className="h-6 w-6" />
              <span>Resolve Disputes</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <CreditCard className="h-6 w-6" />
              <span>Process Payments</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span>View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Activity Feed</CardTitle>
          <CardDescription>Latest activities on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-none space-y-4">
            {activityFeed.map((activity) => (
              <li key={activity.id} className="border-b pb-2 last:border-none">
                <p className="text-sm font-medium">
                  {activity.user} <span className="text-gray-500">{activity.action}</span>{" "}
                  <span className="font-semibold">{activity.task}</span>
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Freelancers with the highest task completion rate</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Tasks Completed</TableHead>
                <TableHead>Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPerformers.map((performer) => (
                <TableRow key={performer.id}>
                  <TableCell className="font-medium">{performer.name}</TableCell>
                  <TableCell>{performer.tasksCompleted}</TableCell>
                  <TableCell>{performer.rating}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* System Health Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle>System Health Monitoring</CardTitle>
          <CardDescription>Real-time system resource usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {systemHealthData.map((item) => (
              <div key={item.name} className="flex flex-col items-center">
                <p className="text-sm font-medium text-gray-600">{item.name}</p>
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full">
                    <circle
                      className="text-gray-300 stroke-current"
                      strokeWidth="6"
                      cx="50%"
                      cy="50%"
                      r="40%"
                      fill="transparent"
                    />
                    <circle
                      className="text-green-500 stroke-current"
                      strokeWidth="6"
                      strokeDasharray={`${item.value * 2.512}, 251.2`}
                      cx="50%"
                      cy="50%"
                      r="40%"
                      fill="transparent"
                      style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                    />
                  </svg>
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-bold">
                    {item.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Analytics</CardTitle>
          <CardDescription>Monthly user growth and revenue trends</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={platformAnalyticsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" name="Users" />
              <Area type="monotone" dataKey="revenue" stroke="#82ca9d" fill="#82ca9d" name="Revenue" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
