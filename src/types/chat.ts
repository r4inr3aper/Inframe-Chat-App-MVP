export interface Professor {
  id: string
  name: string
  email: string
  department: string
  specialization: string[]
  avatar?: string
  isOnline: boolean
  officeHours: string
  bio: string
  rating: number
  responseTime: string
  subjects: string[]
}

export interface ChatMessage {
  id: string
  content: string
  timestamp: Date
  sender: "user" | "professor"
  status?: "sending" | "sent" | "delivered" | "read"
  type: "text" | "image" | "file"
  fileUrl?: string
  fileName?: string
}

export interface ChatSession {
  id: string
  professorId: string
  professor: Professor
  messages: ChatMessage[]
  lastMessage?: ChatMessage
  unreadCount: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  studentId?: string
  professorId?: string
  department: string
  role: "student" | "professor"
  year?: number
  batch?: string
  semester?: number
}

export interface Group {
  id: string
  name: string
  description: string
  professorId: string
  professor: Professor
  members: User[]
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  maxMembers?: number
  subject?: string
  // Simple permission control: if true, only professor can send messages
  profControlled?: boolean
}

export interface GroupChatMessage {
  id: string
  content: string
  timestamp: Date
  senderId: string
  senderName: string
  senderRole: "student" | "professor"
  senderAvatar?: string
  type: "text" | "image" | "file"
  fileUrl?: string
  fileName?: string
}

export interface GroupChat {
  id: string
  groupId: string
  messages: GroupChatMessage[]
  lastActivity: Date
  isActive: boolean
}
