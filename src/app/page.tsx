"use client"

import { useState, useEffect } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import ChatSidebar from "@/components/ChatSidebar"
import ChatInterface from "@/components/ChatInterface"
import ProfessorSearch from "@/components/ProfessorSearch"
import ProfessorGroupManagement from "@/components/ProfessorGroupManagement"
import StudyGroupSidebar from "@/components/StudyGroupSidebar"
import StudyGroupInterface from "@/components/StudyGroupInterface"
import { Professor, ChatMessage, User, Group, GroupChatMessage } from "@/types/chat"
import { ChatService } from "@/services/chatService"
import { UserService } from "@/services/userService"
import { GroupChatService } from "@/services/groupChatService"

// Removed duplicate ProfessorGroupManagement definition.
// The correct ProfessorGroupManagement component should be imported from "@/components/ProfessorGroupManagement".

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [currentView, setCurrentView] = useState<'search' | 'chat' | 'study-groups' | 'manage-groups'>('study-groups')
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentUser, setCurrentUser] = useState<User>(UserService.getCurrentUser())
  const [activeGroup, setActiveGroup] = useState<Group | null>(null)
  const [groupChatMessages, setGroupChatMessages] = useState<GroupChatMessage[]>([])


  const handleSelectProfessor = (professor: Professor) => {
    // Start a new chat or get existing chat
    const newChat = ChatService.startChatWithProfessor(professor.id)
    setActiveChatId(newChat.id)
    setSelectedProfessor(professor)
    setChatMessages(newChat.messages)
    setCurrentView('chat')
  }

  const handleSelectChat = (chatId: string) => {
    const chatSession = ChatService.getChatSession(chatId)
    if (chatSession) {
      setActiveChatId(chatId)
      setSelectedProfessor(chatSession.professor)
      setChatMessages(chatSession.messages)
      setCurrentView('chat')
    }
  }

  const handleNewChat = () => {
    setCurrentView('search')
    setActiveChatId(null)
    setSelectedProfessor(null)
    setChatMessages([])
  }

  const handleSendMessage = (content: string) => {
    if (!activeChatId) return

    const newMessage = ChatService.sendMessage(activeChatId, content)
    setChatMessages((prev: ChatMessage[]) => [...prev, newMessage])
  }

  const handleSelectGroup = (group: Group) => {
    setActiveGroup(group)
    setCurrentView('study-groups')

    // Load group chat messages
    const groupChat = GroupChatService.getGroupChatByGroupId(group.id)
    if (groupChat) {
      setGroupChatMessages(groupChat.messages)
    } else {
      setGroupChatMessages([])
    }
  }

  const handleCreateGroup = () => {
    setCurrentView('manage-groups')
  }

  const handleManageGroup = (group?: Group) => {
    if (group) {
      setActiveGroup(group)
    }
    setCurrentView('manage-groups')
  }

  const handleSendGroupMessage = (content: string) => {
    if (!activeGroup) return

    const newMessage = GroupChatService.sendMessageToGroup(activeGroup.id, content, currentUser)
    setGroupChatMessages((prev: GroupChatMessage[]) => [...prev, newMessage])

    // Simulate responses in group chat
    GroupChatService.simulateIncomingMessage(activeGroup.id)
  }



  const handleSwitchRole = () => {
    const newRole = currentUser.role === "student" ? "professor" : "student"
    UserService.switchToRole(newRole)
    setCurrentUser(UserService.getCurrentUser())

    // Reset view when switching roles
    if (newRole === "professor") {
      setCurrentView('study-groups')
    } else {
      setCurrentView('study-groups')
    }
    setActiveChatId(null)
    setSelectedProfessor(null)
    setChatMessages([])
    setActiveGroup(null)
    setGroupChatMessages([])
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const renderMainContent = () => {
    if (currentView === 'search') {
      return (
        <ProfessorSearch
          onSelectProfessor={handleSelectProfessor}
          className="h-full"
        />
      )
    }

    if (currentView === 'chat' && selectedProfessor) {
      return (
        <ChatInterface
          contactName={selectedProfessor.name}
          contactAvatar={selectedProfessor.avatar}
          isOnline={selectedProfessor.isOnline}
          messages={chatMessages.map(msg => ({
            ...msg,
            sender: msg.sender === "professor" ? "contact" : "user"
          }))}
          onSendMessage={handleSendMessage}
          onVideoCall={() => console.log("Starting video call")}
          onPhoneCall={() => console.log("Starting phone call")}
          className="h-full"
        />
      )
    }

    if (currentView === 'study-groups' && activeGroup) {
      return (
        <StudyGroupInterface
          group={activeGroup}
          messages={groupChatMessages}
          currentUser={currentUser}
          onSendMessage={handleSendGroupMessage}
          onManageGroup={() => handleManageGroup(activeGroup)}
          className="h-full"
        />
      )
    }

    if (currentView === 'manage-groups' && currentUser.role === 'professor') {
      return (
        <ProfessorGroupManagement
          professorId={currentUser.professorId || currentUser.id}
          onOpenGroupChat={handleSelectGroup}
          className="h-full"
        />
      )
    }

    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">
          {currentView === 'study-groups'
            ? 'Select a study group from the sidebar to start chatting'
            : currentView === 'manage-groups'
            ? 'Manage your study groups and add students'
            : 'Search for professors to start a conversation'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="bg-background border-border"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block`}>
        {currentView === 'study-groups' ? (
          <StudyGroupSidebar
            isCollapsed={!isSidebarOpen}
            onToggle={toggleSidebar}
            onSelectGroup={handleSelectGroup}
            onCreateGroup={handleCreateGroup}
            onManageGroup={handleManageGroup}
            activeGroupId={activeGroup?.id}
            currentUser={currentUser}
            className="transition-all duration-300"
          />
        ) : (
          <ChatSidebar
            isCollapsed={!isSidebarOpen}
            onToggle={toggleSidebar}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            activeChatId={activeChatId || undefined}
            className="transition-all duration-300"
          />
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-sm">I</span>
              </div>
              <h1 className="font-heading font-bold text-xl">Inframes Chat</h1>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2">
              <Button
                variant={currentView === 'search' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('search')}
              >
                Find Professors
              </Button>
              <Button
                variant={currentView === 'study-groups' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('study-groups')}
              >
                Study Groups
              </Button>
              {currentUser.role === 'professor' && (
                <Button
                  variant={currentView === 'manage-groups' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('manage-groups')}
                >
                  Manage Groups
                </Button>
              )}
              {selectedProfessor && (
                <Button
                  variant={currentView === 'chat' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('chat')}
                >
                  Chat
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Role Switcher for Demo */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwitchRole}
              className="text-xs"
            >
              Switch to {currentUser.role === 'student' ? 'Professor' : 'Student'}
            </Button>

            {/* User Info */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {currentUser.name} ({currentUser.role})
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {renderMainContent()}
        </div>
      </div>
    </div>
  )
}