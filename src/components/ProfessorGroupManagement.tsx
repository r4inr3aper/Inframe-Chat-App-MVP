"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Users,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  Settings,
  X,
  Check,
  AlertCircle,
  BookOpen,
  Filter,
  MessageCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Group, User } from "@/types/chat"
import { GroupService } from "@/services/groupService"
import BulkStudentSelector from "@/components/BulkStudentSelector"

interface ProfessorGroupManagementProps {
  professorId: string
  className?: string
  onOpenGroupChat?: (group: Group) => void
}

export default function ProfessorGroupManagement({
  professorId,
  className = "",
  onOpenGroupChat
}: ProfessorGroupManagementProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const [allStudents, setAllStudents] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [showBulkSelector, setShowBulkSelector] = useState(false)
  const [bulkSelectorGroupId, setBulkSelectorGroupId] = useState<string | null>(null)
  const [bulkSelectorMode, setBulkSelectorMode] = useState<'create' | 'edit' | 'add'>('add')

  // Form state for creating/editing groups
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subject: "",
    maxMembers: 20,
    profControlled: false,
  })
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [createStep, setCreateStep] = useState<1 | 2>(1)

  useEffect(() => {
    loadGroups()
    loadStudents()
  }, [professorId])

  const loadGroups = () => {
    const professorGroups = GroupService.getGroupsByProfessor(professorId)
    setGroups(professorGroups)
  }

  const loadStudents = () => {
    const students = GroupService.getAllStudents()
    setAllStudents(students)
  }

  const departments = GroupService.getDepartments()
  const years = GroupService.getYears()

  const filteredStudents = allStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.studentId?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDepartment = selectedDepartment === "all" || student.department === selectedDepartment
    const matchesYear = selectedYear === "all" || student.year === parseInt(selectedYear)

    return matchesSearch && matchesDepartment && matchesYear
  })

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.subject?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const handleCreateGroup = () => {
    try {
      const newGroup = GroupService.createGroup({
        name: formData.name,
        description: formData.description,
        professorId,
        subject: formData.subject,
        maxMembers: formData.maxMembers,
        memberIds: Array.from(selectedStudents),
        profControlled: formData.profControlled,
      })

      setGroups(prev => [...prev, newGroup])
      toast.success("Group created successfully!")
      resetForm()
      setIsCreateDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create group")
    }
  }

  const handleUpdateGroup = () => {
    if (!editingGroup) return

    try {
      // First update the group info
      const updatedGroup = GroupService.updateGroup(editingGroup.id, {
        name: formData.name,
        description: formData.description,
        subject: formData.subject,
        maxMembers: formData.maxMembers,
        profControlled: formData.profControlled,
      })

      // Then add any newly selected students
      let finalGroup = updatedGroup
      if (selectedStudents.size > 0) {
        finalGroup = GroupService.bulkAddStudentsToGroup(editingGroup.id, Array.from(selectedStudents))
      }




      setGroups(prev => prev.map(g => g.id === finalGroup.id ? finalGroup : g))

      const addedCount = selectedStudents.size
      if (addedCount > 0) {
        toast.success(`Group updated successfully! Added ${addedCount} new student${addedCount !== 1 ? 's' : ''}.`)
      } else {
        toast.success("Group updated successfully!")
      }

      closeEditView()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update group")
    }
  }

  const handleDeleteGroup = (groupId: string) => {
    try {
      GroupService.deleteGroup(groupId)
      setGroups(prev => prev.filter(g => g.id !== groupId))
      toast.success("Group deleted successfully!")
    } catch (error) {
      toast.error("Failed to delete group")
    }
  }

  const handleRemoveMember = (groupId: string, studentId: string) => {
    try {
      const updatedGroup = GroupService.removeMemberFromGroup(groupId, studentId)
      setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g))
      toast.success("Member removed successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove member")
    }
  }

  const handleToggleMessagePermissions = (groupId: string) => {
    try {
      const group = groups.find(g => g.id === groupId)
      if (!group) return

      const updatedGroup = GroupService.updateGroup(groupId, {
        profControlled: !group.profControlled
      })

      setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g))

      const message = updatedGroup.profControlled
        ? "Only professor can now send messages"
        : "Students can now send messages"
      toast.success(message)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update permissions")
    }
  }

  const handleBulkAddStudents = (groupId: string) => {
    setBulkSelectorGroupId(groupId)
    setBulkSelectorMode('add')
    setShowBulkSelector(true)
  }

  const handleOpenBulkSelectorForCreate = () => {
    setBulkSelectorMode('create')
    setShowBulkSelector(true)
  }

  const handleOpenBulkSelectorForEdit = () => {
    setBulkSelectorMode('edit')
    setShowBulkSelector(true)
  }

  const handleBulkStudentsSelected = (studentIds: string[]) => {
    if (bulkSelectorMode === 'create') {
      // For create mode, just update the selected students
      setSelectedStudents(new Set(studentIds))
      setShowBulkSelector(false)
      return
    }

    if (bulkSelectorMode === 'edit') {
      // For edit mode, update the selected students for the form
      setSelectedStudents(new Set(studentIds))
      setShowBulkSelector(false)
      return
    }

    // For add mode, directly add to existing group
    if (!bulkSelectorGroupId) return

    try {
      const updatedGroup = GroupService.bulkAddStudentsToGroup(bulkSelectorGroupId, studentIds)
      setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g))
      toast.success(`Successfully added ${studentIds.length} student${studentIds.length !== 1 ? 's' : ''} to the group!`)
      setShowBulkSelector(false)
      setBulkSelectorGroupId(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add students")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      subject: "",
      maxMembers: 20,
      profControlled: false
    })
    setSelectedStudents(new Set())
  }

  const openEditDialog = (group: Group) => {
    setEditingGroup(group)
    setFormData({
      name: group.name,
      description: group.description,
      subject: group.subject || "",
      maxMembers: group.maxMembers || 20,
      profControlled: group.profControlled || false
    })
    // Reset selected students for adding new members
    setSelectedStudents(new Set())
    setSelectedDepartment("all")
    setSelectedYear("all")
    setSearchQuery("")
  }

  const closeEditView = () => {
    setEditingGroup(null)
    resetForm()
  }

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(studentId)) {
        newSet.delete(studentId)
      } else {
        newSet.add(studentId)
      }
      return newSet
    })
  }

  const selectAllFilteredStudents = () => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev)
      filteredStudents.forEach(student => newSet.add(student.id))
      return newSet
    })
  }

  const deselectAllFilteredStudents = () => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev)
      filteredStudents.forEach(student => newSet.delete(student.id))
      return newSet
    })
  }

  return (
    <>
      <div className={`h-full flex flex-col ${className}`}>
        {editingGroup ? (
        // Edit Group View - Full Right Side
        <div className="h-full flex flex-col">
          {/* Edit Header */}
          <div className="p-6 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeEditView}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Back to Groups
                </Button>
                <div className="h-6 w-px bg-border" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Edit Group</h1>
                  <p className="text-muted-foreground">{editingGroup.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={closeEditView}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateGroup}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>

          {/* Edit Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="info" className="h-full flex flex-col">
              <div className="px-6 pt-6 pb-4">
                <TabsList className="grid w-full max-w-lg grid-cols-2 h-12">
                  <TabsTrigger value="info" className="text-sm font-medium">Group Information</TabsTrigger>
                  <TabsTrigger value="members" className="text-sm font-medium">Members ({editingGroup.members.length})</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="info" className="flex-1 overflow-y-auto custom-scrollbar px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Group Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Group Name</Label>
                        <Input
                          id="edit-name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-subject">Subject Code</Label>
                        <Input
                          id="edit-subject"
                          value={formData.subject}
                          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="w-48 space-y-2">
                      <Label htmlFor="edit-maxMembers">Maximum Members</Label>
                      <Input
                        id="edit-maxMembers"
                        type="number"
                        value={formData.maxMembers}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) || 20 }))}
                        min="1"
                        max="100"
                      />
                    </div>
                  </CardContent>

	                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
	                      <div className="space-y-2">
	                        <Label>Message Permissions</Label>
	                        <div className="flex gap-3">
	                          <Button
	                            type="button"
	                            variant={!formData.profControlled ? 'default' : 'outline'}
	                            onClick={() => setFormData(prev => ({ ...prev, profControlled: false }))}
	                            size="sm"
	                          >
	                            Students can send messages
	                          </Button>
	                          <Button
	                            type="button"
	                            variant={formData.profControlled ? 'default' : 'outline'}
	                            onClick={() => setFormData(prev => ({ ...prev, profControlled: true }))}
	                            size="sm"
	                          >
	                            Professor only
	                          </Button>
	                        </div>
	                      </div>
	                      <div className="space-y-2">
	                        <Label>Professor controls who can send</Label>
	                        <div>
	                          <Checkbox
	                            checked={formData.profControlled}
	                            onCheckedChange={(v) => setFormData(prev => ({ ...prev, profControlled: Boolean(v) }))}
	                          />
	                          <span className="ml-2 text-sm text-muted-foreground">Enable to explicitly allow specific students</span>
	                        </div>
	                      </div>
	                    </div>

                </Card>
              </TabsContent>

              <TabsContent value="members" className="flex-1 overflow-hidden px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* Current Members */}
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Current Members ({editingGroup.members.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg">
                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                          {editingGroup.members && editingGroup.members.length > 0 ? (
                            <div className="divide-y">
                              {editingGroup.members.map(member => (
                                <div key={member.id} className="flex items-center justify-between p-3 hover:bg-muted/50">
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage src={member.avatar} alt={member.name} />
                                      <AvatarFallback>
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium text-sm">{member.name}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xs text-muted-foreground">{member.studentId}</p>
                                        <Badge variant="outline" className="text-xs">{member.department}</Badge>
                                        {member.batch && (
                                          <Badge variant="secondary" className="text-xs">{member.batch}</Badge>
                                        )}
                                      </div>

	                                  <div className="flex items-center gap-2">

	                                    <Button
	                                      variant="ghost"
	                                      size="sm"
	                                      onClick={() => handleRemoveMember(editingGroup.id, member.id)}
	                                    >
	                                      <UserMinus className="h-4 w-4" />
	                                    </Button>
	                                  </div>

                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-8 text-center">
                              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <h3 className="font-medium text-foreground mb-2">No members yet</h3>
                              <p className="text-sm text-muted-foreground">Add students to this group</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Add New Members */}
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <UserPlus className="h-5 w-5" />
                          Add New Members
                        </CardTitle>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleOpenBulkSelectorForEdit}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Advanced Selection
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            placeholder="Search students by name, email, or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>

                        <div className="flex gap-3">
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

                          <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="All Years" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Years</SelectItem>
                              {years.map(year => (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <p className="text-sm text-muted-foreground">
                          {filteredStudents.filter(student => !editingGroup?.members.some(m => m.id === student.id)).length} available student{filteredStudents.filter(student => !editingGroup?.members.some(m => m.id === student.id)).length !== 1 ? 's' : ''}
                        </p>
                        {selectedStudents.size > 0 && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {selectedStudents.size} to add
                          </Badge>
                        )}

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                // no-op here; actual add occurs on Save Changes
                              }}
                              disabled={selectedStudents.size === 0}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Add Selected
                            </Button>
                            {selectedStudents.size > 0 && (
                              <Button size="sm" variant="ghost" onClick={deselectAllFilteredStudents}>
                                Clear
                              </Button>
                            )}
                          </div>

                      </div>

                      <div className="border rounded-lg">
                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                          {(() => {
                            const availableStudents = filteredStudents.filter(student => !editingGroup?.members.some(m => m.id === student.id))
                            return availableStudents.length > 0 ? (
                              <div className="divide-y">
                                {availableStudents.map(student => (
                                  <div
                                    key={student.id}
                                    className="flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => toggleStudentSelection(student.id)}
                                  >
                                    <Checkbox
                                      checked={selectedStudents.has(student.id)}
                                      onCheckedChange={() => toggleStudentSelection(student.id)}
                                    />
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage src={student.avatar} alt={student.name} />
                                      <AvatarFallback>
                                        {student.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm text-foreground truncate">{student.name}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xs text-muted-foreground">{student.studentId}</p>
                                        <Badge variant="outline" className="text-xs">{student.department}</Badge>
                                        {student.batch && (
                                          <Badge variant="secondary" className="text-xs">{student.batch}</Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-8 text-center">
                                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="font-medium text-foreground mb-2">No available students</h3>
                                <p className="text-sm text-muted-foreground">All students matching your criteria are already in this group</p>
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        // Groups List View
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Group Management</h1>
                <p className="text-muted-foreground">Create and manage your study groups</p>
              </div>

              <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Groups Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {filteredGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map(group => (
                  <Card key={group.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-foreground mb-1">
                            {group.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {group.description}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onOpenGroupChat?.(group)}>
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Open Chat
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(group)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Group
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkAddStudents(group.id)}>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Bulk Add Students
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleMessagePermissions(group.id)}>
                              <Settings className="h-4 w-4 mr-2" />
                              {group.profControlled ? 'Allow Student Messages' : 'Restrict to Professor Only'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteGroup(group.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Group
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Members</span>
                          <span className="font-medium">{group.members.length}/{group.maxMembers || '∞'}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Subject</span>
                          <Badge variant="outline">{group.subject || 'General'}</Badge>
                        </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Messages</span>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={group.profControlled ? "secondary" : "outline"}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => handleToggleMessagePermissions(group.id)}
                                title="Click to toggle message permissions"
                              >
                                {group.profControlled ? 'Professor only' : 'Students can send'}
                              </Badge>
                            </div>
                          </div>


                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Created</span>
                          <span className="text-muted-foreground">
                            {new Date(group.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 pt-2">
                          {group.members.slice(0, 3).map(member => (
                            <Avatar key={member.id} className="h-6 w-6">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback className="text-xs">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {group.members.length > 3 && (
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                              +{group.members.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No groups found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? 'Try adjusting your search criteria' : 'Create your first study group to get started'}
                </p>
                <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Create Group Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { setIsCreateDialogOpen(open); if (!open) setCreateStep(1) }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl">Create New Study Group</DialogTitle>
            <DialogDescription className="text-base">
              {createStep === 1 ? 'Enter group details' : 'Add members to your group'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <div className="px-1">
              {createStep === 1 && (
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">Group Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Group Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., AI Study Group"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject Code</Label>
                          <Input
                            id="subject"
                            value={formData.subject}
                            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                            placeholder="e.g., CS401"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe the purpose and goals of this study group..."
                          rows={3}
                        />

	                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
	                        <div className="space-y-2">
	                          <Label>Message Permissions</Label>
	                          <div className="flex gap-3">
	                            <Button
	                              type="button"
	                              variant={!formData.profControlled ? 'default' : 'outline'}
	                              onClick={() => setFormData(prev => ({ ...prev, profControlled: false }))}
	                              size="sm"
	                            >
	                              Students can send messages
	                            </Button>
	                            <Button
	                              type="button"
	                              variant={formData.profControlled ? 'default' : 'outline'}
	                              onClick={() => setFormData(prev => ({ ...prev, profControlled: true }))}
	                              size="sm"
	                            >
	                              Professor only
	                            </Button>
	                          </div>
	                        </div>
	                        <div className="space-y-2">
	                          <Label>Professor controls who can send</Label>
	                          <div>
	                            <Checkbox
	                              checked={formData.profControlled}
	                              onCheckedChange={(v) => setFormData(prev => ({ ...prev, profControlled: Boolean(v) }))}
	                            />
	                            <span className="ml-2 text-sm text-muted-foreground">Enable to explicitly allow specific students</span>
	                          </div>
	                        </div>
	                      </div>

                      </div>

                      <div className="w-48 space-y-2">
                        <Label htmlFor="maxMembers">Maximum Members</Label>
                        <Input
                          id="maxMembers"
                          type="number"
                          value={formData.maxMembers}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) || 20 }))}
                          min="1"
                          max="100"
                        />
                      </div>
                    </CardContent>
                  </Card>
              )}

              {createStep === 2 && (
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Add Students</CardTitle>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleOpenBulkSelectorForCreate}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Bulk Selection
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">

                      <div className="space-y-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            placeholder="Search students by name, email, or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>

                        <div className="flex gap-3">
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

                          <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="All Years" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Years</SelectItem>
                              {years.map(year => (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <p className="text-sm text-muted-foreground">
                          {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
                        </p>
                        {selectedStudents.size > 0 && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {selectedStudents.size} selected
                          </Badge>
                        )}
                      </div>

                      <div className="border rounded-lg">
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                          {filteredStudents.length > 0 ? (
                            <div className="divide-y">
                              {filteredStudents.map(student => (
                                <div
                                  key={student.id}
                                  className="flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                                  onClick={() => toggleStudentSelection(student.id)}
                                >
                                  <Checkbox
                                    checked={selectedStudents.has(student.id)}
                                    onCheckedChange={() => toggleStudentSelection(student.id)}
                                  />
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={student.avatar} alt={student.name} />
                                    <AvatarFallback>
                                      {student.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-foreground truncate">{student.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <p className="text-xs text-muted-foreground">{student.studentId}</p>
                                      <Badge variant="outline" className="text-xs">{student.department}</Badge>
                                      {student.batch && (
                                        <Badge variant="secondary" className="text-xs">{student.batch}</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-8 text-center">
                              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <h3 className="font-medium text-foreground mb-2">No students found</h3>
                              <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              )}
                </div>
              </div>

              <DialogFooter className="pt-4 border-t">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                {createStep === 1 ? (
                  <Button onClick={() => setCreateStep(2)} disabled={!formData.name.trim()}>
                    Next
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setCreateStep(1)}>
                      Back
                    </Button>
                    <Button onClick={handleCreateGroup} disabled={!formData.name.trim()}>
                      Create Group
                    </Button>
                  </div>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>


      {/* Bulk Student Selector Dialog */}
      <Dialog open={showBulkSelector} onOpenChange={setShowBulkSelector}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <BulkStudentSelector
            onStudentsSelected={handleBulkStudentsSelected}
            onCancel={() => setShowBulkSelector(false)}
            excludeStudentIds={
              bulkSelectorMode === 'add' && bulkSelectorGroupId
                ? groups.find(g => g.id === bulkSelectorGroupId)?.members.map(m => m.id) || []
                : bulkSelectorMode === 'edit' && editingGroup
                ? editingGroup.members.map(m => m.id)
                : []
            }
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
