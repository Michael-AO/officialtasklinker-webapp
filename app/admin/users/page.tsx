"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MoreHorizontal, Eye, Ban, CheckCircle, XCircle, Users, UserCheck, UserX, Clock, Shield } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface User {
  id: string
  email: string
  name: string
  user_type: "client" | "freelancer"
  created_at: string
  last_active: string
  is_verified: boolean
  dojah_verified?: boolean  // EMERGENCY: Add Dojah verification status
  verification_type?: string
  avatar_url?: string
  bio?: string
  skills?: string[]
  hourly_rate?: number
  rating?: number
  completed_tasks?: number
}

interface UserStats {
  total: number
  active: number
  pending: number
  suspended: number
  clients: number
  freelancers: number
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    clients: 0,
    freelancers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")

  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(`
        id,
        email,
        name,
        user_type,
        created_at,
        last_active,
        is_verified,
        dojah_verified,
        verification_type,
        avatar_url,
        bio,
        skills,
        hourly_rate,
        rating,
        completed_tasks
      `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      console.log("Fetched users:", data)
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Get total users
      const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true })

      // Get verified users (active)
      const { count: activeUsers } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("is_verified", true)

      // Get unverified users (pending)
      const { count: pendingUsers } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("is_verified", false)

      // Get clients
      const { count: clients } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("user_type", "client")

      // Get freelancers
      const { count: freelancers } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("user_type", "freelancer")

      setStats({
        total: totalUsers || 0,
        active: activeUsers || 0,
        pending: pendingUsers || 0,
        suspended: 0, // You can add a suspended field to track this
        clients: clients || 0,
        freelancers: freelancers || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleVerifyUser = async (userId: string) => {
    try {
      const { error } = await supabase.from("users").update({ 
        is_verified: true,
        dojah_verified: true,  // EMERGENCY: Bypass Dojah verification
        verification_type: "manual_admin" 
      }).eq("id", userId)

      if (error) throw error

      toast({
        title: "Success",
        description: "User fully verified (manual admin override)",
      })

      fetchUsers()
      fetchStats()
    } catch (error) {
      console.error("Error verifying user:", error)
      toast({
        title: "Error",
        description: "Failed to verify user",
        variant: "destructive",
      })
    }
  }

  const handleSuspendUser = async (userId: string) => {
    try {
      const { error } = await supabase.from("users").update({ 
        is_verified: false,
        dojah_verified: false  // EMERGENCY: Reset Dojah verification
      }).eq("id", userId)

      if (error) throw error

      toast({
        title: "Success",
        description: "User suspended successfully",
      })

      fetchUsers()
      fetchStats()
    } catch (error) {
      console.error("Error suspending user:", error)
      toast({
        title: "Error",
        description: "Failed to suspend user",
        variant: "destructive",
      })
    }
  }

  // EMERGENCY: Manual Dojah verification bypass
  const handleManualDojahVerify = async (userId: string) => {
    try {
      const { error } = await supabase.from("users").update({ 
        dojah_verified: true,
        verification_type: "manual_admin_override"
      }).eq("id", userId)

      if (error) throw error

      toast({
        title: "Emergency Override",
        description: "User Dojah verification bypassed - Full access granted",
      })

      fetchUsers()
      fetchStats()
    } catch (error) {
      console.error("Error in manual Dojah verification:", error)
      toast({
        title: "Error",
        description: "Failed to bypass Dojah verification",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (user: User) => {
    if (user.is_verified && user.dojah_verified) {
      return <Badge className="bg-green-100 text-green-800">✅ Fully Verified</Badge>
    } else if (user.is_verified && !user.dojah_verified) {
      return <Badge className="bg-yellow-100 text-yellow-800">⚠️ Dojah Pending</Badge>
    } else if (!user.is_verified && user.dojah_verified) {
      return <Badge className="bg-blue-100 text-blue-800">🆔 ID Only</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-800">❌ Not Verified</Badge>
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.is_verified) ||
      (filterStatus === "pending" && !user.is_verified)

    const matchesType = filterType === "all" || user.user_type === filterType

    return matchesSearch && matchesStatus && matchesType
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading users...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage and monitor all platform users</p>
        </div>
        <Button
          onClick={() => {
            fetchUsers()
            fetchStats()
          }}
        >
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.clients} clients, {stats.freelancers} freelancers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Verified accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Verification</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Suspended</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
            <p className="text-xs text-muted-foreground">Suspended accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Search and filter users by status, type, and other criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="unconfirmed">Unconfirmed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="freelancer">Freelancer</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                        {user.name?.charAt(0) || user.email.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.name || "No name"}</p>
                          {user.is_verified && <CheckCircle className="h-4 w-4 text-blue-600" />}
                        </div>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.user_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(user)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.is_verified ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-xs">Email</span>
                      <div className={`w-2 h-2 rounded-full ${user.dojah_verified ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-xs">ID</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {user.last_active ? new Date(user.last_active).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {!user.is_verified ? (
                          <DropdownMenuItem onClick={() => handleVerifyUser(user.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Verify User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleSuspendUser(user.id)}>
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend User
                          </DropdownMenuItem>
                        )}
                        {/* EMERGENCY: Manual Dojah verification bypass */}
                        <DropdownMenuItem 
                          onClick={() => handleManualDojahVerify(user.id)}
                          className="text-orange-600 font-semibold"
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          🚨 Bypass Dojah (Emergency)
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <XCircle className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterStatus !== "all" || filterType !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No users match the current selection."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
