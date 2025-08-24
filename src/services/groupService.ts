import { Group, User, Professor } from "@/types/chat"
import groupsData from "@/data/groups.json"
import demoGroups from "@/data/demo-groups.json"
import demoOpenAdmin from "@/data/demo-group-open-admin.json"
import studentsData from "@/data/students.json"
import professorsData from "@/data/professors.json"

export class GroupService {
  private static groups: any[] = [...(groupsData as any[]), ...(demoGroups as any[]), ...(demoOpenAdmin as any[])]
  private static students: User[] = studentsData as User[]
  private static professors: Professor[] = professorsData as Professor[]

  // Get all groups for a professor
  static getGroupsByProfessor(professorId: string): Group[] {
    return this.groups
      .filter(group => group.professorId === professorId)
      .map(group => this.mapToGroup(group))
  }

  // Get all groups
  static getAllGroups(): Group[] {
    return this.groups.map(group => this.mapToGroup(group))
  }

  // Get groups where student is a member (for students)
  static getGroupsForStudent(identifier: string): Group[] {
    return this.groups
      .filter(group => group.members.some((member: any) => member.id === identifier || member.studentId === identifier))
      .map(group => this.mapToGroup(group))
  }

  // Get group IDs where user is a member
  static getGroupIdsForUser(userId: string): string[] {
    return this.groups
      .filter(group => group.members.some((member: any) => member.id === userId))
      .map(group => group.id)
  }

  // Get all students
  static getAllStudents(): User[] {
    return this.students
  }

  // Get students by department
  static getStudentsByDepartment(department: string): User[] {
    return this.students.filter(student => student.department === department)
  }

  // Create a new group
  static createGroup(groupData: {
    name: string
    description: string
    professorId: string
    subject?: string
    maxMembers?: number
    memberIds: string[]
    profControlled?: boolean
  }): Group {
    const professor = this.professors.find(p => p.id === groupData.professorId)
    if (!professor) {
      throw new Error("Professor not found")
    }

    const members = this.students.filter(student => 
      groupData.memberIds.includes(student.id)
    )

    const newGroup = {
      id: `group-${Date.now()}`,
      name: groupData.name,
      description: groupData.description,
      professorId: groupData.professorId,
      members,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      maxMembers: groupData.maxMembers || 20,
      subject: groupData.subject,
      profControlled: groupData.profControlled || false
    }

    this.groups.push(newGroup)
    return this.mapToGroup(newGroup)
  }

  // Update group
  static updateGroup(groupId: string, updates: {
    name?: string
    description?: string
    subject?: string
    maxMembers?: number
    memberIds?: string[]
    isActive?: boolean
    profControlled?: boolean
  }): Group {
    const groupIndex = this.groups.findIndex(g => g.id === groupId)
    if (groupIndex === -1) {
      throw new Error("Group not found")
    }

    const group = this.groups[groupIndex]
    
    if (updates.memberIds) {
      const members = this.students.filter(student => 
        updates.memberIds!.includes(student.id)
      )
      group.members = members
    }

    // Update other fields
    Object.keys(updates).forEach(key => {
      if (key !== 'memberIds' && updates[key as keyof typeof updates] !== undefined) {
        group[key] = updates[key as keyof typeof updates]
      }
    })

    group.updatedAt = new Date().toISOString()
    this.groups[groupIndex] = group

    return this.mapToGroup(group)
  }

  // Delete group
  static deleteGroup(groupId: string): boolean {
    const groupIndex = this.groups.findIndex(g => g.id === groupId)
    if (groupIndex === -1) {
      return false
    }

    this.groups.splice(groupIndex, 1)
    return true
  }

  // Add member to group
  static addMemberToGroup(groupId: string, studentId: string): Group {
    const groupIndex = this.groups.findIndex(g => g.id === groupId)
    if (groupIndex === -1) {
      throw new Error("Group not found")
    }

    const student = this.students.find(s => s.id === studentId)
    if (!student) {
      throw new Error("Student not found")
    }

    const group = this.groups[groupIndex]
    
    // Check if student is already in group
    if (group.members.some((m: any) => m.id === studentId)) {
      throw new Error("Student is already in the group")
    }

    // Check max members limit
    if (group.maxMembers && group.members.length >= group.maxMembers) {
      throw new Error("Group has reached maximum capacity")
    }

    group.members.push(student)
    group.updatedAt = new Date().toISOString()
    this.groups[groupIndex] = group

    return this.mapToGroup(group)
  }

  // Remove member from group
  static removeMemberFromGroup(groupId: string, studentId: string): Group {
    const groupIndex = this.groups.findIndex(g => g.id === groupId)
    if (groupIndex === -1) {
      throw new Error("Group not found")
    }

    const group = this.groups[groupIndex]
    const memberIndex = group.members.findIndex((m: any) => m.id === studentId)
    
    if (memberIndex === -1) {
      throw new Error("Student is not in the group")
    }

    group.members.splice(memberIndex, 1)
    group.updatedAt = new Date().toISOString()
    this.groups[groupIndex] = group

    return this.mapToGroup(group)
  }

  // Get group by ID
  static getGroupById(groupId: string): Group | undefined {
    const group = this.groups.find(g => g.id === groupId)
    return group ? this.mapToGroup(group) : undefined
  }

  // Search students
  static searchStudents(query: string, department?: string): User[] {
    let filtered = this.students

    if (query.trim()) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(query.toLowerCase()) ||
        student.email.toLowerCase().includes(query.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(query.toLowerCase())
      )
    }

    if (department && department !== "all") {
      filtered = filtered.filter(student => student.department === department)
    }

    return filtered
  }

  // Get departments
  static getDepartments(): string[] {
    return Array.from(new Set(this.students.map(student => student.department)))
  }

  // Get all batches
  static getBatches(): string[] {
    return Array.from(new Set(this.students.map(student => student.batch).filter((batch): batch is string => Boolean(batch))))
  }

  // Get all years
  static getYears(): number[] {
    return Array.from(new Set(this.students.map(student => student.year).filter((year): year is number => Boolean(year)))).sort((a, b) => b - a)
  }

  // Get students by batch
  static getStudentsByBatch(batch: string): User[] {
    return this.students.filter(student => student.batch === batch)
  }

  // Get students by year
  static getStudentsByYear(year: number): User[] {
    return this.students.filter(student => student.year === year)
  }

  // Get students by department and batch
  static getStudentsByDepartmentAndBatch(department: string, batch: string): User[] {
    return this.students.filter(student =>
      student.department === department && student.batch === batch
    )
  }

  // Get students by multiple filters
  static getStudentsFiltered(filters: {
    department?: string
    batch?: string
    year?: number
    semester?: number
  }): User[] {
    return this.students.filter(student => {
      if (filters.department && student.department !== filters.department) return false
      if (filters.batch && student.batch !== filters.batch) return false
      if (filters.year && student.year !== filters.year) return false
      if (filters.semester && student.semester !== filters.semester) return false
      return true
    })
  }

  // Bulk add students to group
  static bulkAddStudentsToGroup(groupId: string, studentIds: string[]): Group {
    const groupIndex = this.groups.findIndex(g => g.id === groupId)
    if (groupIndex === -1) {
      throw new Error("Group not found")
    }

    const group = this.groups[groupIndex]
    const studentsToAdd = this.students.filter(s => studentIds.includes(s.id))

    // Check for duplicates and capacity
    const existingMemberIds = group.members.map((m: any) => m.id)
    const newStudents = studentsToAdd.filter(s => !existingMemberIds.includes(s.id))

    if (group.maxMembers && (group.members.length + newStudents.length) > group.maxMembers) {
      throw new Error(`Adding ${newStudents.length} students would exceed the maximum capacity of ${group.maxMembers}`)
    }

    group.members.push(...newStudents)
    group.updatedAt = new Date().toISOString()
    this.groups[groupIndex] = group

    return this.mapToGroup(group)
  }

  // Helper method to map raw group data to Group interface
  private static mapToGroup(groupData: any): Group {
    const professor = this.professors.find(p => p.id === groupData.professorId)
    if (!professor) {
      throw new Error("Professor not found for group")
    }

    return {
      id: groupData.id,
      name: groupData.name,
      description: groupData.description,
      professorId: groupData.professorId,
      professor,
      members: groupData.members,
      createdAt: new Date(groupData.createdAt),
      updatedAt: new Date(groupData.updatedAt),
      isActive: groupData.isActive,
      maxMembers: groupData.maxMembers,
      subject: groupData.subject,
      profControlled: groupData.profControlled,
    }
  }
}
