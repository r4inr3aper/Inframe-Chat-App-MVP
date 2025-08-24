import { Professor, ChatMessage, ChatSession } from "@/types/chat"
import professorsData from "@/data/professors.json"
import chatsData from "@/data/chats.json"

// In a real app, this would be replaced with actual API calls
export class ChatService {
  private static professors: Professor[] = professorsData as Professor[]
  private static chats: any[] = chatsData as any[]

  // Get all professors
  static getAllProfessors(): Professor[] {
    return this.professors
  }

  // Get professor by ID
  static getProfessorById(id: string): Professor | undefined {
    return this.professors.find(prof => prof.id === id)
  }

  // Search professors
  static searchProfessors(query: string, department?: string): Professor[] {
    let filtered = this.professors

    if (query.trim()) {
      filtered = filtered.filter(prof =>
        prof.name.toLowerCase().includes(query.toLowerCase()) ||
        prof.department.toLowerCase().includes(query.toLowerCase()) ||
        prof.specialization.some(spec => 
          spec.toLowerCase().includes(query.toLowerCase())
        ) ||
        prof.subjects.some(subject => 
          subject.toLowerCase().includes(query.toLowerCase())
        )
      )
    }

    if (department && department !== "all") {
      filtered = filtered.filter(prof => prof.department === department)
    }

    return filtered
  }

  // Get chat sessions for current user
  static getChatSessions(): ChatSession[] {
    return this.chats.map(chat => {
      const professor = this.getProfessorById(chat.professorId)
      if (!professor) return null

      const messages: ChatMessage[] = chat.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))

      const lastMessage = messages[messages.length - 1]

      return {
        id: chat.id,
        professorId: chat.professorId,
        professor,
        messages,
        lastMessage,
        unreadCount: chat.unreadCount,
        isActive: chat.isActive,
        createdAt: new Date(chat.createdAt),
        updatedAt: new Date(chat.updatedAt)
      }
    }).filter(Boolean) as ChatSession[]
  }

  // Get specific chat session
  static getChatSession(chatId: string): ChatSession | undefined {
    const sessions = this.getChatSessions()
    return sessions.find(session => session.id === chatId)
  }

  // Start new chat with professor
  static startChatWithProfessor(professorId: string): ChatSession {
    const professor = this.getProfessorById(professorId)
    if (!professor) {
      throw new Error("Professor not found")
    }

    const newChatId = `chat-${Date.now()}`
    const welcomeMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: `Hello! I'm ${professor.name}. How can I help you today?`,
      timestamp: new Date(),
      sender: "professor",
      status: "delivered",
      type: "text"
    }

    const newChat: ChatSession = {
      id: newChatId,
      professorId,
      professor,
      messages: [welcomeMessage],
      lastMessage: welcomeMessage,
      unreadCount: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // In a real app, this would be saved to the backend
    this.chats.push({
      id: newChatId,
      professorId,
      messages: [welcomeMessage],
      unreadCount: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    return newChat
  }

  // Send message in chat
  static sendMessage(chatId: string, content: string): ChatMessage {
    const chatIndex = this.chats.findIndex(chat => chat.id === chatId)
    if (chatIndex === -1) {
      throw new Error("Chat not found")
    }

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content,
      timestamp: new Date(),
      sender: "user",
      status: "sent",
      type: "text"
    }

    // Add message to chat
    this.chats[chatIndex].messages.push({
      ...newMessage,
      timestamp: newMessage.timestamp.toISOString()
    })
    this.chats[chatIndex].updatedAt = new Date().toISOString()

    // Simulate professor response after a delay
    setTimeout(() => {
      this.simulateProfessorResponse(chatId)
    }, 2000 + Math.random() * 3000) // Random delay between 2-5 seconds

    return newMessage
  }

  // Simulate professor response
  private static simulateProfessorResponse(chatId: string) {
    const chatIndex = this.chats.findIndex(chat => chat.id === chatId)
    if (chatIndex === -1) return

    const professor = this.getProfessorById(this.chats[chatIndex].professorId)
    if (!professor) return

    const responses = [
      "That's a great question! Let me explain...",
      "I understand your concern. Here's how I would approach this...",
      "Excellent point! This is actually a common topic in my field...",
      "Let me break this down for you step by step...",
      "That's an interesting perspective. Have you considered...",
      "I'm glad you asked about this. It's fundamental to understanding...",
      "Good observation! This relates to what we discussed earlier about..."
    ]

    const randomResponse = responses[Math.floor(Math.random() * responses.length)]

    const responseMessage = {
      id: `msg-${Date.now()}`,
      content: randomResponse,
      timestamp: new Date().toISOString(),
      sender: "professor",
      status: "delivered",
      type: "text"
    }

    this.chats[chatIndex].messages.push(responseMessage)
    this.chats[chatIndex].updatedAt = new Date().toISOString()
    this.chats[chatIndex].unreadCount += 1
  }

  // Mark messages as read
  static markAsRead(chatId: string): void {
    const chatIndex = this.chats.findIndex(chat => chat.id === chatId)
    if (chatIndex !== -1) {
      this.chats[chatIndex].unreadCount = 0
    }
  }

  // Get departments
  static getDepartments(): string[] {
    return Array.from(new Set(this.professors.map(prof => prof.department)))
  }
}
