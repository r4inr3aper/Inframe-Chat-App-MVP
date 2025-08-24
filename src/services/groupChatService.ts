import { GroupChat, GroupChatMessage, User } from "@/types/chat"
import groupChatsData from "@/data/group-chats.json"

export class GroupChatService {
  private static groupChats: any[] = groupChatsData as any[]

  // Get group chat by group ID
  static getGroupChatByGroupId(groupId: string): GroupChat | undefined {
    const chatData = this.groupChats.find(chat => chat.groupId === groupId)
    return chatData ? this.mapToGroupChat(chatData) : undefined
  }

  // Get all group chats for groups where user is a member
  static getGroupChatsForUser(userId: string, userGroups: string[]): GroupChat[] {
    return this.groupChats
      .filter(chat => userGroups.includes(chat.groupId))
      .map(chat => this.mapToGroupChat(chat))
      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
  }

  // Send message to group chat
  static sendMessageToGroup(groupId: string, content: string, sender: User): GroupChatMessage {
    const chatIndex = this.groupChats.findIndex(chat => chat.groupId === groupId)
    
    if (chatIndex === -1) {
      // Create new group chat if it doesn't exist
      const newChat = {
        id: `gc-${Date.now()}`,
        groupId,
        messages: [],
        lastActivity: new Date().toISOString(),
        isActive: true
      }
      this.groupChats.push(newChat)
    }

    const newMessage: GroupChatMessage = {
      id: `gcmsg-${Date.now()}`,
      content,
      timestamp: new Date(),
      senderId: sender.id,
      senderName: sender.name,
      senderRole: sender.role,
      senderAvatar: sender.avatar,
      type: "text"
    }

    const targetChatIndex = chatIndex !== -1 ? chatIndex : this.groupChats.length - 1
    this.groupChats[targetChatIndex].messages.push({
      ...newMessage,
      timestamp: newMessage.timestamp.toISOString()
    })
    this.groupChats[targetChatIndex].lastActivity = new Date().toISOString()

    return newMessage
  }

  // Get recent group chats for sidebar
  static getRecentGroupChats(userId: string, userGroups: string[]): Array<{
    id: string
    groupId: string
    groupName: string
    lastMessage?: GroupChatMessage
    unreadCount: number
    lastActivity: Date
  }> {
    return this.groupChats
      .filter(chat => userGroups.includes(chat.groupId))
      .map(chat => {
        const groupChat = this.mapToGroupChat(chat)
        const lastMessage = groupChat.messages[groupChat.messages.length - 1]
        
        // Simple unread count simulation (messages after user's last seen)
        const unreadCount = Math.floor(Math.random() * 3) // Simulate unread messages
        
        return {
          id: groupChat.id,
          groupId: groupChat.groupId,
          groupName: `Group ${groupChat.groupId.split('-')[1]}`, // Will be replaced with actual group name
          lastMessage,
          unreadCount,
          lastActivity: groupChat.lastActivity
        }
      })
      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
  }

  // Mark group chat as read
  static markGroupChatAsRead(groupId: string, userId: string): void {
    // In a real app, this would update the user's last read timestamp
    console.log(`Marked group chat ${groupId} as read for user ${userId}`)
  }

  // Helper method to map raw data to GroupChat interface
  private static mapToGroupChat(chatData: any): GroupChat {
    return {
      id: chatData.id,
      groupId: chatData.groupId,
      messages: chatData.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })),
      lastActivity: new Date(chatData.lastActivity),
      isActive: chatData.isActive
    }
  }

  // Simulate receiving a message (for demo purposes)
  static simulateIncomingMessage(groupId: string): void {
    const responses = [
      "That's a great point!",
      "I agree with that approach.",
      "Could you elaborate on that?",
      "Thanks for sharing that resource.",
      "Let's discuss this further in our next meeting.",
      "I have a different perspective on this...",
      "This reminds me of what we learned last week."
    ]

    const sampleUsers = [
      { id: "student-001", name: "Alice Johnson", role: "student" as const, avatar: "/avatars/alice.jpg", email: "alice@university.edu", department: "Computer Science" },
      { id: "student-002", name: "Bob Smith", role: "student" as const, avatar: "/avatars/bob.jpg", email: "bob@university.edu", department: "Computer Science" },
      { id: "student-003", name: "Carol Davis", role: "student" as const, avatar: "/avatars/carol.jpg", email: "carol@university.edu", department: "Computer Science" }
    ]

    const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)]
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]

    setTimeout(() => {
      this.sendMessageToGroup(groupId, randomResponse, randomUser)
    }, 2000 + Math.random() * 3000)
  }
}
