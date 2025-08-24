"use client"

import { useState, useEffect } from "react"
import {
  Users,
  Search,
  Filter,
  MessageCircle,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  MoreVertical,
  UserPlus,
  Settings,
  BookOpen,
  GraduationCap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Group, User } from "@/types/chat"
import { GroupService } from "@/services/groupService"
import { UserService } from "@/services/userService"

interface GroupViewProps {
  className?: string
  onOpenGroupChat?: (group: Group) => void
}

export default function GroupView({ className = "", onOpenGroupChat }: GroupViewProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [currentUser] = useState<User>(UserService.getCurrentUser())
  const [activeTab, setActiveTab] = useState("my-groups")

  useEffect(() => {
    loadGroups()
  }, [currentUser])

  const loadGroups = () => {
    if (currentUser.role === "professor") {
      // Professor sees their own groups
      const professorGroups = GroupService.getGroupsByProfessor(currentUser.professorId || currentUser.id)
      setGroups(professorGroups)
    } else {
      // Student sees only groups they are members of
      const studentGroups = GroupService.getGroupsForStudent(currentUser.studentId || currentUser.id)
      setGroups(studentGroups)
    }
  }

  const departments = GroupService.getDepartments()

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.professor.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDepartment = selectedDepartment === "all" || group.professor.department === selectedDepartment
    
    return matchesSearch && matchesDepartment
  })

  const myGroups = filteredGroups // All groups are now "my groups" for both roles

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const GroupCard = ({ group, onOpenChat }: {
    group: Group,
    onOpenChat?: (group: Group) => void
  }) => (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{group.name}</CardTitle>
              {group.subject && (
                <Badge variant="secondary" className="text-xs">
                  {group.subject}
                </Badge>
              )}
            </div>
            <CardDescription className="line-clamp-2">
              {group.description}
            </CardDescription>
          </div>
          
          {currentUser.role === "professor" && group.professorId === (currentUser.professorId || currentUser.id) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Group
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Members
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Delete Group
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Professor Info */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Avatar className="h-10 w-10">
            <AvatarImage src={group.professor.avatar} alt={group.professor.name} />
            <AvatarFallback>
              {group.professor.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-sm">{group.professor.name}</p>
            <p className="text-xs text-muted-foreground">{group.professor.department}</p>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${group.professor.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-xs text-muted-foreground">
              {group.professor.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Group Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{group.members.length} member{group.members.length !== 1 ? 's' : ''}</span>
            {group.maxMembers && (
              <span className="text-muted-foreground">/ {group.maxMembers}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(group.createdAt)}</span>
          </div>
        </div>

        {/* Members Preview */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Members</p>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {group.members.slice(0, 4).map(member => (
                <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-xs">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
              {group.members.length > 4 && (
                <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs font-medium">+{group.members.length - 4}</span>
                </div>
              )}
            </div>
            {group.members.length === 0 && (
              <span className="text-sm text-muted-foreground">No members yet</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onOpenChat?.(group)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Group Chat
          </Button>

          {currentUser.role === "professor" && group.professorId === (currentUser.professorId || currentUser.id) && (
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Manage
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Study Groups</h1>
            <p className="text-muted-foreground">
              {currentUser.role === "professor" 
                ? "Manage your study groups and view member activity"
                : "Join study groups and collaborate with peers"
              }
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />
              {currentUser.role === "professor" ? "Professor" : "Student"}
            </Badge>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search groups, professors, or subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {myGroups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {currentUser.role === "professor" ? "No groups created yet" : "No groups assigned yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {currentUser.role === "professor"
                ? "Create your first study group to get started"
                : "You haven't been added to any study groups yet. Contact your professors to join groups."
              }
            </p>
            {currentUser.role === "professor" && (
              <Button>
                Create Group
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGroups.map(group => (
              <GroupCard key={group.id} group={group} onOpenChat={onOpenGroupChat} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
