"use client"

import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  BellDot, 
  X, 
  MessageSquare, 
  Users, 
  Megaphone, 
  Shield, 
  Check, 
  Reply, 
  Filter,
  Settings,
  ChevronDown,
  Clock,
  Star
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface Notification {
  id: string
  type: 'message' | 'invitation' | 'announcement' | 'admin'
  title: string
  content: string
  sender?: string
  timestamp: Date
  read: boolean
  priority: 'low' | 'medium' | 'high'
  actionable?: boolean
}

interface NotificationCenterProps {
  className?: string
  variant?: 'dropdown' | 'modal'
  notifications?: Notification[]
  onNotificationRead?: (id: string) => void
  onNotificationReply?: (id: string) => void
  onMarkAllRead?: () => void
  onNotificationPreferences?: () => void
}

const defaultNotifications: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'New message from Sarah Chen',
    content: 'Hey! Just wanted to follow up on our discussion about the project timeline...',
    sender: 'Sarah Chen',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    priority: 'medium',
    actionable: true
  },
  {
    id: '2',
    type: 'invitation',
    title: 'Team invitation to Design System Group',
    content: 'You\'ve been invited to join the Design System working group. This group focuses on...',
    sender: 'Alex Rodriguez',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    priority: 'high',
    actionable: true
  },
  {
    id: '3',
    type: 'announcement',
    title: 'System maintenance scheduled',
    content: 'We will be performing scheduled maintenance on Sunday, December 15th from 2:00 AM to 4:00 AM EST.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
    priority: 'low'
  },
  {
    id: '4',
    type: 'admin',
    title: 'Security alert: New login detected',
    content: 'A new login was detected from Chrome on macOS in San Francisco, CA.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: false,
    priority: 'high'
  }
]

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'message':
      return MessageSquare
    case 'invitation':
      return Users
    case 'announcement':
      return Megaphone
    case 'admin':
      return Shield
    default:
      return Bell
  }
}

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'message':
      return 'text-blue-600'
    case 'invitation':
      return 'text-green-600'
    case 'announcement':
      return 'text-amber-600'
    case 'admin':
      return 'text-red-600'
    default:
      return 'text-muted-foreground'
  }
}

const getPriorityIndicator = (priority: Notification['priority']) => {
  switch (priority) {
    case 'high':
      return 'bg-red-500'
    case 'medium':
      return 'bg-amber-500'
    case 'low':
      return 'bg-gray-400'
  }
}

const formatTimestamp = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return timestamp.toLocaleDateString()
}

export default function NotificationCenter({
  className = "",
  variant = 'dropdown',
  notifications = defaultNotifications,
  onNotificationRead,
  onNotificationReply,
  onMarkAllRead,
  onNotificationPreferences
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [timeFilter, setTimeFilter] = useState('all')
  const [localNotifications, setLocalNotifications] = useState(notifications)

  useEffect(() => {
    setLocalNotifications(notifications)
  }, [notifications])

  const unreadCount = localNotifications.filter(n => !n.read).length

  const handleMarkAsRead = (id: string) => {
    setLocalNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    onNotificationRead?.(id)
    toast.success("Marked as read")
  }

  const handleMarkAllRead = () => {
    setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })))
    onMarkAllRead?.()
    toast.success("All notifications marked as read")
  }

  const handleReply = (id: string) => {
    onNotificationReply?.(id)
    toast.success("Opening reply...")
  }

  const filteredNotifications = localNotifications.filter(notification => {
    // Tab filter
    if (activeTab === 'unread' && notification.read) return false
    if (activeTab === 'important' && notification.priority !== 'high') return false
    
    // Type filter
    if (typeFilter.length > 0 && !typeFilter.includes(notification.type)) return false
    
    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date()
      const notificationTime = notification.timestamp
      const diffHours = (now.getTime() - notificationTime.getTime()) / (1000 * 60 * 60)
      
      if (timeFilter === 'hour' && diffHours > 1) return false
      if (timeFilter === 'day' && diffHours > 24) return false
      if (timeFilter === 'week' && diffHours > 168) return false
    }
    
    return true
  })

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const IconComponent = getNotificationIcon(notification.type)
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        className={`
          group relative p-4 border-b border-border hover:bg-muted/50 transition-colors
          ${!notification.read ? 'bg-card border-l-4 border-l-accent' : ''}
        `}
      >
        <div className="flex gap-3">
          <div className={`
            flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center
            ${getNotificationColor(notification.type)}
          `}>
            <IconComponent className="w-4 h-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className={`
                text-sm font-medium leading-tight
                ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}
              `}>
                {notification.title}
              </h4>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className={`
                  w-2 h-2 rounded-full flex-shrink-0
                  ${getPriorityIndicator(notification.priority)}
                `} />
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(notification.timestamp)}
                </span>
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                )}
              </div>
            </div>
            
            {notification.sender && (
              <p className="text-xs text-muted-foreground mb-1">
                from {notification.sender}
              </p>
            )}
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {notification.content}
            </p>
            
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.read && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="h-7 px-2 text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark read
                </Button>
              )}
              {notification.actionable && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleReply(notification.id)}
                  className="h-7 px-2 text-xs"
                >
                  <Reply className="w-3 h-3 mr-1" />
                  Reply
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  const NotificationContent = () => (
    <div className="w-96 max-h-[600px] bg-card border border-border rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-lg">Notifications</h3>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Filter className="w-4 h-4 mr-1" />
                  Filter
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="p-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Type</p>
                  {['message', 'invitation', 'announcement', 'admin'].map(type => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={typeFilter.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setTypeFilter(prev => [...prev, type])
                        } else {
                          setTypeFilter(prev => prev.filter(t => t !== type))
                        }
                      }}
                      className="capitalize"
                    >
                      {type}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Time</p>
                  {[
                    { value: 'all', label: 'All time' },
                    { value: 'hour', label: 'Last hour' },
                    { value: 'day', label: 'Last day' },
                    { value: 'week', label: 'Last week' }
                  ].map(option => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setTimeFilter(option.value)}
                      className={timeFilter === option.value ? 'bg-accent text-accent-foreground' : ''}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="ghost"
              size="sm" 
              onClick={onNotificationPreferences}
              className="h-8 px-2"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="text-xs">
              All ({localNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="important" className="text-xs">
              <Star className="w-3 h-3 mr-1" />
              Important
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex-1">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No notifications found</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </AnimatePresence>
          </ScrollArea>
        )}
      </div>
      
      {unreadCount > 0 && (
        <div className="p-3 border-t border-border bg-muted/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            className="w-full h-8 text-xs"
          >
            <Check className="w-3 h-3 mr-1" />
            Mark all as read
          </Button>
        </div>
      )}
    </div>
  )

  if (variant === 'modal') {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="absolute -top-2 -right-2 z-10 rounded-full bg-background shadow-md"
          >
            <X className="w-4 h-4" />
          </Button>
          <NotificationContent />
        </div>
      </div>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative ${className}`}
        >
          {unreadCount > 0 ? (
            <BellDot className="w-5 h-5" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="secondary"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-accent text-accent-foreground"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        sideOffset={8}
        className="p-0 w-auto"
      >
        <NotificationContent />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}