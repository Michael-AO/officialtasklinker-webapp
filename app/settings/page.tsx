"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
import { toast } from "@/hooks/use-toast"
import { User, Bell, Shield, Trash2, LogOut, Save, Plus, X, Settings, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useNotifications } from "@/contexts/notification-context"

interface NotificationPreferences {
  email_new_tasks: boolean
  email_messages: boolean
  email_payments: boolean
  email_task_updates: boolean
  push_notifications: boolean
  browser_notifications: boolean
  weekly_digest: boolean
  marketing_emails: boolean
}

interface PrivacySettings {
  profile_visible: boolean
  show_earnings: boolean
  show_location: boolean
  show_last_active: boolean
  allow_search_engines: boolean
  discoverable_by_email: boolean
  data_sharing: boolean
  analytics_tracking: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { addNotification } = useNotifications()

  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    hourlyRate: "",
    skills: [] as string[],
    newSkill: "",
  })

  // Notification preferences
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email_new_tasks: true,
    email_messages: true,
    email_payments: true,
    email_task_updates: true,
    push_notifications: true,
    browser_notifications: false,
    weekly_digest: false,
    marketing_emails: false,
  })

  // Privacy settings
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profile_visible: true,
    show_earnings: false,
    show_location: true,
    show_last_active: true,
    allow_search_engines: true,
    discoverable_by_email: false,
    data_sharing: false,
    analytics_tracking: true,
  })

  // Load user data on mount
  useEffect(() => {
    if (user) {
      loadUserSettings()
    }
  }, [user])

  const loadUserSettings = async () => {
    try {
      setLoading(true)

      // Load profile data
      const profileResponse = await fetch("/api/user/profile")
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setFormData({
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          bio: profileData.bio || "",
          location: profileData.location || "",
          hourlyRate: profileData.hourly_rate?.toString() || "",
          skills: profileData.skills || [],
          newSkill: "",
        })
      }

      // Load notification preferences
      const notificationResponse = await fetch("/api/user/notification-preferences")
      if (notificationResponse.ok) {
        const notificationData = await notificationResponse.json()
        setNotifications(notificationData)
      }

      // Load privacy settings
      const privacyResponse = await fetch("/api/user/privacy-settings")
      if (privacyResponse.ok) {
        const privacyData = await privacyResponse.json()
        setPrivacy(privacyData)
      }
    } catch (error) {
      console.error("Error loading settings:", error)
      toast({
        title: "Error loading settings",
        description: "Please refresh the page to try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSigningOut(false)
    }
  }

  const handleSave = async (section: string) => {
    setIsSaving(true)
    try {
      let endpoint = ""
      let data = {}

      switch (section) {
        case "account":
          endpoint = "/api/user/profile"
          data = {
            name: formData.name,
            phone: formData.phone,
            bio: formData.bio,
            location: formData.location,
            hourly_rate: Number.parseFloat(formData.hourlyRate) || null,
            skills: formData.skills,
          }
          break
        case "notification":
          endpoint = "/api/user/notification-preferences"
          data = notifications
          break
        case "privacy":
          endpoint = "/api/user/privacy-settings"
          data = privacy
          break
      }

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Settings saved",
          description: `Your ${section} settings have been updated.`,
        })

        // Add notification for settings update
        addNotification({
          title: "Settings Updated",
          message: `Your ${section} settings have been successfully saved.`,
          type: "success",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error saving settings",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Real-time notification preference updates
  const updateNotificationPreference = async (key: keyof NotificationPreferences, value: boolean) => {
    const updatedNotifications = { ...notifications, [key]: value }
    setNotifications(updatedNotifications)

    try {
      const response = await fetch("/api/user/notification-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedNotifications),
      })

      if (response.ok) {
        // Show immediate feedback
        addNotification({
          title: "Notification Setting Updated",
          message: `${key.replace(/_/g, " ")} has been ${value ? "enabled" : "disabled"}.`,
          type: "info",
        })
      } else {
        // Revert on error
        setNotifications(notifications)
        throw new Error("Failed to update notification preference")
      }
    } catch (error) {
      console.error("Error updating notification preference:", error)
      toast({
        title: "Error updating setting",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  // Real-time privacy setting updates
  const updatePrivacySetting = async (key: keyof PrivacySettings, value: boolean) => {
    const updatedPrivacy = { ...privacy, [key]: value }
    setPrivacy(updatedPrivacy)

    try {
      const response = await fetch("/api/user/privacy-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPrivacy),
      })

      if (response.ok) {
        // Show immediate feedback
        addNotification({
          title: "Privacy Setting Updated",
          message: `${key.replace(/_/g, " ")} has been ${value ? "enabled" : "disabled"}.`,
          type: "info",
        })
      } else {
        // Revert on error
        setPrivacy(privacy)
        throw new Error("Failed to update privacy setting")
      }
    } catch (error) {
      console.error("Error updating privacy setting:", error)
      toast({
        title: "Error updating setting",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const addSkill = () => {
    if (formData.newSkill.trim() && !formData.skills.includes(formData.newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, formData.newSkill.trim()],
        newSkill: "",
      })
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    })
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access settings</h1>
          <Button onClick={() => router.push("/login")}>Go to Login</Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Loading Settings</h1>
          <p className="text-muted-foreground">Please wait while we load your preferences...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          App Settings
        </h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="danger" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} disabled className="opacity-50" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+234 xxx xxx xxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={formData.newSkill}
                    onChange={(e) => setFormData({ ...formData, newSkill: e.target.value })}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === "Enter" && addSkill()}
                  />
                  <Button onClick={addSkill} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button onClick={() => handleSave("account")} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about activity (changes save automatically)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications for New Tasks</Label>
                    <p className="text-sm text-muted-foreground">Get notified when new tasks match your skills</p>
                  </div>
                  <Switch
                    checked={notifications.email_new_tasks}
                    onCheckedChange={(checked) => updateNotificationPreference("email_new_tasks", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Message Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified about new messages</p>
                  </div>
                  <Switch
                    checked={notifications.email_messages}
                    onCheckedChange={(checked) => updateNotificationPreference("email_messages", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Payment Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified about payments and withdrawals</p>
                  </div>
                  <Switch
                    checked={notifications.email_payments}
                    onCheckedChange={(checked) => updateNotificationPreference("email_payments", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Task Update Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified about task status changes</p>
                  </div>
                  <Switch
                    checked={notifications.email_task_updates}
                    onCheckedChange={(checked) => updateNotificationPreference("email_task_updates", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                  </div>
                  <Switch
                    checked={notifications.push_notifications}
                    onCheckedChange={(checked) => updateNotificationPreference("push_notifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Browser Notifications</Label>
                    <p className="text-sm text-muted-foreground">Show notifications in your browser</p>
                  </div>
                  <Switch
                    checked={notifications.browser_notifications}
                    onCheckedChange={(checked) => updateNotificationPreference("browser_notifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">Weekly summary of your activity</p>
                  </div>
                  <Switch
                    checked={notifications.weekly_digest}
                    onCheckedChange={(checked) => updateNotificationPreference("weekly_digest", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">Tips, updates, and promotional content</p>
                  </div>
                  <Switch
                    checked={notifications.marketing_emails}
                    onCheckedChange={(checked) => updateNotificationPreference("marketing_emails", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control your privacy and data sharing preferences (changes save automatically)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">Make your profile visible to clients</p>
                  </div>
                  <Switch
                    checked={privacy.profile_visible}
                    onCheckedChange={(checked) => updatePrivacySetting("profile_visible", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Earnings</Label>
                    <p className="text-sm text-muted-foreground">Display your earnings on your profile</p>
                  </div>
                  <Switch
                    checked={privacy.show_earnings}
                    onCheckedChange={(checked) => updatePrivacySetting("show_earnings", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Location</Label>
                    <p className="text-sm text-muted-foreground">Display your location on your profile</p>
                  </div>
                  <Switch
                    checked={privacy.show_location}
                    onCheckedChange={(checked) => updatePrivacySetting("show_location", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Last Active</Label>
                    <p className="text-sm text-muted-foreground">Show when you were last active</p>
                  </div>
                  <Switch
                    checked={privacy.show_last_active}
                    onCheckedChange={(checked) => updatePrivacySetting("show_last_active", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Search Engine Indexing</Label>
                    <p className="text-sm text-muted-foreground">Allow search engines to index your profile</p>
                  </div>
                  <Switch
                    checked={privacy.allow_search_engines}
                    onCheckedChange={(checked) => updatePrivacySetting("allow_search_engines", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Discoverable by Email</Label>
                    <p className="text-sm text-muted-foreground">Allow others to find you by your email address</p>
                  </div>
                  <Switch
                    checked={privacy.discoverable_by_email}
                    onCheckedChange={(checked) => updatePrivacySetting("discoverable_by_email", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">Share anonymized data for platform improvement</p>
                  </div>
                  <Switch
                    checked={privacy.data_sharing}
                    onCheckedChange={(checked) => updatePrivacySetting("data_sharing", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics Tracking</Label>
                    <p className="text-sm text-muted-foreground">Allow analytics tracking for better user experience</p>
                  </div>
                  <Switch
                    checked={privacy.analytics_tracking}
                    onCheckedChange={(checked) => updatePrivacySetting("analytics_tracking", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sign Out</CardTitle>
              <CardDescription>Sign out of your account on this device</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sign Out</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to sign out? You'll need to log in again to access your account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSignOut} disabled={isSigningOut}>
                      {isSigningOut ? "Signing out..." : "Sign Out"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible and destructive actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Deactivate Account</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Temporarily disable your account. You can reactivate it anytime.
                  </p>
                  <Button variant="outline" size="sm">
                    Deactivate Account
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-red-600">Delete Account</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove all your
                          data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700">Delete Account</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
