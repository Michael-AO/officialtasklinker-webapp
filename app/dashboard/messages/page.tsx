"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { useNotifications } from "@/contexts/notification-context"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { getInitials } from "@/lib/utils"
import {
  ActivityIcon as Attachment,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  Users,
  MessageCircle,
  Clock,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"

interface Message {
  id: string
  sender_id: string
  sender_name: string
  content: string
  timestamp: string
  type: "text" | "file"
  read: boolean
}

interface Conversation {
  id: string
  participant: {
    id: string
    name: string
    avatar: string | null
    role: string
    rating: number
    online: boolean
  }
  task_title: string
  task_id: string
  last_message: string
  last_message_time: string
  unread_count: number
  messages: Message[]
}

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { addNotification } = useNotifications()

  const clientParam = searchParams.get("client")
  const freelancerParam = searchParams.get("freelancer")
  const taskParam = searchParams.get("task")
  const highlightUser = clientParam || freelancerParam

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch conversations on mount
  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user])

  // Auto-select conversation based on URL params
  useEffect(() => {
    if (conversations.length > 0) {
      if (highlightUser) {
        const conversation = conversations.find((conv) => conv.participant.name === highlightUser)
        if (conversation) {
          setSelectedConversation(conversation)
        }
      } else if (taskParam) {
        const conversation = conversations.find((conv) => conv.task_id === taskParam)
        if (conversation) {
          setSelectedConversation(conversation)
        }
      } else if (!selectedConversation) {
        setSelectedConversation(conversations[0])
      }
    }
  }, [conversations, highlightUser, taskParam, selectedConversation])

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation?.messages])

  const fetchConversations = async () => {
    if (!user) return

    try {
      // Get conversations where user is participant
      const { data: conversations, error } = await supabase
        .from("conversations")
        .select(`
          id,
          task_id,
          client_id,
          freelancer_id,
          created_at,
          updated_at,
          tasks!inner(
            id,
            title
          )
        `)
        .or(`client_id.eq.${user.id},freelancer_id.eq.${user.id}`)
        .order("updated_at", { ascending: false })

      if (error) {
        console.error("Database error:", error)
        throw error
      }

      // Format conversations for frontend
      const formattedConversations = await Promise.all(
        (conversations || []).map(async (conv: any) => {
          // Determine the other participant
          const isClient = conv.client_id === user.id
          const otherUserId = isClient ? conv.freelancer_id : conv.client_id

          // Get other user's profile
          const { data: otherUser } = await supabase
            .from("users")
            .select("id, name, avatar_url, user_type, rating")
            .eq("id", otherUserId)
            .single()

          // Get messages for this conversation
          const { data: messages } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: true })

          // Get last message
          const lastMessage = messages?.[messages.length - 1]

          // Count unread messages
          const unreadCount = messages?.filter((msg: any) => msg.sender_id !== user.id && !msg.is_read).length || 0

          return {
            id: conv.id,
            participant: {
              id: otherUser?.id || otherUserId,
              name: otherUser?.name || "Unknown User",
              avatar: otherUser?.avatar_url,
              role: isClient ? "Freelancer" : "Client",
              rating: otherUser?.rating || 0,
              online: false,
            },
            task_title: conv.tasks?.title || "Unknown Task",
            task_id: conv.task_id,
            last_message: lastMessage?.content || "No messages yet",
            last_message_time: lastMessage?.created_at || conv.created_at,
            unread_count: unreadCount,
            messages:
              messages?.map((msg: any) => ({
                id: msg.id,
                sender_id: msg.sender_id,
                sender_name: msg.sender_id === user.id ? "You" : otherUser?.name || "Unknown",
                content: msg.content,
                timestamp: msg.created_at,
                type: "text" as const,
                read: msg.is_read,
              })) || [],
          }
        }),
      )

      setConversations(formattedConversations)
    } catch (error) {
      console.error("Error fetching conversations:", error)
      toast({
        title: "Error loading messages",
        description: "Please refresh the page to try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending || !user) return

    setSending(true)
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          content: newMessage,
          message_type: "text",
          is_read: false,
        })
        .select()
        .single()

      if (error) throw error

      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", selectedConversation.id)

      // Create new message object
      const newMessageObj = {
        id: data.id,
        sender_id: user.id,
        sender_name: "You",
        content: newMessage,
        timestamp: data.created_at,
        type: "text" as const,
        read: false,
      }

      // Update conversation with new message
      const updatedConversation = {
        ...selectedConversation,
        messages: [...selectedConversation.messages, newMessageObj],
        last_message: newMessage,
        last_message_time: new Date().toISOString(),
      }

      setSelectedConversation(updatedConversation)

      // Update conversations list
      setConversations((prev) => prev.map((conv) => (conv.id === selectedConversation.id ? updatedConversation : conv)))

      setNewMessage("")

      // Add notification for recipient
      addNotification({
        title: "Message Sent",
        message: `Your message has been sent to ${selectedConversation.participant.name}`,
        type: "success",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const markAsRead = async (conversationId: string) => {
    try {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", user?.id)

      // Update local state
      setConversations((prev) => prev.map((conv) => (conv.id === conversationId ? { ...conv, unread_count: 0 } : conv)))
    } catch (error) {
      console.error("Error marking as read:", error)
    }
  }

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.task_title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Messages</h1>
            <div className="text-muted-foreground">Loading conversations...</div>
          </div>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Loading your messages...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <div className="text-muted-foreground">
            Communicate with clients and freelancers
            {highlightUser && (
              <Badge variant="outline" className="ml-2">
                Opened from {highlightUser}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Messages Interface */}
      <Card>
        <CardContent className="p-0">
          <div className="h-[calc(100vh-12rem)] flex">
            {/* Conversations List */}
            <div className="w-1/3 border-r bg-muted/10">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <ScrollArea className="h-[calc(100%-5rem)]">
                <div className="p-2">
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedConversation?.id === conversation.id ? "bg-muted" : ""
                        } ${conversation.participant.name === highlightUser ? "ring-2 ring-blue-500" : ""}`}
                        onClick={() => {
                          setSelectedConversation(conversation)
                          if (conversation.unread_count > 0) {
                            markAsRead(conversation.id)
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={conversation.participant.avatar || undefined} />
                              <AvatarFallback>
                                {getInitials(conversation.participant.name)}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.participant.online && (
                              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium truncate">{conversation.participant.name}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {conversation.participant.role}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                {conversation.unread_count > 0 && (
                                  <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                    {conversation.unread_count}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(conversation.last_message_time)}
                                </span>
                              </div>
                            </div>

                            <div className="text-sm text-muted-foreground truncate mt-1">{conversation.task_title}</div>
                            <div className="text-sm truncate mt-1">{conversation.last_message}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">No conversations found</p>
                      <div className="text-sm">Try adjusting your search</div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Area */}
            {selectedConversation ? (
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b bg-background">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                                                    <Avatar className="h-10 w-10">
                              <AvatarImage src={selectedConversation.participant.avatar || undefined} />
                              <AvatarFallback>
                                {getInitials(selectedConversation.participant.name)}
                              </AvatarFallback>
                            </Avatar>
                        {selectedConversation.participant.online && (
                          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{selectedConversation.participant.name}</h3>
                        </div>
                        <div className="text-sm text-muted-foreground">{selectedConversation.task_title}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Disabled call and video buttons */}
                      <Button variant="outline" size="sm" disabled className="opacity-50">
                        <Clock className="h-4 w-4" />
                        <span className="sr-only">Call (Coming Soon)</span>
                      </Button>
                      <Button variant="outline" size="sm" disabled className="opacity-50">
                        <Clock className="h-4 w-4" />
                        <span className="sr-only">Video (Coming Soon)</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>View Task</DropdownMenuItem>
                          <DropdownMenuItem>Archive Conversation</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Block User</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          {message.type === "file" ? (
                            <div className="flex items-center gap-2">
                              <Attachment className="h-4 w-4" />
                              <span className="text-sm">{message.content}</span>
                            </div>
                          ) : (
                            <div className="text-sm">{message.content}</div>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                            {message.sender_id === user?.id && (
                              <span className="text-xs opacity-70">{message.read ? "Read" : "Sent"}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t bg-background">
                  <div className="flex items-end gap-2">
                    <Button variant="outline" size="sm" disabled className="opacity-50">
                      <Paperclip className="h-4 w-4" />
                      <span className="sr-only">Attach File (Coming Soon)</span>
                    </Button>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        className="min-h-[40px] max-h-[120px] resize-none"
                        disabled={sending}
                      />
                    </div>
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim() || sending}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                  <div>Choose a conversation from the list to start messaging</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
