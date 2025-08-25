import NextAuth from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      id: string
      email: string
      name: string
      role: 'student' | 'teacher' | 'admin'
      department?: string
      avatar?: string
      // Student fields
      studentid?: string
      year?: string
      batch?: string
      semester?: string
      // Teacher fields
      professorid?: string
      specialisation?: string[]
      bio?: string
      officeHours?: string
      subjects?: string[]
      isOnline?: boolean
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: 'student' | 'teacher' | 'admin'
    department?: string
    avatar?: string
    // Student fields
    studentid?: string
    year?: string
    batch?: string
    semester?: string
    // Teacher fields
    professorid?: string
    specialisation?: string[]
    bio?: string
    officeHours?: string
    subjects?: string[]
    isOnline?: boolean
    accessToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    role?: 'student' | 'teacher' | 'admin'
    department?: string
    avatar?: string
    // Student fields
    studentid?: string
    year?: string
    batch?: string
    semester?: string
    // Teacher fields
    professorid?: string
    specialisation?: string[]
    bio?: string
    officeHours?: string
    subjects?: string[]
    isOnline?: boolean
  }
}
