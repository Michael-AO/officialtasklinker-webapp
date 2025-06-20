"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, FileText, CreditCard, TrendingUp, AlertTriangle, DollarSign, Eye, UserCheck } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "12,483",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Tasks",
      value: "1,247",
      change: "+8%",
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Revenue",
      value: "₦2.4M",
      change: "+15%",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending Disputes",
      value: "23",
      change: "-5%",
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  const recentUsers = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      type: "Freelancer",
      status: "Active",
      joinedDate: "2024-01-15",
      avatar: "JD",
    },
    {
      id: "2",
      name: "Sarah Smith",
      email: "sarah@company.com",
      type: "Client",
      status: "Pending",
      joinedDate: "2024-01-14",
      avatar: "SS",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@freelance.com",
      type: "Freelancer",
      status: "Active",
      joinedDate: "2024-01-13",
      avatar: "MJ",
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily@startup.com",
      type: "Client",
      status: "Active",
      joinedDate: "2024-01-12",
      avatar: "ED",
    },
  ]

  const recentTasks = [
    {
      id: "1",
      title: "E-commerce Website Development",
      client: "TechCorp Ltd",
      freelancer: "John Doe",
      budget: "₦150,000",
      status: "In Progress",
      deadline: "2024-02-15",
    },
    {
      id: "2",
      title: "Mobile App UI/UX Design",
      client: "StartupXYZ",
      freelancer: "Sarah Smith",
      budget: "₦80,000",
      status: "Completed",
      deadline: "2024-01-30",
    },
    {
      id: "3",
      title: "Content Writing & SEO",
      client: "Marketing Pro",
      freelancer: "Mike Johnson",
      budget: "₦45,000",
      status: "Review",
      deadline: "2024-02-05",
    },
    {
      id: "4",
      title: "Data Analysis Dashboard",
      client: "FinanceHub",
      freelancer: "Emily Davis",
      budget: "₦120,000",
      status: "Pending",
      deadline: "2024-02-20",
    },
  ]

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Active: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Inactive: "bg-gray-100 text-gray-800",
      "In Progress": "bg-blue-100 text-blue-800",
      Completed: "bg-green-100 text-green-800",
      Review: "bg-orange-100 text-orange-800",
    }
    return variants[status] || "bg-gray-100 text-gray-800"
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of platform activity and key metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export Report</Button>
          <Button>Refresh Data</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
        {/* Recent Users */}
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
                          {user.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(user.status)}>{user.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{user.joinedDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Tasks */}
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
                        <p className="text-xs text-gray-500">{task.client}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{task.budget}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(task.status)}>{task.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{task.deadline}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
