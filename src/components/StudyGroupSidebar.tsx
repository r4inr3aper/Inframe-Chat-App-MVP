"use client"

import { useState, useEffect } from "react"
import { Search, Hash, Users, Plus, MoreVertical, X, Settings, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Group, User } from "@/types/chat"
import { useGroupStore } from "@/stores"

interface StudyGroupSidebarProps {
  className?: string
  isCollapsed?: boolean
  onToggle?: () => void
  onSelectGroup?: (group: Group) => void
  onCreateGroup?: () => void
  onManageGroup?: (group: Group) => void
  activeGroupId?: string
  currentUser: User
}

export default function StudyGroupSidebar({
  className = "",
  isCollapsed = false,
  onToggle,
  onSelectGroup,
  onCreateGroup,
  onManageGroup,
  activeGroupId,
  currentUser
}: StudyGroupSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { groups, userGroups } = useGroupStore()

  useEffect(() => {
    // Groups are now loaded from Zustand store
  }, [currentUser])

  // Get user-specific groups based on role
  const getUserGroups = () => {
    if (currentUser?.role === "professor") {
      return groups.filter(group => group.professorId === currentUser.id)
    } else {
      return groups.filter(group =>
        group.members.some(member => member.id === currentUser?.id)
      )
    }
  }

  const userSpecificGroups = getUserGroups()
  const filteredGroups = userSpecificGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.professor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "now"
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  const getUnreadCount = (groupId: string) => {
    // For demo, return random unread count
    return Math.floor(Math.random() * 3)
  }

  const getLastActivity = (groupId: string) => {
    // For demo, return recent activity
    return new Date(Date.now() - Math.random() * 86400000) // Random time within last day
  }

  const StudyGroupItem = ({ group }: { group: Group }) => {
    const unreadCount = getUnreadCount(group.id)
    const lastActivity = getLastActivity(group.id)
    const isActive = activeGroupId === group.id

    return (
      <div
        className={`group relative p-3 rounded-lg transition-all duration-200 cursor-pointer hover:bg-sidebar-accent ${
          isActive ? "bg-accent/20 border border-accent/30" : ""
        }`}
        onClick={() => {
          onSelectGroup?.(group)
          // TODO: Implement mark as read functionality
          console.log('Mark group chat as read:', group.id)
        }}
      >
        <div className="flex items-start gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <Hash className="h-5 w-5 text-accent" />
            </div>
            {group.professor.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm text-foreground truncate">
                  {group.name}
                </h4>
                {group.subject && (
                  <Badge variant="secondary" className="text-xs">
                    {group.subject}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {lastActivity && (
                  <span className="text-xs text-muted-foreground">
                    {formatTime(lastActivity)}
                  </span>
                )}
                {unreadCount > 0 && (
                  <Badge className="bg-accent text-accent-foreground text-xs px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={group.professor.avatar} alt={group.professor.name} />
                  <AvatarFallback className="text-xs">
                    {group.professor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs text-muted-foreground truncate">
                  {group.professor.name} • {group.members.length} members
                </p>
              </div>
              
              {currentUser.role === 'professor' && group.professorId === (currentUser.professorId || currentUser.id) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation()
                      onManageGroup?.(group)
                    }}>
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Group
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      Delete Group
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isCollapsed) {
    return (
      <div className={`w-16 bg-sidebar border-r border-sidebar-border flex flex-col ${className}`}>
        <div className="p-3 border-b border-sidebar-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="w-10 h-10"
          >
            <Hash className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex flex-col gap-2 p-2">
          {groups.slice(0, 5).map((group) => {
            const unreadCount = getUnreadCount(group.id)
            return (
              <button
                key={group.id}
                onClick={() => onSelectGroup?.(group)}
                className={`relative w-10 h-10 rounded-lg transition-colors ${
                  activeGroupId === group.id ? "bg-accent/20" : "hover:bg-sidebar-accent"
                }`}
              >
                <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center mx-auto">
                  <Hash className="h-4 w-4 text-accent" />
                </div>
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs px-1 py-0 min-w-[16px] h-[16px] flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>
        
        {currentUser.role === 'professor' && (
          <div className="mt-auto p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onCreateGroup}
              className="w-10 h-10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`w-80 bg-sidebar border-r border-sidebar-border flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-lg text-sidebar-foreground">Study Groups</h2>
          <div className="flex items-center gap-2">
            {currentUser.role === 'professor' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCreateGroup}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="lg:hidden h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search study groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-sidebar-accent/50 border-sidebar-border"
          />
        </div>
      </div>

      {/* Study Groups List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredGroups.length > 0 ? (
          <div className="p-4 space-y-2">
            {filteredGroups.map(group => (
              <StudyGroupItem key={group.id} group={group} />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="p-4 text-center">
            <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">No study groups yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {currentUser.role === "professor" 
                ? "Create your first study group to start collaborating with students"
                : "You haven't been added to any study groups yet. Contact your professors to join groups."
              }
            </p>
            {currentUser.role === 'professor' && (
              <Button onClick={onCreateGroup} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            )}
          </div>
        ) : (
          <div className="p-4 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">No groups found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{groups.length} group{groups.length !== 1 ? 's' : ''}</span>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            <span>Chat enabled</span>
          </div>
        </div>
      </div>
    </div>
  )
}
