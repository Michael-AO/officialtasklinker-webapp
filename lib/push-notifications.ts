// Push Notification Service - DISABLED
export class PushNotificationService {
  private static instance: PushNotificationService
  private isDisabled: boolean = true // Set to true to disable push notifications

  constructor() {
    this.isDisabled = true
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService()
    }
    return PushNotificationService.instance
  }

  async initialize(): Promise<boolean> {
    console.log("🔕 Push notifications are disabled")
    return false
  }

  async requestPermission(): Promise<NotificationPermission> {
    console.log("🔕 Push notifications are disabled")
    return 'denied'
  }

  async subscribeToPush(userId: string): Promise<PushSubscription | null> {
    console.log("🔕 Push notifications are disabled")
    return null
  }

  async unsubscribeFromPush(): Promise<boolean> {
    console.log("🔕 Push notifications are disabled")
    return false
  }

  async sendLocalNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    console.log("🔕 Push notifications are disabled")
    return
  }

  // Check if notifications are enabled
  isNotificationsEnabled(): boolean {
    return false
  }

  // Get current permission status
  getPermissionStatus(): NotificationPermission {
    return 'denied'
  }
}

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance() 