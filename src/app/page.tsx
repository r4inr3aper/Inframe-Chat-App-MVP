"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Menu, LogOut, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import ChatSidebar from "@/components/ChatSidebar"
import ChatInterface from "@/components/ChatInterface"
import ProfessorSearch from "@/components/ProfessorSearch"
import ProfessorGroupManagement from "@/components/ProfessorGroupManagement"
import StudyGroupSidebar from "@/components/StudyGroupSidebar"
import StudyGroupInterface from "@/components/StudyGroupInterface"
import { Professor, ChatMessage, User, Group, GroupChatMessage } from "@/types/chat"
import { useUI, useChatStore, useGroupStore, useNotifications } from "@/stores"
import { useAuth } from "@/hooks/useAuth"

export default function HomePage() {
  const router = useRouter()

  // Auth and stores
  const { isAuthenticated, user: currentUser, logout, isLoading: authLoading } = useAuth()



  // Debug auth state (removed to reduce console noise)
  // console.log('Auth state:', { isAuthenticated, currentUser: currentUser?.name })
  const {
    isSidebarOpen,
    currentView,
    isPageLoading,
    toggleSidebar,
    setCurrentView,
    setPageLoading
  } = useUI()
  const {
    activeChatId,
    selectedProfessor,
    chatMessages,
    setActiveChatId,
    setSelectedProfessor,
    setChatMessages,
    startChatWithProfessor,
    sendMessage
  } = useChatStore()
  const {
    activeGroup,
    groupChatMessages,
    setActiveGroup,
    sendGroupMessage
  } = useGroupStore()
  const { showSuccess, showError } = useNotifications()

  // Check authentication status on component mount
  useEffect(() => {
    // Don't redirect if auth is still loading
    if (authLoading) {
      setPageLoading(true)
      return
    }

    // If not authenticated and not loading, redirect to auth
    if (!isAuthenticated || !currentUser) {
      router.push('/auth')
      setPageLoading(false)
      return
    }

    // Set default view based on user role
    if (currentUser.role === 'student') {
      setCurrentView('search') // Students start with professor search
    } else if (currentUser.role === 'professor') {
      setCurrentView('manage-groups') // Professors start with group management
    }

    setPageLoading(false)
  }, [isAuthenticated, currentUser, authLoading, router, setCurrentView, setPageLoading])


  const handleSelectProfessor = (professor: Professor) => {
    // Start a new chat or get existing chat using Zustand store
    const newChat = startChatWithProfessor(professor)
    setActiveChatId(newChat.id)
    setSelectedProfessor(professor)
    setChatMessages(newChat.messages)
    setCurrentView('chat')
  }

  const handleSelectChat = (chatId: string) => {
    const chatSession = useChatStore.getState().getChatSession(chatId)
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

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content)
      showSuccess('Message sent!')
    } catch (error) {
      showError('Failed to send message', 'Please try again')
    }
  }

  const handleSelectGroup = (group: Group) => {
    setActiveGroup(group)
    setCurrentView('study-groups')
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

  const handleSendGroupMessage = async (content: string) => {
    try {
      await sendGroupMessage(content)
    } catch (error) {
      showError('Failed to send message', 'Please try again')
    }
  }





  const handleLogout = async () => {
    await logout()
    // NextAuth will handle the redirect automatically
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

    if (currentView === 'study-groups' && activeGroup && currentUser) {
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

    if (currentView === 'manage-groups' && currentUser?.role === 'professor') {
      return (
        <ProfessorGroupManagement
          professorId={currentUser?.professorId || currentUser?.id || ''}
          onOpenGroupChat={handleSelectGroup}
          className="h-full"
        />
      )
    }

    // Removed test dashboard - no longer needed

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

  // Show loading state while checking authentication
  if (isPageLoading || authLoading || !isAuthenticated || !currentUser) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
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
              <h1 className="font-heading font-bold text-xl">Inframe Chat</h1>
            </div>

            {/* Navigation Tabs - Role-based */}
            <div className="flex gap-2">
              {currentUser?.role === 'student' && (
                <>
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
                </>
              )}

              {currentUser?.role === 'professor' && (
                <>
                  <Button
                    variant={currentView === 'study-groups' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentView('study-groups')}
                  >
                    Study Groups
                  </Button>
                  <Button
                    variant={currentView === 'manage-groups' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentView('manage-groups')}
                  >
                    Manage Groups
                  </Button>
                </>
              )}

              {currentUser?.role === 'admin' && (
                <>
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
                  <Button
                    variant={currentView === 'manage-groups' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentView('manage-groups')}
                  >
                    Manage Groups
                  </Button>
                </>
              )}

              {selectedProfessor && currentUser?.role === 'student' && (
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



            {/* User Info & Actions */}
            <div className="flex items-center gap-2 relative z-40">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserIcon className="h-4 w-4" />
                <span>{currentUser.name} ({currentUser.role})</span>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleLogout()
                }}
                className="inline-flex items-center justify-center gap-2 rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-destructive h-9 px-3 text-muted-foreground relative z-50 cursor-pointer border border-border"
                title="Logout"
                type="button"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
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