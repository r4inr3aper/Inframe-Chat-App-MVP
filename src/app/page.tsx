"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import ChatSidebar from "@/components/ChatSidebar"
import ChatInterface from "@/components/ChatInterface"
import GroupManagement from "@/components/GroupManagement"
import UserProfile from "@/components/UserProfile"
import AdminDashboard from "@/components/AdminDashboard"
import NotificationCenter from "@/components/NotificationCenter"

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState<'chat' | 'groups' | 'profile' | 'admin'>('chat')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Mock data for chat interface
  const mockMessages = [
    {
      id: "1",
      content: "Hey! How's the project coming along?",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      sender: "contact" as const,
      status: "delivered" as const,
      type: "text" as const
    },
    {
      id: "2", 
      content: "It's going great! Just finished the wireframes. Want to take a look?",
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      sender: "user" as const,
      status: "read" as const,
      type: "text" as const
    },
    {
      id: "3",
      content: "That would be awesome! Can you share them in our group chat?",
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      sender: "contact" as const,
      status: "delivered" as const,
      type: "text" as const
    },
    {
      id: "4",
      content: "Absolutely! I'll upload them to the Design Team group right now.",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      sender: "user" as const,
      status: "read" as const,
      type: "text" as const
    }
  ]

  const handleSendMessage = (content: string) => {
    console.log("Sending message:", content)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
    setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const renderMainContent = () => {
    switch (activeSection) {
      case 'chat':
        return (
          <ChatInterface
            contactName="Sarah Chen"
            contactAvatar="/avatars/sarah.jpg"
            isOnline={true}
            messages={mockMessages}
            onSendMessage={handleSendMessage}
            onVideoCall={() => console.log("Starting video call")}
            onPhoneCall={() => console.log("Starting phone call")}
            className="h-full"
          />
        )
      case 'groups':
        return (
          <div className="p-6 h-full overflow-auto">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Group Management</h1>
                  <p className="text-muted-foreground mt-1">Create and manage study groups</p>
                </div>
                <GroupManagement />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Mock group cards would go here */}
                <div className="border border-dashed border-border rounded-lg p-8 text-center">
                  <p className="text-muted-foreground">No groups yet. Create your first group!</p>
                </div>
              </div>
            </div>
          </div>
        )
      case 'profile':
        return (
          <div className="p-6 h-full overflow-auto">
            <div className="max-w-4xl mx-auto">
              <UserProfile />
            </div>
          </div>
        )
      case 'admin':
        return <AdminDashboard />
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileMenu}
          className="bg-background border-border"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-0 top-0 h-full w-80 bg-sidebar border-r border-sidebar-border">
            <div className="p-4 border-b border-sidebar-border">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-semibold text-lg">Inframes Chat</h2>
                <div className="flex items-center gap-2">
                  <NotificationCenter />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMobileMenu}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <Button
                variant={activeSection === 'chat' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                  setActiveSection('chat')
                  setIsMobileMenuOpen(false)
                }}
              >
                Chat
              </Button>
              <Button
                variant={activeSection === 'groups' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                  setActiveSection('groups')
                  setIsMobileMenuOpen(false)
                }}
              >
                Groups
              </Button>
              <Button
                variant={activeSection === 'profile' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                  setActiveSection('profile')
                  setIsMobileMenuOpen(false)
                }}
              >
                Profile
              </Button>
              <Button
                variant={activeSection === 'admin' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                  setActiveSection('admin')
                  setIsMobileMenuOpen(false)
                }}
              >
                Admin
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        {activeSection === 'chat' && (
          <ChatSidebar
            isCollapsed={!isSidebarOpen}
            onToggle={toggleSidebar}
            className="transition-all duration-300"
          />
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar - Desktop Only */}
        <div className="hidden lg:flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-sm">I</span>
              </div>
              <h1 className="font-heading font-bold text-xl">Inframes Chat</h1>
            </div>
            
            <div className="flex gap-2 ml-8">
              <Button
                variant={activeSection === 'chat' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveSection('chat')}
              >
                Chat
              </Button>
              <Button
                variant={activeSection === 'groups' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveSection('groups')}
              >
                Groups
              </Button>
              <Button
                variant={activeSection === 'profile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveSection('profile')}
              >
                Profile
              </Button>
              <Button
                variant={activeSection === 'admin' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveSection('admin')}
              >
                Admin
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <NotificationCenter />
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