"use client"

import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react'

export interface NotificationProps {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  onClose?: (id: string) => void
}

export function Notification({ id, title, message, type, duration = 5000, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onClose?.(id), 300) // Wait for fade out animation
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, id, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getStyles = () => {
    const baseStyles = "flex items-start gap-3 p-4 rounded-lg shadow-lg border transition-all duration-300"
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`
      case 'error':
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`
      default:
        return `${baseStyles} bg-gray-50 border-gray-200 text-gray-800`
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className={`${getStyles()} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
      {getIcon()}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-sm mt-1 opacity-90">{message}</p>
      </div>
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(() => onClose?.(id), 300)
        }}
        className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// Notification container component
export function NotificationContainer() {
  const [notifications, setNotifications] = useState<NotificationProps[]>([])

  const addNotification = (notification: Omit<NotificationProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }
    setNotifications(prev => [...prev, newNotification])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Expose addNotification globally for easy access
  useEffect(() => {
    ;(window as any).showNotification = addNotification
    return () => {
      delete (window as any).showNotification
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  )
}

// Hook for using notifications
export function useNotifications() {
  const addNotification = (notification: Omit<NotificationProps, 'id'>) => {
    if (typeof window !== 'undefined' && (window as any).showNotification) {
      ;(window as any).showNotification(notification)
    }
  }

  return { addNotification }
} 