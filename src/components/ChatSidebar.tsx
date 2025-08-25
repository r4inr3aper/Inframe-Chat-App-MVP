"use client"

import { useState, useEffect } from "react"
import { Search, Plus, MessageCircle, Users, MoreHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ChatSession } from "@/types/chat"
import { useChatStore } from "@/stores"

interface ChatItem {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  timestamp: string
  unreadCount?: number
  isOnline?: boolean
  type: "professor" | "group"
}

interface ChatSidebarProps {
  className?: string
  isCollapsed?: boolean
  onToggle?: () => void
  onSelectChat?: (chatId: string) => void
  onNewChat?: () => void
  activeChatId?: string
}

export default function ChatSidebar({
  className = "",
  isCollapsed = false,
  onToggle,
  onSelectChat,
  onNewChat,
  activeChatId
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { chatSessions } = useChatStore()

  // Chat sessions are now managed by Zustand store

  // Convert ChatSession to ChatItem format
  const chatItems: ChatItem[] = chatSessions.map(session => ({
    id: session.id,
    name: session.professor.name,
    avatar: session.professor.avatar,
    lastMessage: session.lastMessage?.content || "No messages yet",
    timestamp: formatTimestamp(session.updatedAt),
    unreadCount: session.unreadCount,
    isOnline: session.professor.isOnline,
    type: "professor" as const
  }))

  const filteredChats = chatItems.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const professorChats = filteredChats.filter(chat => chat.type === "professor")

  function formatTimestamp(date: Date): string {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "now"
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  const ChatItem = ({ chat }: { chat: ChatItem }) => (
    <button
      key={chat.id}
      onClick={() => {
        onSelectChat?.(chat.id)
        // TODO: Implement mark as read functionality
        console.log('Mark as read:', chat.id)
      }}
      className={`w-full p-3 rounded-lg text-left transition-all duration-200 group hover:bg-sidebar-accent ${
        activeChatId === chat.id ? "bg-accent/20 border border-accent/30" : "hover:bg-sidebar-accent"
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
          {chat.type === "professor" && (
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-sidebar ${
              chat.isOnline ? "bg-green-500" : "bg-muted-foreground"
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
            {chat.unreadCount && chat.unreadCount > 0 && (
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
          {chatItems.slice(0, 5).map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat?.(chat.id)}
              className={`relative w-10 h-10 rounded-lg transition-colors ${
                activeChatId === chat.id ? "bg-accent/20" : "hover:bg-sidebar-accent"
              }`}
            >
              <Avatar className="h-8 w-8 mx-auto">
                <AvatarImage src={chat.avatar} alt={chat.name} />
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                  {chat.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {chat.unreadCount && chat.unreadCount > 0 && (
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
          <Button
            onClick={onNewChat}
            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Find Professor
          </Button>
        </div>
      </div>

      {/* Chat Lists */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Professor Chats */}
        {professorChats.length > 0 && (
          <div className="p-4">
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Professor Chats
            </h4>
            <div className="space-y-1">
              {professorChats.map(chat => (
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

        {chatItems.length === 0 && !searchQuery && (
          <div className="p-4 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">No chats yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Start a conversation with a professor</p>
            <Button onClick={onNewChat} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Find Professor
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}