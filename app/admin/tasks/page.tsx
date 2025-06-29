"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  Eye,
  Star,
  CheckCircle,
  X,
  MoreHorizontal,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  UserCheck,
  FileText,
  MessageSquare,
  Settings,
  User,
} from "lucide-react"
import { NairaIcon } from "@/components/naira-icon"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface Task {
  id: string
  title: string
  description: string
  budget_min: number
  budget_max: number
  status: string
  category: string
  skills: string[]
  deadline: string
  created_at: string
  client: {
    full_name: string
    email: string
  }
  applications: {
    id: string
  }[]
}

interface TaskStats {
  total: number
  open: number
  inProgress: number
  completed: number
  disputed: number
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    completed: 0,
    disputed: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedTab, setSelectedTab] = useState("all")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchTasks()
    fetchStats()
  }, [])

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
        id,
        title,
        description,
        budget_min,
        budget_max,
        status,
        category,
        skills_required,
        deadline,
        created_at,
        client_id,
        users!tasks_client_id_fkey (
          name,
          email
        )
      `)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Get applications count for each task
      const tasksWithApplications = await Promise.all(
        (data || []).map(async (task) => {
          const { count } = await supabase
            .from("applications")
            .select("*", { count: "exact", head: true })
            .eq("task_id", task.id)

          return {
            ...task,
            skills: task.skills_required || [],
            client: {
              full_name: task.users?.name || "Unknown Client",
              email: task.users?.email || "",
            },
            applications: Array(count || 0).fill({ id: "dummy" }),
          }
        }),
      )

      setTasks(tasksWithApplications)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Get total tasks
      const { count: totalTasks } = await supabase.from("tasks").select("*", { count: "exact", head: true })

      // Get tasks by status
      const { count: openTasks } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")

      const { count: inProgressTasks } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "in_progress")

      const { count: completedTasks } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed")

      const { count: disputedTasks } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "disputed")

      setStats({
        total: totalTasks || 0,
        open: openTasks || 0,
        inProgress: inProgressTasks || 0,
        completed: completedTasks || 0,
        disputed: disputedTasks || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    setIsDeleting(true)
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Task deleted successfully",
      })

      fetchTasks()
      fetchStats()
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      case "disputed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-4 w-4" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <X className="h-4 w-4" />
      case "disputed":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesCategory = categoryFilter === "all" || task.category === categoryFilter
    const matchesTab = selectedTab === "all" || task.status === selectedTab

    return matchesSearch && matchesStatus && matchesCategory && matchesTab
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading tasks...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">Monitor and manage all platform tasks</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              fetchTasks()
              fetchStats()
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button>Export Tasks</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <NairaIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
            <p className="text-xs text-muted-foreground">Available for bidding</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Successfully finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disputed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.disputed}</div>
            <p className="text-xs text-muted-foreground">Need resolution</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="disputed">Disputed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Web Development">Web Development</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="Writing">Writing</SelectItem>
              <SelectItem value="Data Science">Data Science</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="active">Open ({stats.open})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({stats.inProgress})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
          <TabsTrigger value="disputed">Disputed ({stats.disputed})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab}>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">{task.category}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{task.client?.full_name || "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ₦{(task.budget_max / 100).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusIcon(task.status)}
                          <span className="ml-1 capitalize">{task.status.replace("_", " ")}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(task.deadline).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{task.applications?.length || 0}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this task? This action cannot be undone and will also
                                  delete all associated applications and escrow data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTask(task.id)}
                                  disabled={isDeleting}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {isDeleting ? "Deleting..." : "Delete Task"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Tasks Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No tasks match the current selection."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
