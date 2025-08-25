import { create } from 'zustand'
import { Group, GroupChatMessage, User } from '@/types/chat'
import { toast } from 'sonner'

interface GroupState {
  // Current group state
  activeGroup: Group | null
  groupChatMessages: GroupChatMessage[]
  
  // All groups
  groups: Group[]
  userGroups: Group[] // Groups the current user is a member of
  
  // Loading states
  isLoadingGroups: boolean
  isLoadingMessages: boolean
  isSendingMessage: boolean
  
  // Group management (for professors)
  isCreatingGroup: boolean
  isUpdatingGroup: boolean
  
  // Actions
  setActiveGroup: (group: Group | null) => void
  setGroupChatMessages: (messages: GroupChatMessage[]) => void
  addGroupChatMessage: (message: GroupChatMessage) => void
  updateGroupChatMessage: (messageId: string, updates: Partial<GroupChatMessage>) => void
  deleteGroupChatMessage: (messageId: string) => void
  
  // Group management
  setGroups: (groups: Group[]) => void
  setUserGroups: (groups: Group[]) => void
  addGroup: (group: Group) => void
  createGroup: (groupData: Partial<Group>) => Promise<Group>
  updateGroup: (groupId: string, updates: Partial<Group>) => void
  deleteGroup: (groupId: string) => void
  
  // Group membership
  joinGroup: (groupId: string, user: User) => Promise<void>
  leaveGroup: (groupId: string, userId: string) => Promise<void>
  addMemberToGroup: (groupId: string, user: User) => Promise<void>
  removeMemberFromGroup: (groupId: string, userId: string) => Promise<void>
  bulkAddMembers: (groupId: string, users: User[]) => Promise<void>
  
  // Message operations
  sendGroupMessage: (content: string, type?: 'text' | 'image' | 'file') => Promise<void>
  
  // Loading states
  setLoadingGroups: (loading: boolean) => void
  setLoadingMessages: (loading: boolean) => void
  setSendingMessage: (sending: boolean) => void
  setCreatingGroup: (creating: boolean) => void
  setUpdatingGroup: (updating: boolean) => void
  
  // Utility functions
  getGroupById: (groupId: string) => Group | undefined
  getUserGroupsCount: () => number
  canUserSendMessage: (group: Group, user: User) => boolean
  clearGroupChat: () => void
}

export const useGroupStore = create<GroupState>((set, get) => ({
  // Initial state - empty until loaded from backend
  activeGroup: null,
  groupChatMessages: [],
  groups: [],
  userGroups: [],
  isLoadingGroups: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  isCreatingGroup: false,
  isUpdatingGroup: false,

  // Actions
  setActiveGroup: (group: Group | null) => {
    set({ activeGroup: group })
    if (group) {
      // Load messages for the group (simulate API call)
      set({ isLoadingMessages: true })
      setTimeout(() => {
        // Mock messages for demo
        const mockMessages: GroupChatMessage[] = [
          {
            id: `msg_${Date.now()}_1`,
            content: "Welcome to the study group! Feel free to ask questions.",
            timestamp: new Date(Date.now() - 86400000), // 1 day ago
            senderId: group.professor.id,
            senderName: group.professor.name,
            senderRole: 'professor',
            type: 'text'
          }
        ]
        set({ groupChatMessages: mockMessages, isLoadingMessages: false })
      }, 1000)
    } else {
      set({ groupChatMessages: [] })
    }
  },

  setGroupChatMessages: (messages: GroupChatMessage[]) => {
    set({ groupChatMessages: messages })
  },

  addGroupChatMessage: (message: GroupChatMessage) => {
    set((state) => ({
      groupChatMessages: [...state.groupChatMessages, message]
    }))
  },

  updateGroupChatMessage: (messageId: string, updates: Partial<GroupChatMessage>) => {
    set((state) => ({
      groupChatMessages: state.groupChatMessages.map(msg =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    }))
  },

  deleteGroupChatMessage: (messageId: string) => {
    set((state) => ({
      groupChatMessages: state.groupChatMessages.filter(msg => msg.id !== messageId)
    }))
  },

  // Group management
  setGroups: (groups: Group[]) => {
    set({ groups })
  },

  setUserGroups: (groups: Group[]) => {
    set({ userGroups: groups })
  },

  addGroup: (group: Group) => {
    set((state) => ({
      groups: [...state.groups, group]
    }))
  },

  createGroup: async (groupData: Partial<Group>) => {
    try {
      // TODO: Replace with actual backend API call
      const newGroup: Group = {
        id: `group_${Date.now()}`,
        name: groupData.name || 'New Group',
        description: groupData.description || '',
        professorId: groupData.professorId || '',
        professor: groupData.professor || {
          id: 'temp_prof',
          name: 'Temporary Professor',
          email: 'temp@example.com',
          department: 'Unknown',
          specialization: [],
          bio: '',
          officeHours: '',
          rating: 0,
          responseTime: '',
          subjects: [],
          isOnline: false
        },
        members: groupData.members || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        maxMembers: groupData.maxMembers || 25,
        subject: groupData.subject,
        profControlled: groupData.profControlled || false
      }

      get().addGroup(newGroup)
      toast.success('Group Created', {
        description: `${newGroup.name} has been created successfully`
      })
      return newGroup
    } catch (error) {
      console.error('Failed to create group:', error)
      toast.error('Failed to Create Group', {
        description: 'Please try again later'
      })
      throw error
    }
  },

  updateGroup: (groupId: string, updates: Partial<Group>) => {
    set((state) => ({
      groups: state.groups.map(group =>
        group.id === groupId ? { ...group, ...updates } : group
      ),
      userGroups: state.userGroups.map(group =>
        group.id === groupId ? { ...group, ...updates } : group
      ),
      activeGroup: state.activeGroup?.id === groupId 
        ? { ...state.activeGroup, ...updates } 
        : state.activeGroup
    }))
  },

  deleteGroup: (groupId: string) => {
    set((state) => ({
      groups: state.groups.filter(group => group.id !== groupId),
      userGroups: state.userGroups.filter(group => group.id !== groupId),
      activeGroup: state.activeGroup?.id === groupId ? null : state.activeGroup
    }))
  },

  // Group membership
  joinGroup: async (groupId: string, user: User) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const { updateGroup } = get()
      const group = get().getGroupById(groupId)

      if (group && !group.members.find(member => member.id === user.id)) {
        updateGroup(groupId, {
          members: [...group.members, user]
        })

        toast.success('Joined Group', {
          description: `You have joined ${group.name}`
        })
      }
    } catch (error) {
      console.error('Failed to join group:', error)
      toast.error('Failed to Join Group', {
        description: 'Please try again later'
      })
      throw error
    }
  },

  leaveGroup: async (groupId: string, userId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const { updateGroup } = get()
      const group = get().getGroupById(groupId)

      if (group) {
        updateGroup(groupId, {
          members: group.members.filter(member => member.id !== userId)
        })

        toast.success('Left Group', {
          description: `You have left ${group.name}`
        })
      }
    } catch (error) {
      console.error('Failed to leave group:', error)
      toast.error('Failed to Leave Group', {
        description: 'Please try again later'
      })
      throw error
    }
  },

  addMemberToGroup: async (groupId: string, user: User) => {
    return get().joinGroup(groupId, user)
  },

  removeMemberFromGroup: async (groupId: string, userId: string) => {
    return get().leaveGroup(groupId, userId)
  },

  bulkAddMembers: async (groupId: string, users: User[]) => {
    try {
      set({ isUpdatingGroup: true })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const { updateGroup } = get()
      const group = get().getGroupById(groupId)
      
      if (group) {
        const existingMemberIds = group.members.map(member => member.id)
        const newMembers = users.filter(user => !existingMemberIds.includes(user.id))
        
        updateGroup(groupId, {
          members: [...group.members, ...newMembers]
        })
      }
    } catch (error) {
      console.error('Failed to bulk add members:', error)
      throw error
    } finally {
      set({ isUpdatingGroup: false })
    }
  },

  // Message operations
  sendGroupMessage: async (content: string, type: 'text' | 'image' | 'file' = 'text') => {
    const { activeGroup, addGroupChatMessage } = get()
    if (!activeGroup) return

    set({ isSendingMessage: true })

    try {
      // Get current user from auth store (you'll need to import this)
      // For now, we'll use a mock user
      const mockUser: User = {
        id: 'current_user',
        name: 'Current User',
        email: 'user@example.com',
        department: 'Computer Science',
        role: 'student'
      }

      const newMessage: GroupChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content,
        timestamp: new Date(),
        senderId: mockUser.id,
        senderName: mockUser.name,
        senderRole: mockUser.role,
        type
      }

      // Add message immediately (optimistic update)
      addGroupChatMessage(newMessage)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      console.error('Failed to send group message:', error)
      throw error
    } finally {
      set({ isSendingMessage: false })
    }
  },

  // Loading states
  setLoadingGroups: (loading: boolean) => {
    set({ isLoadingGroups: loading })
  },

  setLoadingMessages: (loading: boolean) => {
    set({ isLoadingMessages: loading })
  },

  setSendingMessage: (sending: boolean) => {
    set({ isSendingMessage: sending })
  },

  setCreatingGroup: (creating: boolean) => {
    set({ isCreatingGroup: creating })
  },

  setUpdatingGroup: (updating: boolean) => {
    set({ isUpdatingGroup: updating })
  },

  // Utility functions
  getGroupById: (groupId: string) => {
    const { groups } = get()
    return groups.find(group => group.id === groupId)
  },

  getUserGroupsCount: () => {
    const { userGroups } = get()
    return userGroups.length
  },

  canUserSendMessage: (group: Group, user: User) => {
    // If group is professor-controlled, only professor can send messages
    if (group.profControlled) {
      return user.role === 'professor' && user.id === group.professorId
    }
    // Otherwise, all members can send messages
    return group.members.some(member => member.id === user.id) || user.id === group.professorId
  },

  clearGroupChat: () => {
    set({
      activeGroup: null,
      groupChatMessages: []
    })
  }
}))

// Helper hooks
export const useGroupActions = () => {
  const {
    joinGroup,
    leaveGroup,
    sendGroupMessage,
    bulkAddMembers,
    clearGroupChat
  } = useGroupStore()

  return {
    joinGroup,
    leaveGroup,
    sendGroupMessage,
    bulkAddMembers,
    clearGroupChat
  }
}

export const useGroupSelectors = () => {
  const {
    activeGroup,
    groupChatMessages,
    groups,
    userGroups,
    isLoadingGroups,
    isLoadingMessages,
    isSendingMessage,
    getUserGroupsCount
  } = useGroupStore()

  return {
    activeGroup,
    groupChatMessages,
    groups,
    userGroups,
    isLoadingGroups,
    isLoadingMessages,
    isSendingMessage,
    userGroupsCount: getUserGroupsCount()
  }
}
