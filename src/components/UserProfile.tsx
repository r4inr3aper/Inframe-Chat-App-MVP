"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Clock, 
  BookOpen, 
  Upload, 
  Camera, 
  Shield, 
  Bell, 
  Eye, 
  Save, 
  X,
  Check,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface UserProfileProps {
  className?: string
  mode?: 'modal' | 'page'
  onClose?: () => void
}

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  studentId: string
  department: string
  role: 'student' | 'professor' | 'staff'
  bio: string
  address: string
  officeHours?: string
  subjects?: string[]
  avatar?: string
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  courseUpdates: boolean
  systemAlerts: boolean
}

interface PrivacySettings {
  profileVisibility: 'public' | 'university' | 'private'
  showEmail: boolean
  showPhone: boolean
}

export default function UserProfile({ className = '', mode = 'page', onClose }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<ProfileData>({
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 's.johnson@university.edu',
    phone: '+1 (555) 123-4567',
    studentId: 'STU-2024-001',
    department: 'Computer Science',
    role: 'student',
    bio: 'Third-year Computer Science student passionate about machine learning and web development. Currently working on research in natural language processing.',
    address: '123 University Ave, Campus Housing',
    avatar: '/api/placeholder/128/128'
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    courseUpdates: true,
    systemAlerts: false
  })

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'university',
    showEmail: false,
    showPhone: false
  })

  const [tempProfile, setTempProfile] = useState<ProfileData>(profile)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!tempProfile.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!tempProfile.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!tempProfile.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tempProfile.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (!tempProfile.studentId.trim()) {
      newErrors.studentId = 'Student/Staff ID is required'
    }
    if (!tempProfile.department.trim()) {
      newErrors.department = 'Department is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please correct the errors before saving')
      return
    }

    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setProfile(tempProfile)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setTempProfile(profile)
    setIsEditing(false)
    setErrors({})
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileUpload(files[0])
    }
  }

  const handleFileUpload = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setTempProfile(prev => ({ ...prev, avatar: result }))
        toast.success('Avatar uploaded successfully!')
      }
      reader.readAsDataURL(file)
    } else {
      toast.error('Please select a valid image file')
    }
  }

  const ProfileSection = () => (
    <div className="space-y-8">
      {/* Avatar Section */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-heading">Profile Picture</CardTitle>
          <CardDescription>Upload a profile picture to personalize your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-border">
                {tempProfile.avatar ? (
                  <img 
                    src={tempProfile.avatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              {isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {isEditing && (
              <div
                className={`flex-1 max-w-md border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive ? 'border-accent bg-accent/5' : 'border-border'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop an image, or{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary hover:underline"
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file)
            }}
          />
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-heading">Personal Information</CardTitle>
          <CardDescription>Manage your personal details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={isEditing ? tempProfile.firstName : profile.firstName}
                onChange={(e) => setTempProfile(prev => ({ ...prev, firstName: e.target.value }))}
                disabled={!isEditing}
                className={errors.firstName ? 'border-destructive' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.firstName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={isEditing ? tempProfile.lastName : profile.lastName}
                onChange={(e) => setTempProfile(prev => ({ ...prev, lastName: e.target.value }))}
                disabled={!isEditing}
                className={errors.lastName ? 'border-destructive' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={isEditing ? tempProfile.email : profile.email}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                  className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={isEditing ? tempProfile.phone : profile.phone}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">Student/Staff ID</Label>
              <Input
                id="studentId"
                value={isEditing ? tempProfile.studentId : profile.studentId}
                onChange={(e) => setTempProfile(prev => ({ ...prev, studentId: e.target.value }))}
                disabled={!isEditing}
                className={errors.studentId ? 'border-destructive' : ''}
              />
              {errors.studentId && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.studentId}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="department"
                  value={isEditing ? tempProfile.department : profile.department}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, department: e.target.value }))}
                  disabled={!isEditing}
                  className={`pl-10 ${errors.department ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.department && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.department}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={isEditing ? tempProfile.role : profile.role}
              onValueChange={(value) => setTempProfile(prev => ({ ...prev, role: value as 'student' | 'professor' | 'staff' }))}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="professor">Professor</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="address"
                value={isEditing ? tempProfile.address : profile.address}
                onChange={(e) => setTempProfile(prev => ({ ...prev, address: e.target.value }))}
                disabled={!isEditing}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={isEditing ? tempProfile.bio : profile.bio}
              onChange={(e) => setTempProfile(prev => ({ ...prev, bio: e.target.value }))}
              disabled={!isEditing}
              rows={4}
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Role-specific sections */}
          {(isEditing ? tempProfile.role : profile.role) === 'professor' && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-heading">Professor Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="officeHours">Office Hours</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="officeHours"
                      value={isEditing ? tempProfile.officeHours || '' : profile.officeHours || ''}
                      onChange={(e) => setTempProfile(prev => ({ ...prev, officeHours: e.target.value }))}
                      disabled={!isEditing}
                      className="pl-10"
                      placeholder="e.g., Mon-Wed 2:00-4:00 PM"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subjects Taught</Label>
                  <div className="flex flex-wrap gap-2">
                    {(isEditing ? tempProfile.subjects : profile.subjects)?.map((subject, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {subject}
                      </Badge>
                    )) || <span className="text-muted-foreground text-sm">No subjects added</span>}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const NotificationsSection = () => (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-heading flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>Choose how you want to receive notifications and updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch
              checked={notifications.emailNotifications}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailNotifications: checked }))}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
            </div>
            <Switch
              checked={notifications.pushNotifications}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushNotifications: checked }))}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Course Updates</Label>
              <p className="text-sm text-muted-foreground">Get notified about course announcements and updates</p>
            </div>
            <Switch
              checked={notifications.courseUpdates}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, courseUpdates: checked }))}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>System Alerts</Label>
              <p className="text-sm text-muted-foreground">Important system maintenance and security alerts</p>
            </div>
            <Switch
              checked={notifications.systemAlerts}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, systemAlerts: checked }))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const PrivacySection = () => (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-heading flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Privacy Settings
        </CardTitle>
        <CardDescription>Control who can see your profile information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Profile Visibility</Label>
            <Select
              value={privacy.profileVisibility}
              onValueChange={(value) => setPrivacy(prev => ({ ...prev, profileVisibility: value as 'public' | 'university' | 'private' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Anyone can view</SelectItem>
                <SelectItem value="university">University Only - Members only</SelectItem>
                <SelectItem value="private">Private - Only you can view</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Show Email Address</Label>
              <p className="text-sm text-muted-foreground">Allow others to see your email address</p>
            </div>
            <Switch
              checked={privacy.showEmail}
              onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showEmail: checked }))}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Show Phone Number</Label>
              <p className="text-sm text-muted-foreground">Allow others to see your phone number</p>
            </div>
            <Switch
              checked={privacy.showPhone}
              onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showPhone: checked }))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const SecuritySection = () => (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-heading flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Account Security
        </CardTitle>
        <CardDescription>Manage your account security and authentication settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="space-y-1">
              <Label>Password</Label>
              <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
            </div>
            <Button variant="outline" size="sm">
              Change Password
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="space-y-1">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Button variant="outline" size="sm">
              Enable 2FA
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="space-y-1">
              <Label>Active Sessions</Label>
              <p className="text-sm text-muted-foreground">Manage devices and active sessions</p>
            </div>
            <Button variant="outline" size="sm">
              View Sessions
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className={`bg-card rounded-lg border border-border ${className}`}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Edit Profile
              </Button>
            )}
            {mode === 'modal' && onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="profile" className="space-y-6">
              <ProfileSection />
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
              <NotificationsSection />
            </TabsContent>
            
            <TabsContent value="privacy" className="space-y-6">
              <PrivacySection />
            </TabsContent>
            
            <TabsContent value="security" className="space-y-6">
              <SecuritySection />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}