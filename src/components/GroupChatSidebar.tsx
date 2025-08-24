"use client"

import { useState, useEffect } from "react"
import { Search, Hash, Users, Plus, MoreVertical, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Group, User } from "@/types/chat"
import { GroupService } from "@/services/groupService"
import { GroupChatService } from "@/services/groupChatService"

interface GroupChatSidebarProps {
  className?: string
  isCollapsed?: boolean
  onToggle?: () => void
  onSelectGroup?: (group: Group) => void
  activeGroupId?: string
  currentUser: User
}

export default function GroupChatSidebar({ 
  className = "", 
  isCollapsed = false, 
  onToggle, 
  onSelectGroup,
  activeGroupId,
  currentUser
}: GroupChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [groups, setGroups] = useState<Group[]>([])
  const [groupChats, setGroupChats] = useState<any[]>([])

  useEffect(() => {
    loadGroups()
  }, [currentUser])

  const loadGroups = () => {
    let userGroups: Group[] = []
    
    if (currentUser.role === "professor") {
      userGroups = GroupService.getGroupsByProfessor(currentUser.professorId || currentUser.id)
    } else {
      userGroups = GroupService.getGroupsForStudent(currentUser.studentId || currentUser.id)
    }
    
    setGroups(userGroups)
    
    // Load group chats
    const groupIds = userGroups.map(g => g.id)
    const chats = GroupChatService.getRecentGroupChats(currentUser.id, groupIds)
    
    // Merge group info with chat info
    const enrichedChats = chats.map(chat => {
      const group = userGroups.find(g => g.id === chat.groupId)
      return {
        ...chat,
        group,
        groupName: group?.name || `Group ${chat.groupId}`
      }
    })
    
    setGroupChats(enrichedChats)
  }

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.professor.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  const GroupChatItem = ({ chat }: { chat: any }) => (
    <button
      onClick={() => {
        if (chat.group) {
          onSelectGroup?.(chat.group)
          GroupChatService.markGroupChatAsRead(chat.groupId, currentUser.id)
        }
      }}
      className={`w-full p-3 rounded-lg text-left transition-all duration-200 group hover:bg-sidebar-accent ${
        activeGroupId === chat.groupId ? "bg-accent/20 border border-accent/30" : "hover:bg-sidebar-accent"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
            <Hash className="h-5 w-5 text-accent" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-sm text-foreground truncate">
              {chat.groupName}
            </h4>
            <span className="text-xs text-muted-foreground">
              {formatTime(chat.lastActivity)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground truncate">
              {chat.lastMessage ? 
                `${chat.lastMessage.senderName}: ${chat.lastMessage.content}` : 
                "No messages yet"
              }
            </p>
            {chat.unreadCount > 0 && (
              <Badge className="bg-accent text-accent-foreground text-xs px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                {chat.unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  )

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
          {groups.slice(0, 5).map((group) => (
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
              {/* Unread indicator */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`w-80 bg-sidebar border-r border-sidebar-border flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-lg text-sidebar-foreground">Group Chats</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-sidebar-accent/50 border-sidebar-border"
          />
        </div>
      </div>

      {/* Group Chats List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {groupChats.length > 0 && (
          <div className="p-4">
            <h4 className="font-medium text-sidebar-foreground mb-3 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Recent Chats
            </h4>
            <div className="space-y-1">
              {groupChats.map(chat => (
                <GroupChatItem key={chat.id} chat={chat} />
              ))}
            </div>
          </div>
        )}

        {/* All Groups */}
        {filteredGroups.length > 0 && (
          <div className="p-4">
            <h4 className="font-medium text-sidebar-foreground mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              All Groups
            </h4>
            <div className="space-y-1">
              {filteredGroups.map(group => (
                <button
                  key={group.id}
                  onClick={() => onSelectGroup?.(group)}
                  className={`w-full p-3 rounded-lg text-left transition-all duration-200 group hover:bg-sidebar-accent ${
                    activeGroupId === group.id ? "bg-accent/20 border border-accent/30" : "hover:bg-sidebar-accent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                      <Hash className="h-5 w-5 text-accent" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm text-foreground truncate">
                          {group.name}
                        </h4>
                        {group.subject && (
                          <Badge variant="secondary" className="text-xs">
                            {group.subject}
                          </Badge>
                        )}
                      </div>
                      
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
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {groups.length === 0 && (
          <div className="p-4 text-center">
            <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">No groups yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {currentUser.role === "professor" 
                ? "Create your first study group to start chatting"
                : "You haven't been added to any groups yet"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
