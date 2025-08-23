"use client"

import { useState } from "react"
import { Search, Plus, MessageCircle, Users, MoreHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface ChatItem {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  timestamp: string
  unreadCount?: number
  isOnline?: boolean
  type: "direct" | "group"
}

interface ChatSidebarProps {
  className?: string
  isCollapsed?: boolean
  onToggle?: () => void
}

const mockChats: ChatItem[] = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "/avatars/sarah.jpg",
    lastMessage: "Hey! How's the project going?",
    timestamp: "2m",
    unreadCount: 2,
    isOnline: true,
    type: "direct"
  },
  {
    id: "2",
    name: "Design Team",
    avatar: "/avatars/design-team.jpg",
    lastMessage: "Updated the wireframes",
    timestamp: "15m",
    unreadCount: 5,
    type: "group"
  },
  {
    id: "3",
    name: "Alex Johnson",
    avatar: "/avatars/alex.jpg",
    lastMessage: "Thanks for the feedback!",
    timestamp: "1h",
    isOnline: false,
    type: "direct"
  },
  {
    id: "4",
    name: "Product Team",
    avatar: "/avatars/product-team.jpg",
    lastMessage: "Meeting at 3pm today",
    timestamp: "2h",
    type: "group"
  },
  {
    id: "5",
    name: "Maya Rodriguez",
    avatar: "/avatars/maya.jpg",
    lastMessage: "Great work on the presentation",
    timestamp: "1d",
    isOnline: true,
    type: "direct"
  }
]

export default function ChatSidebar({ className = "", isCollapsed = false, onToggle }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeChat, setActiveChat] = useState("1")

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const directMessages = filteredChats.filter(chat => chat.type === "direct")
  const groupChats = filteredChats.filter(chat => chat.type === "group")

  const ChatItem = ({ chat }: { chat: ChatItem }) => (
    <button
      key={chat.id}
      onClick={() => setActiveChat(chat.id)}
      className={`w-full p-3 rounded-lg text-left transition-all duration-200 group hover:bg-sidebar-accent ${
        activeChat === chat.id ? "bg-accent/20 border border-accent/30" : "hover:bg-sidebar-accent"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={chat.avatar} alt={chat.name} />
            <AvatarFallback className="bg-muted text-muted-foreground">
              {chat.name.split(" ").map(n => n[0]).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {chat.type === "direct" && (
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-sidebar ${
              chat.isOnline ? "bg-accent" : "bg-muted-foreground"
            }`} />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-sm text-foreground truncate">
              {chat.name}
            </h4>
            <span className="text-xs text-muted-foreground">
              {chat.timestamp}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground truncate">
              {chat.lastMessage}
            </p>
            {chat.unreadCount && (
              <Badge className="bg-accent text-accent-foreground text-xs px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                {chat.unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  )

  if (isCollapsed) {
    return (
      <div className={`w-16 h-full bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-10 h-10 p-0 mb-4"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
        
        <div className="flex flex-col gap-2">
          {mockChats.slice(0, 5).map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`relative w-10 h-10 rounded-lg transition-colors ${
                activeChat === chat.id ? "bg-accent/20" : "hover:bg-sidebar-accent"
              }`}
            >
              <Avatar className="h-8 w-8 mx-auto">
                <AvatarImage src={chat.avatar} alt={chat.name} />
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                  {chat.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {chat.unreadCount && (
                <Badge className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs px-1 py-0 min-w-[16px] h-[16px] flex items-center justify-center">
                  {chat.unreadCount}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`w-80 h-full bg-sidebar border-r border-sidebar-border flex flex-col ${className}`}>
      {/* User Profile Section */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/avatars/user.jpg" alt="You" />
              <AvatarFallback className="bg-accent text-accent-foreground font-medium">
                ME
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full border-2 border-sidebar" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium text-foreground">You</h3>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
          
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            {onToggle && (
              <Button variant="ghost" size="sm" onClick={onToggle} className="w-8 h-8 p-0 md:hidden">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-border"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex gap-2">
          <Button className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
          <Button variant="outline" className="flex-1">
            <Users className="h-4 w-4 mr-2" />
            New Group
          </Button>
        </div>
      </div>

      {/* Chat Lists */}
      <div className="flex-1 overflow-y-auto">
        {/* Direct Messages */}
        {directMessages.length > 0 && (
          <div className="p-4">
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Direct Messages
            </h4>
            <div className="space-y-1">
              {directMessages.map(chat => (
                <ChatItem key={chat.id} chat={chat} />
              ))}
            </div>
          </div>
        )}

        {/* Group Chats */}
        {groupChats.length > 0 && (
          <div className="p-4">
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Group Chats
            </h4>
            <div className="space-y-1">
              {groupChats.map(chat => (
                <ChatItem key={chat.id} chat={chat} />
              ))}
            </div>
          </div>
        )}

        {filteredChats.length === 0 && searchQuery && (
          <div className="p-4 text-center">
            <p className="text-muted-foreground">No chats found</p>
          </div>
        )}
      </div>
    </div>
  )
}