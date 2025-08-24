"use client"

import { useState, useEffect } from "react"
import { Users, UserPlus, Calendar, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User } from "@/types/chat"
import { GroupService } from "@/services/groupService"

interface BulkStudentSelectorProps {
  onStudentsSelected: (studentIds: string[]) => void
  onCancel: () => void
  excludeStudentIds?: string[]
  className?: string
}

export default function BulkStudentSelector({
  onStudentsSelected,
  onCancel,
  excludeStudentIds = [],
  className = ""
}: BulkStudentSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [selectedBatch, setSelectedBatch] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [allStudents, setAllStudents] = useState<User[]>([])
  const [filteredStudents, setFilteredStudents] = useState<User[]>([])
  const [activeTab, setActiveTab] = useState("bulk")

  const departments = GroupService.getDepartments()
  const batches = GroupService.getBatches()
  const years = GroupService.getYears()

  useEffect(() => {
    const students = GroupService.getAllStudents().filter(s => !excludeStudentIds.includes(s.id))
    setAllStudents(students)
    setFilteredStudents(students)
  }, [excludeStudentIds])

  useEffect(() => {
    let filtered = allStudents

    // Apply filters
    if (searchQuery.trim()) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedDepartment !== "all") {
      filtered = filtered.filter(student => student.department === selectedDepartment)
    }

    if (selectedBatch !== "all") {
      filtered = filtered.filter(student => student.batch === selectedBatch)
    }

    if (selectedYear !== "all") {
      filtered = filtered.filter(student => student.year === parseInt(selectedYear))
    }

    setFilteredStudents(filtered)
  }, [searchQuery, selectedDepartment, selectedBatch, selectedYear, allStudents])

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

  const selectAllFiltered = () => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev)
      filteredStudents.forEach(student => newSet.add(student.id))
      return newSet
    })
  }

  const deselectAllFiltered = () => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev)
      filteredStudents.forEach(student => newSet.delete(student.id))
      return newSet
    })
  }

  const selectByBatch = (batch: string) => {
    const batchStudents = getStudentsByBatchFiltered(batch)

    setSelectedStudents(prev => {
      const newSet = new Set(prev)
      batchStudents.forEach(student => newSet.add(student.id))
      return newSet
    })
  }

  const selectByDepartmentAndBatch = (department: string, batch: string) => {
    const students = getStudentsByDepartmentAndBatchFiltered(department, batch)

    setSelectedStudents(prev => {
      const newSet = new Set(prev)
      students.forEach(student => newSet.add(student.id))
      return newSet
    })
  }

  const handleConfirm = () => {
    onStudentsSelected(Array.from(selectedStudents))
  }

  // Helper utilities to compute filtered datasets for bulk sections
  const getStudentsByBatchFiltered = (batch: string) => {
    let students = GroupService.getStudentsByBatch(batch).filter(s => !excludeStudentIds.includes(s.id))
    if (selectedDepartment !== "all") students = students.filter(s => s.department === selectedDepartment)
    if (selectedYear !== "all") students = students.filter(s => s.year === parseInt(selectedYear))
    return students
  }
  const getStudentsByDepartmentAndBatchFiltered = (department: string, batch: string) => {
    let students = GroupService.getStudentsByDepartmentAndBatch(department, batch).filter(s => !excludeStudentIds.includes(s.id))
    if (selectedYear !== "all") students = students.filter(s => s.year === parseInt(selectedYear))
    return students
  }
  const batchesToShow = selectedBatch === "all" ? batches : [selectedBatch]
  const departmentsToShow = selectedDepartment === "all" ? departments : [selectedDepartment]


  return (
    <div className={`flex flex-col h-full max-h-[85vh] ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Bulk Selection</h2>
          <div className="flex items-center gap-3">
            {selectedStudents.size > 0 && (
              <Badge variant="default" className="flex items-center gap-2 px-3 py-1">
                <Users className="h-4 w-4" />
                {selectedStudents.size} selected
              </Badge>
            )}
          </div>
        </div>


      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">

          {/* Bulk Selection Tab */}
          <TabsContent value="bulk" className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {/* Bulk selection controls */}
            <div className="px-6 pb-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Department</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="h-11">
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
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Batch</Label>
                  <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="All Batches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Batches</SelectItem>
                      {batches.map(batch => (
                        <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="h-11">
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
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" /> Select by Batch
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(selectedBatch === "all" ? batches : [selectedBatch]).map(batch => (
                      <div key={batch} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{batch}</p>
                          <p className="text-sm text-muted-foreground">
                            {getStudentsByBatchFiltered(batch).length} students
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => selectByBatch(batch)}>
                          <UserPlus className="h-4 w-4 mr-2" /> Add All
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" /> Select by Department & Batch
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(selectedDepartment === "all" ? departments : [selectedDepartment]).map(department => (
                      <div key={department} className="space-y-2">
                        <h4 className="font-medium text-foreground">{department}</h4>
                        <div className="grid gap-2 ml-4">
                          {(selectedBatch === "all" ? batches : [selectedBatch]).map(batch => {
                            const students = getStudentsByDepartmentAndBatchFiltered(department, batch)
                            if (students.length === 0) return null
                            return (
                              <div key={`${department}-${batch}`} className="flex items-center justify-between p-2 border rounded">
                                <div>
                                  <p className="text-sm font-medium">{batch}</p>
                                  <p className="text-xs text-muted-foreground">{students.length} students</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => selectByDepartmentAndBatch(department, batch)}>
                                  Add All
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>


        </Tabs>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-foreground">
              {selectedStudents.size} student{selectedStudents.size !== 1 ? 's' : ''} selected
            </p>
            {selectedStudents.size > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Ready to add
              </Badge>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} size="lg">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedStudents.size === 0}
              size="lg"
              className="min-w-[140px]"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add {selectedStudents.size > 0 ? selectedStudents.size : ''} Student{selectedStudents.size !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
