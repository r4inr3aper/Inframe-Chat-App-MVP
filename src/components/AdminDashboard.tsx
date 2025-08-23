"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  UserCheck, 
  UserX, 
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Shield,
  Settings,
  AlertTriangle,
  BarChart3,
  Activity
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface AdminDashboardProps {
  className?: string
}

export default function AdminDashboard({ className }: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  // Mock data
  const analyticsData = [
    { title: "Total Chats", value: "12,483", change: "+8.2%", icon: MessageSquare },
    { title: "Active Users", value: "3,241", change: "+12.1%", icon: Users },
    { title: "Daily Engagement", value: "87.3%", change: "+2.4%", icon: TrendingUp },
    { title: "Flagged Content", value: "23", change: "-15.2%", icon: AlertTriangle },
  ]

  const userData = [
    { id: "1", name: "Alice Johnson", email: "alice@university.edu", role: "Student", status: "Active", lastSeen: "2 hours ago", chats: 42 },
    { id: "2", name: "Dr. Smith", email: "smith@university.edu", role: "Professor", status: "Active", lastSeen: "1 hour ago", chats: 156 },
    { id: "3", name: "Bob Wilson", email: "bob@university.edu", role: "Student", status: "Blocked", lastSeen: "1 day ago", chats: 8 },
    { id: "4", name: "Prof. Davis", email: "davis@university.edu", role: "Professor", status: "Active", lastSeen: "30 min ago", chats: 203 },
    { id: "5", name: "Carol Brown", email: "carol@university.edu", role: "Student", status: "Inactive", lastSeen: "3 days ago", chats: 15 },
  ]

  const flaggedContent = [
    { id: "1", conversation: "Inappropriate language in study group", user: "Alice Johnson", severity: "Medium", date: "2 hours ago" },
    { id: "2", conversation: "Sharing exam answers", user: "Bob Wilson", severity: "High", date: "5 hours ago" },
    { id: "3", conversation: "Spam messages", user: "Carol Brown", severity: "Low", date: "1 day ago" },
  ]

  const filteredUsers = userData.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role.toLowerCase() === filterRole.toLowerCase()
    return matchesSearch && matchesRole
  })

  const handleUserAction = (action: string, userId: string) => {
    console.log(`${action} user ${userId}`)
  }

  const handleBulkAction = (action: string) => {
    console.log(`${action} users: ${selectedUsers.join(', ')}`)
    setSelectedUsers([])
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage users, content, and system settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsData.map((item, index) => (
          <Card key={index} className="bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{item.value}</p>
                  <p className="text-sm mt-1">
                    <span className={`${item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change}
                    </span>
                    <span className="text-muted-foreground ml-1">from last month</span>
                  </p>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg">
                  <item.icon className="w-6 h-6 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-secondary">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="moderation" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Content Moderation
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            System Settings
          </TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Bulk Import
                  </Button>
                  {selectedUsers.length > 0 && (
                    <Select onValueChange={handleBulkAction}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Bulk Actions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activate">Activate Selected</SelectItem>
                        <SelectItem value="deactivate">Deactivate Selected</SelectItem>
                        <SelectItem value="delete">Delete Selected</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filter */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="professor">Professors</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(filteredUsers.map(u => u.id))
                            } else {
                              setSelectedUsers([])
                            }
                          }}
                          className="rounded border-border"
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Seen</TableHead>
                      <TableHead>Chats</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user.id])
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                              }
                            }}
                            className="rounded border-border"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'Professor' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              user.status === 'Active' ? 'default' : 
                              user.status === 'Blocked' ? 'destructive' : 'secondary'
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.lastSeen}</TableCell>
                        <TableCell>{user.chats}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleUserAction('edit', user.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleUserAction(user.status === 'Blocked' ? 'unblock' : 'block', user.id)}
                            >
                              {user.status === 'Blocked' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete User</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete {user.name}? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline">Cancel</Button>
                                  <Button 
                                    variant="destructive"
                                    onClick={() => handleUserAction('delete', user.id)}
                                  >
                                    Delete
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  User Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Chart visualization would go here</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Chat Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Chart visualization would go here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Moderation Tab */}
        <TabsContent value="moderation" className="space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Flagged Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flaggedContent.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            item.severity === 'High' ? 'destructive' : 
                            item.severity === 'Medium' ? 'default' : 'secondary'
                          }
                        >
                          {item.severity}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{item.date}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                        <Button variant="destructive" size="sm">
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{item.conversation}</p>
                      <p className="text-sm text-muted-foreground">User: {item.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Chat Policies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="allow-file-sharing">Allow File Sharing</Label>
                  <Switch id="allow-file-sharing" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="profanity-filter">Profanity Filter</Label>
                  <Switch id="profanity-filter" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-moderation">Auto Moderation</Label>
                  <Switch id="auto-moderation" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message-limit">Daily Message Limit</Label>
                  <Input id="message-limit" type="number" defaultValue="100" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle>System Permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="student-create-groups">Students Can Create Groups</Label>
                  <Switch id="student-create-groups" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="professor-moderate">Professors Can Moderate</Label>
                  <Switch id="professor-moderate" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="guest-access">Guest Access</Label>
                  <Switch id="guest-access" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                  <Input id="session-timeout" type="number" defaultValue="24" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle>System Announcements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="announcement">New Announcement</Label>
                <Textarea 
                  id="announcement" 
                  placeholder="Enter system-wide announcement..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Publish Announcement
                </Button>
                <Button variant="outline">Save as Draft</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}