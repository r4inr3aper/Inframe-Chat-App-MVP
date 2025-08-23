"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Plus,
  Search,
  Settings,
  Trash2,
  UserMinus,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  course: Course;
  members: Student[];
  createdAt: string;
  isPublic: boolean;
  allowSelfJoin: boolean;
}

interface GroupManagementProps {
  trigger?: React.ReactNode;
  group?: Group;
  courses?: Course[];
  allStudents?: Student[];
  onSave?: (group: Partial<Group>) => void;
}

export default function GroupManagement({
  trigger,
  group,
  courses = [],
  allStudents = [],
  onSave,
}: GroupManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(group ? "members" : "create");
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: group?.name || "",
    description: group?.description || "",
    courseId: group?.course.id || "",
    isPublic: group?.isPublic || false,
    allowSelfJoin: group?.allowSelfJoin || false,
  });
  
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set(group?.members.map(m => m.id) || [])
  );
  const [studentSearch, setStudentSearch] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    return allStudents.filter(student =>
      student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.studentId.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.department.toLowerCase().includes(studentSearch.toLowerCase())
    );
  }, [allStudents, studentSearch]);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Group name is required";
    }
    
    if (!formData.courseId) {
      newErrors.courseId = "Course selection is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSave = useCallback(() => {
    if (!validateForm()) return;
    
    const selectedStudentsList = allStudents.filter(s => selectedStudents.has(s.id));
    const course = courses.find(c => c.id === formData.courseId);
    
    if (!course) {
      toast.error("Invalid course selection");
      return;
    }
    
    const groupData: Partial<Group> = {
      ...formData,
      course,
      members: selectedStudentsList,
    };
    
    onSave?.(groupData);
    toast.success(group ? "Group updated successfully" : "Group created successfully");
    setIsOpen(false);
  }, [formData, selectedStudents, allStudents, courses, validateForm, onSave, group]);

  // Handle student selection
  const toggleStudent = useCallback((studentId: string) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  }, []);

  // Handle remove member
  const handleRemoveMember = useCallback((studentId: string) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      newSet.delete(studentId);
      return newSet;
    });
    toast.success("Member removed from group");
  }, []);

  const defaultTrigger = (
    <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
      <Plus className="w-4 h-4 mr-2" />
      {group ? "Manage Group" : "Create Group"}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden bg-card">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {group ? `Manage ${group.name}` : "Create New Group"}
          </DialogTitle>
          <DialogDescription>
            {group
              ? "Manage group members, settings, and information."
              : "Create a new group and invite students to collaborate."
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create" disabled={!!group}>
              Create Group
            </TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <div className="mt-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <TabsContent value="create" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="groupName">Group Name *</Label>
                  <Input
                    id="groupName"
                    placeholder="Enter group name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course">Course *</Label>
                  <Select
                    value={formData.courseId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, courseId: value }))}
                  >
                    <SelectTrigger className={errors.courseId ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.courseId && (
                    <p className="text-sm text-destructive">{errors.courseId}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose of this group"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Invite Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search students by name, ID, or department"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2 border rounded-md p-2">
                      {filteredStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                        >
                          <Checkbox
                            id={student.id}
                            checked={selectedStudents.has(student.id)}
                            onCheckedChange={() => toggleStudent(student.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{student.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {student.studentId} • {student.department}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedStudents.size > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium mb-2">
                          Selected Students ({selectedStudents.size})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(selectedStudents).map(studentId => {
                            const student = allStudents.find(s => s.id === studentId);
                            return student ? (
                              <Badge key={studentId} variant="secondary">
                                {student.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Group Members ({group?.members.length || selectedStudents.size})
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search members"
                    className="pl-10 w-64"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {(group?.members || allStudents.filter(s => selectedStudents.has(s.id))).map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.studentId} • {member.department}
                            </p>
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {member.name} from the group?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveMember(member.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-dashed">
                <CardContent className="p-6 text-center">
                  <Plus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground mb-4">Add more students to this group</p>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Members
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Group Information
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="editName">Group Name</Label>
                        <Input
                          id="editName"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editDescription">Description</Label>
                        <Textarea
                          id="editDescription"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => { setIsEditing(false); toast.success("Group information updated"); }} className="bg-accent text-accent-foreground hover:bg-accent/90">
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label>Group Name</Label>
                        <p className="text-sm text-muted-foreground mt-1">{group?.name || formData.name}</p>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {group?.description || formData.description || "No description provided"}
                        </p>
                      </div>
                      <div>
                        <Label>Course</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {group?.course.code} - {group?.course.name}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Group Permissions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Public Group</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow other students to discover this group
                      </p>
                    </div>
                    <Checkbox
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, isPublic: !!checked }))
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Allow Self-Join</Label>
                      <p className="text-sm text-muted-foreground">
                        Let students join without invitation
                      </p>
                    </div>
                    <Checkbox
                      checked={formData.allowSelfJoin}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, allowSelfJoin: !!checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Delete Group</Label>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete this group and all its data
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Group
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Group</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{group?.name || formData.name}"? 
                            This will permanently remove all group data, members, and associated content. 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete Permanently
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        <Separator />

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Save className="w-4 h-4 mr-2" />
            {group ? "Save Changes" : "Create Group"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}