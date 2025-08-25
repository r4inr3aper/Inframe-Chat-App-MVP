import { Professor } from "@/types/chat"

// Backend API base URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5500"

// Types for backend response
interface BackendTeacherResponse {
  success: boolean
  message: string
  data?: BackendTeacher[]
}

interface BackendTeacher {
  _id: string
  email: string
  name: string
  department?: string
  professorid?: string
  specialisation?: string[]
  bio?: string
  officeHours?: string
  subjects?: string[]
  isOnline?: boolean
  avatar?: string
  role: string
  createdAt: string
  updatedAt: string
}

// Convert backend teacher to frontend Professor type
const convertBackendTeacher = (backendTeacher: BackendTeacher): Professor => {
  return {
    id: backendTeacher._id,
    name: backendTeacher.name,
    email: backendTeacher.email,
    department: backendTeacher.department || 'Unknown',
    specialization: backendTeacher.specialisation || [],
    bio: backendTeacher.bio || 'No bio available',
    officeHours: backendTeacher.officeHours || 'Not specified',
    subjects: backendTeacher.subjects || [],
    isOnline: backendTeacher.isOnline || false,
    avatar: backendTeacher.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    rating: 4.5, // Default rating since not in backend
    responseTime: 'Within 24 hours' // Default response time
  }
}

export class ProfessorService {
  // Cache for professors data
  private static professorsCache: Professor[] | null = null
  private static cacheTimestamp: number = 0
  private static readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Get all professors (teachers from backend)
  static async getAllProfessors(accessToken?: string): Promise<Professor[]> {
    // Check cache first
    const now = Date.now()
    if (this.professorsCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      console.log('Returning cached professors data')
      return this.professorsCache
    }
    try {
      console.log('Fetching teachers from:', `${BACKEND_URL}/api/v1/users/getteachers`)

      if (!accessToken) {
        throw new Error('Authentication required. Please log in to view professors.')
      }

      const response = await fetch(`${BACKEND_URL}/api/v1/users/getteachers`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.log('Error response:', errorText)

        // If authentication failed, throw a specific error
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.')
        }

        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data: BackendTeacherResponse = await response.json()
      console.log('Teachers data received:', data)

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch teachers")
      }

      // Handle empty data array
      if (!data.data || data.data.length === 0) {
        console.log('No teachers found in database')
        return []
      }

      // Convert backend teachers to frontend Professor format
      const professors = data.data.map(convertBackendTeacher)
      console.log('Converted professors:', professors.length)

      // Cache the results
      this.professorsCache = professors
      this.cacheTimestamp = now

      return professors
    } catch (error) {
      console.error("Failed to fetch teachers:", error)

      // Clear cache on error
      this.clearCache()

      // If it's a network error, provide a helpful message
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to the backend server. Please ensure the backend is running on http://localhost:5500')
      }

      // Re-throw the error to be handled by the UI
      throw error
    }
  }

  // Get professor by ID (from cached data or fetch all)
  static async getProfessorById(id: string, accessToken?: string): Promise<Professor | null> {
    try {
      // Use cached data if available, otherwise fetch all
      const allProfessors = await this.getAllProfessors(accessToken)
      return allProfessors.find(prof => prof.id === id) || null
    } catch (error) {
      console.error("Failed to fetch professor:", error)
      throw error
    }
  }

  // Search professors by query and filters (client-side filtering)
  static async searchProfessors(filters: {
    query?: string
    department?: string
    subjects?: string[]
    isOnline?: boolean
  }, accessToken?: string): Promise<Professor[]> {
    try {
      // Get all professors first
      const allProfessors = await this.getAllProfessors(accessToken)

      // Apply client-side filtering
      let filteredProfessors = allProfessors

      // Filter by search query (name, email, department, subjects)
      if (filters.query && filters.query.trim()) {
        const query = filters.query.toLowerCase()
        filteredProfessors = filteredProfessors.filter(prof =>
          prof.name.toLowerCase().includes(query) ||
          prof.email.toLowerCase().includes(query) ||
          prof.department.toLowerCase().includes(query) ||
          prof.subjects.some(subject => subject.toLowerCase().includes(query)) ||
          prof.specialization.some(spec => spec.toLowerCase().includes(query))
        )
      }

      // Filter by department
      if (filters.department && filters.department !== 'all') {
        filteredProfessors = filteredProfessors.filter(prof =>
          prof.department.toLowerCase() === filters.department!.toLowerCase()
        )
      }

      // Filter by subjects
      if (filters.subjects && filters.subjects.length > 0) {
        filteredProfessors = filteredProfessors.filter(prof =>
          filters.subjects!.some(subject =>
            prof.subjects.some(profSubject =>
              profSubject.toLowerCase().includes(subject.toLowerCase())
            )
          )
        )
      }

      // Filter by online status
      if (filters.isOnline !== undefined) {
        filteredProfessors = filteredProfessors.filter(prof =>
          prof.isOnline === filters.isOnline
        )
      }

      return filteredProfessors
    } catch (error) {
      console.error("Failed to search professors:", error)
      throw error
    }
  }

  // Get departments (extracted from professors data)
  static async getDepartments(accessToken?: string): Promise<string[]> {
    try {
      const allProfessors = await this.getAllProfessors(accessToken)
      const departments = [...new Set(allProfessors.map(prof => prof.department))]
      return departments.filter(dept => dept && dept !== 'Unknown')
    } catch (error) {
      console.error("Failed to fetch departments:", error)
      return []
    }
  }

  // Get subjects (extracted from professors data)
  static async getSubjects(accessToken?: string): Promise<string[]> {
    try {
      const allProfessors = await this.getAllProfessors(accessToken)
      const subjects = [...new Set(allProfessors.flatMap(prof => prof.subjects))]
      return subjects.filter(subject => subject && subject.trim() !== '')
    } catch (error) {
      console.error("Failed to fetch subjects:", error)
      return []
    }
  }

  // Clear cache (useful for testing or when data needs to be refreshed)
  static clearCache(): void {
    this.professorsCache = null
    this.cacheTimestamp = 0
  }


}
