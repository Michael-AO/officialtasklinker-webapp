"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  actionLabel?: string
  metadata?: Record<string, any>
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Load mock notifications
    const mockNotifications: Notification[] = [
      {
        id: "notif_001",
        type: "success",
        title: "Application Accepted",
        message: "Your application for 'Website Development' has been accepted by Sarah Johnson.",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        read: false,
        actionUrl: "/dashboard/tasks/task_001",
        actionLabel: "View Task",
        metadata: { taskId: "task_001", clientId: "client_001" },
      },
      {
        id: "notif_002",
        type: "info",
        title: "New Task Match",
        message: "A new task matching your skills has been posted: 'Mobile App Development'.",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        read: false,
        actionUrl: "/dashboard/browse/task_002",
        actionLabel: "View Task",
        metadata: { taskId: "task_002" },
      },
      {
        id: "notif_003",
        type: "success",
        title: "Payment Released",
        message: "Payment of ₦50,000 has been released for completed task 'Logo Design'.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        read: false,
        actionUrl: "/dashboard/payments",
        actionLabel: "View Payment",
        metadata: { amount: 50000, taskId: "task_003" },
      },
      {
        id: "notif_004",
        type: "warning",
        title: "Task Deadline Approaching",
        message: "The deadline for 'Content Writing Project' is in 2 days.",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        read: true,
        actionUrl: "/dashboard/tasks/task_004",
        actionLabel: "View Task",
        metadata: { taskId: "task_004", daysLeft: 2 },
      },
      {
        id: "notif_005",
        type: "info",
        title: "Profile View",
        message: "Your profile has been viewed 15 times this week.",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        read: true,
        actionUrl: "/dashboard/profile",
        actionLabel: "View Profile",
        metadata: { views: 15 },
      },
    ]

    setNotifications(mockNotifications)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const addNotification = (notificationData: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
    }

    setNotifications((prev) => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
