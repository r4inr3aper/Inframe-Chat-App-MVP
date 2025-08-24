"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  Send, 
  Smile, 
  Paperclip, 
  Phone, 
  Video, 
  MoreVertical,
  Check,
  CheckCheck,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

interface Message {
  id: string
  content: string
  timestamp: Date
  sender: "user" | "contact"
  status?: "sending" | "sent" | "delivered" | "read"
  type: "text" | "image" | "file"
  fileUrl?: string
  fileName?: string
}

interface ChatInterfaceProps {
  contactName: string
  contactAvatar?: string
  isOnline?: boolean
  messages: Message[]
  onSendMessage?: (content: string) => void
  onVideoCall?: () => void
  onPhoneCall?: () => void
  className?: string
}

export default function ChatInterface({
  contactName,
  contactAvatar,
  isOnline = false,
  messages = [],
  onSendMessage,
  onVideoCall,
  onPhoneCall,
  className = ""
}: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "sending":
        return <Clock className="w-3 h-3 text-muted-foreground" />
      case "sent":
        return <Check className="w-3 h-3 text-muted-foreground" />
      case "delivered":
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />
      case "read":
        return <CheckCheck className="w-3 h-3 text-accent" />
      default:
        return null
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className={`flex flex-col h-full bg-card ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={contactAvatar} alt={contactName} />
              <AvatarFallback className="bg-secondary text-secondary-foreground font-medium">
                {contactName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-card-foreground">{contactName}</h3>
            <p className="text-sm text-muted-foreground">
              {isOnline ? "Online" : "Last seen recently"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onVideoCall}
            className="h-9 w-9 p-0 hover:bg-secondary"
          >
            <Video className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onPhoneCall}
            className="h-9 w-9 p-0 hover:bg-secondary"
          >
            <Phone className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 hover:bg-secondary"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
              <DropdownMenuItem>Clear Chat</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-2 max-w-[70%] ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {message.sender === "contact" && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarImage src={contactAvatar} alt={contactName} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                      {contactName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className="flex flex-col">
                  <div
                    className={`px-4 py-2 rounded-2xl shadow-sm ${
                      message.sender === "user"
                        ? "bg-accent text-accent-foreground rounded-br-md"
                        : "bg-secondary text-secondary-foreground rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  
                  <div className={`flex items-center gap-1 mt-1 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.sender === "user" && getStatusIcon(message.status)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex justify-start"
          >
            <div className="flex gap-2 max-w-[70%]">
              <Avatar className="w-8 h-8 mt-1">
                <AvatarImage src={contactAvatar} alt={contactName} />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                  {contactName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="bg-secondary text-secondary-foreground px-4 py-2 rounded-2xl rounded-bl-md shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-card">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value)
                setIsTyping(e.target.value.length > 0)
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-20 py-3 rounded-full border-input focus:border-ring min-h-[44px]"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-secondary rounded-full"
              >
                <Smile className="w-4 h-4 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-secondary rounded-full"
              >
                <Paperclip className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="h-11 w-11 p-0 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all duration-200"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}