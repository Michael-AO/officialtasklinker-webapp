"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ActivityIcon as Attachment,
  MoreHorizontal,
  Paperclip,
  Phone,
  Search,
  Send,
  Star,
  Video,
  Users,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"

// Mock data for conversations - in real app, this would come from Supabase
const generateMockConversations = (highlightUser?: string) => [
  {
    id: "1",
    participant: {
      name: "TechCorp Solutions",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Client",
      rating: 4.8,
      online: true,
    },
    taskTitle: "E-commerce Website Development",
    lastMessage: "Great! When can we schedule a call to discuss the requirements?",
    lastMessageTime: "2024-01-18T10:30:00Z",
    unreadCount: highlightUser === "TechCorp Solutions" ? 1 : 2,
    messages: [
      {
        id: "1",
        senderId: "client-1",
        senderName: "TechCorp Solutions",
        content: "Hi! I'm interested in your proposal for the e-commerce website.",
        timestamp: "2024-01-18T09:00:00Z",
        type: "text",
      },
      {
        id: "2",
        senderId: "me",
        senderName: "You",
        content: "Thank you for considering my proposal! I'd be happy to discuss the project details with you.",
        timestamp: "2024-01-18T09:15:00Z",
        type: "text",
      },
      {
        id: "3",
        senderId: "client-1",
        senderName: "TechCorp Solutions",
        content: "Great! When can we schedule a call to discuss the requirements?",
        timestamp: "2024-01-18T10:30:00Z",
        type: "text",
      },
    ],
  },
  {
    id: "2",
    participant: {
      name: "FitLife Nigeria",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Client",
      rating: 4.6,
      online: false,
    },
    taskTitle: "Mobile App UI/UX Design",
    lastMessage: "The wireframes look perfect! Let's proceed with the next phase.",
    lastMessageTime: "2024-01-17T16:45:00Z",
    unreadCount: 0,
    messages: [
      {
        id: "1",
        senderId: "client-2",
        senderName: "FitLife Nigeria",
        content: "I've reviewed your portfolio and I'm impressed with your design work.",
        timestamp: "2024-01-17T14:00:00Z",
        type: "text",
      },
      {
        id: "2",
        senderId: "me",
        senderName: "You",
        content: "Thank you! I've attached some initial wireframes for your review.",
        timestamp: "2024-01-17T15:30:00Z",
        type: "text",
      },
      {
        id: "3",
        senderId: "me",
        senderName: "You",
        content: "wireframes_v1.pdf",
        timestamp: "2024-01-17T15:31:00Z",
        type: "file",
      },
      {
        id: "4",
        senderId: "client-2",
        senderName: "FitLife Nigeria",
        content: "The wireframes look perfect! Let's proceed with the next phase.",
        timestamp: "2024-01-17T16:45:00Z",
        type: "text",
      },
    ],
  },
  {
    id: "3",
    participant: {
      name: "Adebayo Ogundimu",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Freelancer",
      rating: 4.9,
      online: true,
    },
    taskTitle: "Content Writing Collaboration",
    lastMessage: "I can help with the SEO optimization part of the project.",
    lastMessageTime: "2024-01-16T11:20:00Z",
    unreadCount: highlightUser === "Adebayo Ogundimu" ? 1 : 0,
    messages: [
      {
        id: "1",
        senderId: "freelancer-1",
        senderName: "Adebayo Ogundimu",
        content: "Hi! I saw your post about needing help with content writing.",
        timestamp: "2024-01-16T10:00:00Z",
        type: "text",
      },
      {
        id: "2",
        senderId: "me",
        senderName: "You",
        content: "Yes! I'm looking for someone to collaborate on SEO content.",
        timestamp: "2024-01-16T10:30:00Z",
        type: "text",
      },
      {
        id: "3",
        senderId: "freelancer-1",
        senderName: "Adebayo Ogundimu",
        content: "I can help with the SEO optimization part of the project.",
        timestamp: "2024-01-16T11:20:00Z",
        type: "text",
      },
    ],
  },
]

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const clientParam = searchParams.get("client")
  const freelancerParam = searchParams.get("freelancer")
  const highlightUser = clientParam || freelancerParam

  const mockConversations = generateMockConversations(highlightUser)

  // Find conversation to highlight or default to first
  const initialConversation = highlightUser
    ? mockConversations.find((conv) => conv.participant.name === highlightUser) || mockConversations[0]
    : mockConversations[0]

  const [selectedConversation, setSelectedConversation] = useState(initialConversation)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation.messages])

  // Show notification if user came from applications page
  useEffect(() => {
    if (highlightUser) {
      // Auto-focus on the highlighted conversation
      const conversation = mockConversations.find((conv) => conv.participant.name === highlightUser)
      if (conversation) {
        setSelectedConversation(conversation)
      }
    }
  }, [highlightUser])

  const filteredConversations = mockConversations.filter(
    (conv) =>
      conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message = {
      id: Date.now().toString(),
      senderId: "me",
      senderName: "You",
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: "text" as const,
    }

    // Update the selected conversation
    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, message],
      lastMessage: newMessage,
      lastMessageTime: new Date().toISOString(),
    }

    setSelectedConversation(updatedConversation)
    setNewMessage("")
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with clients and freelancers
            {highlightUser && (
              <Badge variant="outline" className="ml-2">
                Opened from {highlightUser}
              </Badge>
            )}
          </p>
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
                          selectedConversation.id === conversation.id ? "bg-muted" : ""
                        } ${conversation.participant.name === highlightUser ? "ring-2 ring-blue-500" : ""}`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={conversation.participant.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {conversation.participant.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
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
                                {conversation.unreadCount > 0 && (
                                  <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(conversation.lastMessageTime)}
                                </span>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground truncate mt-1">{conversation.taskTitle}</p>

                            <p className="text-sm truncate mt-1">{conversation.lastMessage}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">No conversations found</p>
                      <p className="text-sm">Try adjusting your search</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b bg-background">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedConversation.participant.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {selectedConversation.participant.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {selectedConversation.participant.online && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{selectedConversation.participant.name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{selectedConversation.participant.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedConversation.taskTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="h-4 w-4" />
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
                      className={`flex ${message.senderId === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.senderId === "me" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {message.type === "file" ? (
                          <div className="flex items-center gap-2">
                            <Attachment className="h-4 w-4" />
                            <span className="text-sm">{message.content}</span>
                          </div>
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
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
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4" />
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
                    />
                  </div>
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
