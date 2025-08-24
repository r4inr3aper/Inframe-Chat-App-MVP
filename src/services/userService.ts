import { User } from "@/types/chat"
import userData from "@/data/user.json"

export class UserService {
  private static currentUser: User = userData as User

  // Get current user
  static getCurrentUser(): User {
    return this.currentUser
  }

  // Check if current user is a professor
  static isCurrentUserProfessor(): boolean {
    return this.currentUser.role === "professor"
  }

  // Check if current user is a student
  static isCurrentUserStudent(): boolean {
    return this.currentUser.role === "student"
  }

  // Set current user (for demo purposes - in real app this would come from auth)
  static setCurrentUser(user: User): void {
    this.currentUser = user
  }

  // Switch user role for demo
  static switchToRole(role: "student" | "professor"): void {
    if (role === "professor") {
      this.currentUser = {
        id: "prof-001",
        name: "Dr. Sarah Mitchell",
        email: "s.mitchell@university.edu",
        avatar: "/avatars/prof-sarah.jpg",
        professorId: "prof-001",
        department: "Computer Science",
        role: "professor"
      }
    } else {
      this.currentUser = {
        id: "user-001",
        name: "John Student",
        email: "john.student@university.edu",
        avatar: "/avatars/user.jpg",
        studentId: "STU-2024-001",
        department: "Computer Science",
        role: "student"
      }
    }
  }
}
