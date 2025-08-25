import { create } from 'zustand'
import { Professor, ChatMessage, ChatSession, User } from '@/types/chat'
import { ProfessorService } from '@/services/professorService'
import { toast } from 'sonner'

interface ChatState {
  // Current chat state
  activeChatId: string | null
  selectedProfessor: Professor | null
  chatMessages: ChatMessage[]

  // Professors data
  professors: Professor[]
  isLoadingProfessors: boolean

  // Chat sessions
  chatSessions: ChatSession[]

  // Loading states
  isLoadingMessages: boolean
  isSendingMessage: boolean
  
  // Typing indicators
  isTyping: boolean
  typingUsers: string[]
  
  // Actions
  setActiveChatId: (chatId: string | null) => void
  setSelectedProfessor: (professor: Professor | null) => void
  setChatMessages: (messages: ChatMessage[]) => void
  addChatMessage: (message: ChatMessage) => void
  updateChatMessage: (messageId: string, updates: Partial<ChatMessage>) => void
  deleteChatMessage: (messageId: string) => void

  // Professor management
  setProfessors: (professors: Professor[]) => void
  loadProfessors: (accessToken?: string) => Promise<void>
  
  // Chat session management
  setChatSessions: (sessions: ChatSession[]) => void
  addChatSession: (session: ChatSession) => void
  updateChatSession: (sessionId: string, updates: Partial<ChatSession>) => void
  deleteChatSession: (sessionId: string) => void
  
  // Message operations
  sendMessage: (content: string, type?: 'text' | 'image' | 'file') => Promise<void>
  markMessagesAsRead: (sessionId: string) => void
  
  // Loading states
  setLoadingMessages: (loading: boolean) => void
  setSendingMessage: (sending: boolean) => void
  
  // Typing indicators
  setTyping: (typing: boolean) => void
  addTypingUser: (userId: string) => void
  removeTypingUser: (userId: string) => void
  
  // Utility functions
  startChatWithProfessor: (professor: Professor) => ChatSession
  getChatSession: (sessionId: string) => ChatSession | undefined
  getUnreadCount: () => number
  clearChat: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state - empty until loaded from backend
  activeChatId: null,
  selectedProfessor: null,
  chatMessages: [],
  professors: [],
  isLoadingProfessors: false,
  chatSessions: [],
  isLoadingMessages: false,
  isSendingMessage: false,
  isTyping: false,
  typingUsers: [],

  // Actions
  setActiveChatId: (chatId: string | null) => {
    set({ activeChatId: chatId })
  },

  setSelectedProfessor: (professor: Professor | null) => {
    set({ selectedProfessor: professor })
  },

  setChatMessages: (messages: ChatMessage[]) => {
    set({ chatMessages: messages })
  },

  addChatMessage: (message: ChatMessage) => {
    set((state) => ({
      chatMessages: [...state.chatMessages, message]
    }))
    
    // Update the corresponding chat session
    const { activeChatId, chatSessions } = get()
    if (activeChatId) {
      const updatedSessions = chatSessions.map(session => 
        session.id === activeChatId 
          ? { 
              ...session, 
              messages: [...session.messages, message],
              lastMessage: message,
              updatedAt: new Date()
            }
          : session
      )
      set({ chatSessions: updatedSessions })
    }
  },

  updateChatMessage: (messageId: string, updates: Partial<ChatMessage>) => {
    set((state) => ({
      chatMessages: state.chatMessages.map(msg =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    }))
  },

  deleteChatMessage: (messageId: string) => {
    set((state) => ({
      chatMessages: state.chatMessages.filter(msg => msg.id !== messageId)
    }))
  },

  // Professor management
  setProfessors: (professors: Professor[]) => {
    set({ professors })
  },

  loadProfessors: async (accessToken?: string) => {
    try {
      set({ isLoadingProfessors: true })

      if (!accessToken) {
        throw new Error('Authentication required to load professors')
      }

      const professors = await ProfessorService.getAllProfessors(accessToken)
      set({ professors, isLoadingProfessors: false })
    } catch (error) {
      console.error('Failed to load professors:', error)
      set({ isLoadingProfessors: false })
      toast.error('Failed to load professors', {
        description: error instanceof Error ? error.message : 'Please try again later'
      })
    }
  },

  // Chat session management
  setChatSessions: (sessions: ChatSession[]) => {
    set({ chatSessions: sessions })
  },

  addChatSession: (session: ChatSession) => {
    set((state) => ({
      chatSessions: [...state.chatSessions, session]
    }))
  },

  updateChatSession: (sessionId: string, updates: Partial<ChatSession>) => {
    set((state) => ({
      chatSessions: state.chatSessions.map(session =>
        session.id === sessionId ? { ...session, ...updates } : session
      )
    }))
  },

  deleteChatSession: (sessionId: string) => {
    set((state) => ({
      chatSessions: state.chatSessions.filter(session => session.id !== sessionId)
    }))
  },

  // Message operations
  sendMessage: async (content: string, type: 'text' | 'image' | 'file' = 'text') => {
    const { selectedProfessor, addChatMessage } = get()
    if (!selectedProfessor) return

    set({ isSendingMessage: true })

    try {
      const newMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        content,
        timestamp: new Date(),
        sender: 'user',
        status: 'sending',
        type
      }

      // Add message immediately (optimistic update)
      addChatMessage(newMessage)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update message status
      get().updateChatMessage(newMessage.id, { status: 'sent' })

      // Simulate professor response (for demo)
      setTimeout(() => {
        const responses = [
          "Thank you for your question. Let me help you with that.",
          "That's a great question! Here's what I think...",
          "I understand your concern. Let's discuss this further.",
          "Good point! Have you considered this approach?",
          "I'll need to review this and get back to you."
        ]
        
        const responseMessage: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
          sender: 'professor',
          status: 'sent',
          type: 'text'
        }
        
        addChatMessage(responseMessage)
      }, 2000)

    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to Send Message', {
        description: 'Please check your connection and try again'
      })
      // Update message status to failed
      // get().updateChatMessage(newMessage.id, { status: 'failed' })
    } finally {
      set({ isSendingMessage: false })
    }
  },

  markMessagesAsRead: (sessionId: string) => {
    const { updateChatSession } = get()
    updateChatSession(sessionId, { unreadCount: 0 })
  },

  // Loading states
  setLoadingMessages: (loading: boolean) => {
    set({ isLoadingMessages: loading })
  },

  setSendingMessage: (sending: boolean) => {
    set({ isSendingMessage: sending })
  },

  // Typing indicators
  setTyping: (typing: boolean) => {
    set({ isTyping: typing })
  },

  addTypingUser: (userId: string) => {
    set((state) => ({
      typingUsers: [...state.typingUsers.filter(id => id !== userId), userId]
    }))
  },

  removeTypingUser: (userId: string) => {
    set((state) => ({
      typingUsers: state.typingUsers.filter(id => id !== userId)
    }))
  },

  // Utility functions
  startChatWithProfessor: (professor: Professor) => {
    const { chatSessions, addChatSession } = get()
    
    // Check if chat session already exists
    const existingSession = chatSessions.find(session => session.professorId === professor.id)
    if (existingSession) {
      return existingSession
    }

    // Create new chat session
    const newSession: ChatSession = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      professorId: professor.id,
      professor,
      messages: [],
      unreadCount: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    addChatSession(newSession)
    return newSession
  },

  getChatSession: (sessionId: string) => {
    const { chatSessions } = get()
    return chatSessions.find(session => session.id === sessionId)
  },

  getUnreadCount: () => {
    const { chatSessions } = get()
    return chatSessions.reduce((total, session) => total + session.unreadCount, 0)
  },

  clearChat: () => {
    set({
      activeChatId: null,
      selectedProfessor: null,
      chatMessages: [],
      isTyping: false,
      typingUsers: []
    })
  }
}))

// Helper hooks
export const useChatActions = () => {
  const {
    sendMessage,
    markMessagesAsRead,
    startChatWithProfessor,
    clearChat
  } = useChatStore()

  return {
    sendMessage,
    markMessagesAsRead,
    startChatWithProfessor,
    clearChat
  }
}

export const useChatSelectors = () => {
  const {
    activeChatId,
    selectedProfessor,
    chatMessages,
    chatSessions,
    isLoadingMessages,
    isSendingMessage,
    getUnreadCount
  } = useChatStore()

  return {
    activeChatId,
    selectedProfessor,
    chatMessages,
    chatSessions,
    isLoadingMessages,
    isSendingMessage,
    unreadCount: getUnreadCount()
  }
}
