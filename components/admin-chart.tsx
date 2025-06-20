"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Users, DollarSign } from "lucide-react"

export function AdminChart() {
  const [timeRange, setTimeRange] = useState("7d")

  // Mock data for the chart
  const chartData = {
    "7d": {
      users: [120, 135, 148, 162, 175, 189, 205],
      revenue: [45000, 52000, 48000, 61000, 58000, 67000, 72000],
      tasks: [25, 32, 28, 35, 42, 38, 45],
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    "30d": {
      users: [3200, 3450, 3680, 3920, 4150, 4380, 4620],
      revenue: [1200000, 1350000, 1480000, 1620000, 1750000, 1890000, 2050000],
      tasks: [680, 720, 765, 810, 855, 900, 945],
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    },
    "90d": {
      users: [8500, 9200, 9800, 10400, 11000, 11600, 12200],
      revenue: [3200000, 3650000, 4100000, 4550000, 5000000, 5450000, 5900000],
      tasks: [1800, 2100, 2400, 2700, 3000, 3300, 3600],
      labels: ["Month 1", "Month 2", "Month 3"],
    },
  }

  const currentData = chartData[timeRange as keyof typeof chartData]
  const maxValue = Math.max(...currentData.revenue)

  const getGrowthPercentage = (data: number[]) => {
    if (data.length < 2) return 0
    const current = data[data.length - 1]
    const previous = data[data.length - 2]
    return ((current - previous) / previous) * 100
  }

  const userGrowth = getGrowthPercentage(currentData.users)
  const revenueGrowth = getGrowthPercentage(currentData.revenue)
  const taskGrowth = getGrowthPercentage(currentData.tasks)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Platform Metrics</h3>
          <p className="text-sm text-muted-foreground">Track key performance indicators</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 days</SelectItem>
            <SelectItem value="30d">30 days</SelectItem>
            <SelectItem value="90d">90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.users[currentData.users.length - 1].toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs">
              {userGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={userGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                {Math.abs(userGrowth).toFixed(1)}%
              </span>
              <span className="text-muted-foreground">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{(currentData.revenue[currentData.revenue.length - 1] / 100).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                {Math.abs(revenueGrowth).toFixed(1)}%
              </span>
              <span className="text-muted-foreground">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Active Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.tasks[currentData.tasks.length - 1].toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs">
              {taskGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={taskGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                {Math.abs(taskGrowth).toFixed(1)}%
              </span>
              <span className="text-muted-foreground">vs previous period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simple Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Revenue over the selected time period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {currentData.revenue.map((value, index) => (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className="bg-blue-500 rounded-t w-full transition-all duration-300 hover:bg-blue-600"
                  style={{
                    height: `${(value / maxValue) * 200}px`,
                    minHeight: "4px",
                  }}
                />
                <span className="text-xs text-muted-foreground">{currentData.labels[index]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
