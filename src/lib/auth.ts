import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Backend API base URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5500"

// Types for backend response
interface BackendUser {
  _id: string
  email: string
  name: string
  role: 'student' | 'teacher' | 'admin'
  department?: string
  avatar?: string
  emailVerified?: boolean
  isActive?: boolean
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

interface BackendAuthResponse {
  success: boolean
  message: string
  data?: {
    user: BackendUser
    token: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "student-login",
      name: "Student Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        try {
          const response = await fetch(`${BACKEND_URL}/api/v1/auth/loginstudent`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          const data: BackendAuthResponse = await response.json()

          if (!response.ok || !data.success || !data.data) {
            throw new Error(data.message || "Authentication failed")
          }

          const { user, token } = data.data

          return {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department,
            avatar: user.avatar,
            studentid: user.studentid,
            year: user.year,
            batch: user.batch,
            semester: user.semester,
            accessToken: token,
          }
        } catch (error) {
          console.error("Student login error:", error)
          throw new Error(error instanceof Error ? error.message : "Authentication failed")
        }
      },
    }),
    CredentialsProvider({
      id: "teacher-login",
      name: "Teacher Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        try {
          const response = await fetch(`${BACKEND_URL}/api/v1/auth/loginteacher`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`HTTP ${response.status}: ${errorText}`)
          }

          const data: BackendAuthResponse = await response.json()

          if (!data.success || !data.data) {
            throw new Error(data.message || "Authentication failed")
          }

          const { user, token } = data.data

          return {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department,
            avatar: user.avatar,
            professorid: user.professorid,
            specialisation: user.specialisation,
            bio: user.bio,
            officeHours: user.officeHours,
            subjects: user.subjects,
            isOnline: user.isOnline,
            accessToken: token,
          }
        } catch (error) {
          console.error("Teacher login error:", error)
          if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error("Network error: Cannot connect to backend server")
          }
          throw new Error(error instanceof Error ? error.message : "Authentication failed")
        }
      },
    }),
    CredentialsProvider({
      id: "admin-login",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        try {
          const response = await fetch(`${BACKEND_URL}/api/v1/auth/loginadmin`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          const data: BackendAuthResponse = await response.json()

          if (!response.ok || !data.success || !data.data) {
            throw new Error(data.message || "Authentication failed")
          }

          const { user, token } = data.data

          return {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department,
            avatar: user.avatar,
            accessToken: token,
          }
        } catch (error) {
          console.error("Admin login error:", error)
          throw new Error(error instanceof Error ? error.message : "Authentication failed")
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Persist the OAuth access_token and user data to the token right after signin
      if (user) {
        token.accessToken = user.accessToken
        token.role = user.role
        token.department = user.department
        token.avatar = user.avatar
        token.studentid = user.studentid
        token.year = user.year
        token.batch = user.batch
        token.semester = user.semester
        token.professorid = user.professorid
        token.specialisation = user.specialisation
        token.bio = user.bio
        token.officeHours = user.officeHours
        token.subjects = user.subjects
        token.isOnline = user.isOnline
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.accessToken = token.accessToken
        session.user.id = token.sub || ''
        session.user.role = token.role || 'student'
        session.user.department = token.department
        session.user.avatar = token.avatar
        session.user.studentid = token.studentid
        session.user.year = token.year
        session.user.batch = token.batch
        session.user.semester = token.semester
        session.user.professorid = token.professorid
        session.user.specialisation = token.specialisation
        session.user.bio = token.bio
        session.user.officeHours = token.officeHours
        session.user.subjects = token.subjects
        session.user.isOnline = token.isOnline
      }
      return session
    },
  },
  pages: {
    signIn: "/auth",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Helper function for backend registration
export async function registerUser(userData: any, role: 'student' | 'teacher' | 'admin') {
  try {
    const endpoint = role === 'student' ? 'registerstudent' :
                    role === 'teacher' ? 'registerteacher' : 'registeradmin'

    const response = await fetch(`${BACKEND_URL}/api/v1/auth/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data: BackendAuthResponse = await response.json()

    if (!data.success) {
      throw new Error(data.message || "Registration failed")
    }

    return data.data
  } catch (error) {
    console.error("Registration error:", error)
    throw error
  }
}
