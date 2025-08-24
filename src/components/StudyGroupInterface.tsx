"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Users,
  Settings,
  Info,
  Hash,
  Calendar,
  Clock,
  BookOpen,
  UserPlus,
  UserMinus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog"
import { GroupChatMessage, Group, User } from "@/types/chat"

interface StudyGroupInterfaceProps {
  group: Group
  messages: GroupChatMessage[]
  currentUser: User
  onSendMessage?: (content: string) => void
  onManageGroup?: () => void
  onAddMember?: () => void
  onRemoveMember?: (memberId: string) => void
  className?: string
}

export default function StudyGroupInterface({
  group,
  messages = [],
  currentUser,
  onSendMessage,
  onManageGroup,
  onAddMember,
  onRemoveMember,
  className = ""
}: StudyGroupInterfaceProps) {
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [showMembersDialog, setShowMembersDialog] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Simple permissions: professor can always send, students can send only if profControlled is false
  const isProfessor = currentUser.role === 'professor' && (currentUser.professorId || currentUser.id) === group.professorId
  const canSend = isProfessor || !group.profControlled
  const inputDisabled = !canSend
  const disabledReason = group.profControlled && !isProfessor
    ? 'Only the professor can send messages in this group'
    : undefined

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim() && onSendMessage) {
      onSendMessage(newMessage.trim())
      setNewMessage("")
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(date)
    }
  }

  const shouldShowDateSeparator = (currentMsg: GroupChatMessage, prevMsg?: GroupChatMessage) => {
    if (!prevMsg) return true
    const currentDate = new Date(currentMsg.timestamp).toDateString()
    const prevDate = new Date(prevMsg.timestamp).toDateString()
    return currentDate !== prevDate
  }



  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <Hash className="h-5 w-5 text-accent-foreground" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-foreground">{group.name}</h2>
              {group.subject && (
                <Badge variant="secondary" className="text-xs">
                  {group.subject}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {group.members.length} member{group.members.length !== 1 ? 's' : ''} • {group.professor.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMembersDialog(true)}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">{group.members.length}</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowMembersDialog(true)}>
                <Users className="h-4 w-4 mr-2" />
                View Members
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Info className="h-4 w-4 mr-2" />
                Group Info
              </DropdownMenuItem>
              {isProfessor && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onManageGroup}>
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Group
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onAddMember}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Members
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 pt-2">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>
        </div>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => {
                const prevMessage = index > 0 ? messages[index - 1] : undefined
                const showDateSeparator = shouldShowDateSeparator(message, prevMessage)
                const isCurrentUser = message.senderId === currentUser.id
                const showAvatar = !prevMessage || 
                               prevMessage.senderId !== message.senderId ||
                               showDateSeparator

                return (
                  <div key={message.id}>
                    {showDateSeparator && (
                      <div className="flex items-center justify-center my-4">
                        <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                          {formatDate(message.timestamp)}
                        </div>
                      </div>
                    )}
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isCurrentUser && showAvatar && (
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarImage src={message.senderAvatar} alt={message.senderName} />
                          <AvatarFallback className="text-xs">
                            {message.senderName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      {!isCurrentUser && !showAvatar && (
                        <div className="w-8" />
                      )}

                      <div className={`flex flex-col max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                        {showAvatar && !isCurrentUser && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-foreground">
                              {message.senderName}
                            </span>
                            {message.senderRole === 'professor' && (
                              <Badge variant="outline" className="text-xs">
                                Professor
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                        )}
                        
                        <div
                          className={`rounded-lg px-3 py-2 max-w-full break-words ${
                            isCurrentUser
                              ? 'bg-accent text-accent-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          {isCurrentUser && (
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <span className="text-xs opacity-70">
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )
              })}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span className="text-sm">Someone is typing...</span>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input / Read-only Notice */}
          {canSend ? (
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value)
                      setIsTyping(e.target.value.length > 0)
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${group.name}...`}
                    className="pr-20 resize-none"
                    maxLength={1000}
                  />

                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="sm"
                  className="h-10 w-10 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>
                  Press Enter to send, Shift + Enter for new line
                </span>
                <span>
                  {newMessage.length}/1000
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 border-t border-border bg-card text-center text-sm text-muted-foreground">
              Only the professor can send messages in this group
            </div>
          )}
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info" className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Group Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-foreground mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-foreground mb-1">Subject</h4>
                    <p className="text-sm text-muted-foreground">{group.subject || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-foreground mb-1">Max Members</h4>
                    <p className="text-sm text-muted-foreground">{group.maxMembers || 'Unlimited'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-foreground mb-1">Created</h4>
                    <p className="text-sm text-muted-foreground">{formatDate(group.createdAt)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-foreground mb-1">Last Updated</h4>
                    <p className="text-sm text-muted-foreground">{formatDate(group.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Professor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={group.professor.avatar} alt={group.professor.name} />
                    <AvatarFallback>
                      {group.professor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{group.professor.name}</h4>
                    <p className="text-sm text-muted-foreground">{group.professor.department}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${group.professor.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-xs text-muted-foreground">
                        {group.professor.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">Members ({group.members.length})</h3>
              {isProfessor && (
                <Button onClick={onAddMember} size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              {group.members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-sm text-foreground">{member.name}</h4>
                      <p className="text-xs text-muted-foreground">{member.studentId} • {member.department}</p>
                    </div>
                  </div>

                  {isProfessor && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveMember?.(member.id)}
                      title="Remove Member"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Members Dialog */}
      <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Group Members</DialogTitle>
            <DialogDescription>
              {group.members.length} member{group.members.length !== 1 ? 's' : ''} in {group.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar-thin">
            {group.members.map(member => (
              <div key={member.id} className="flex items-center gap-3 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-xs">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.studentId}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
