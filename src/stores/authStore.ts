import { create } from 'zustand'
import { User } from '@/types/chat'

interface AuthState {
  // State
  currentUser: User | null
  isLoading: boolean
  error: string | null

  // Actions
  setCurrentUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

// Convert NextAuth session user to our User type
export const convertSessionUserToUser = (sessionUser: any): User => {
  return {
    id: sessionUser.id,
    name: sessionUser.name,
    email: sessionUser.email,
    department: sessionUser.department || '',
    role: sessionUser.role === 'teacher' ? 'professor' : sessionUser.role, // Map teacher to professor
    avatar: sessionUser.avatar,
    // Student fields
    studentId: sessionUser.studentid,
    year: sessionUser.year ? parseInt(sessionUser.year) : undefined,
    batch: sessionUser.batch,
    semester: sessionUser.semester ? parseInt(sessionUser.semester) : undefined,
    // Professor fields
    professorId: sessionUser.professorid,
    specialization: sessionUser.specialisation,
    bio: sessionUser.bio,
    officeHours: sessionUser.officeHours,
    subjects: sessionUser.subjects,
    isOnline: sessionUser.isOnline
  }
}

// Simple auth store for NextAuth integration
export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  currentUser: null,
  isLoading: false,
  error: null,

  // Actions
  setCurrentUser: (user: User | null) => {
    set({ currentUser: user })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  setError: (error: string | null) => {
    set({ error })
  },

  clearError: () => {
    set({ error: null })
  },
}))


