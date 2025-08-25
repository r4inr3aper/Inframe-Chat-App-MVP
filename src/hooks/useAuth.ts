"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect } from "react"
import { useAuthStore, convertSessionUserToUser } from "@/stores/authStore"
import { registerUser } from "@/lib/auth"
import { toast } from "sonner"

export function useAuth() {
  const { data: session, status } = useSession()
  const { currentUser, isLoading, error, setCurrentUser, setLoading, setError, clearError } = useAuthStore()

  // Sync NextAuth session with Zustand store
  useEffect(() => {
    if (status === "loading") {
      setLoading(true)
    } else {
      setLoading(false)
      
      if (session?.user) {
        const user = convertSessionUserToUser(session.user)
        setCurrentUser(user)
      } else {
        setCurrentUser(null)
      }
    }
  }, [session, status, setCurrentUser, setLoading])

  // Login functions for different roles
  const loginStudent = async (email: string, password: string) => {
    try {
      setLoading(true)
      clearError()

      const result = await signIn("student-login", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        const errorMessage = result.error === "CredentialsSignin"
          ? "Invalid email or password"
          : result.error
        setError(errorMessage)
        toast.error("Login Failed", {
          description: errorMessage
        })
        return { success: false, error: errorMessage }
      }

      // Remove flooding success message
      // toast.success("Login Successful", {
      //   description: "Welcome back!"
      // })
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed"
      setError(errorMessage)
      toast.error("Login Failed", {
        description: errorMessage
      })
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const loginTeacher = async (email: string, password: string) => {
    try {
      setLoading(true)
      clearError()

      const result = await signIn("teacher-login", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        const errorMessage = result.error === "CredentialsSignin"
          ? "Invalid email or password"
          : result.error
        setError(errorMessage)
        toast.error("Login Failed", {
          description: errorMessage
        })
        return { success: false, error: errorMessage }
      }

      // Remove flooding success message
      // toast.success("Login Successful", {
      //   description: "Welcome back!"
      // })
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed"
      setError(errorMessage)
      toast.error("Login Failed", {
        description: errorMessage
      })
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const loginAdmin = async (email: string, password: string) => {
    try {
      setLoading(true)
      clearError()

      const result = await signIn("admin-login", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        const errorMessage = result.error === "CredentialsSignin"
          ? "Invalid email or password"
          : result.error
        setError(errorMessage)
        toast.error("Login Failed", {
          description: errorMessage
        })
        return { success: false, error: errorMessage }
      }

      // Remove flooding success message
      // toast.success("Login Successful", {
      //   description: "Welcome back!"
      // })
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed"
      setError(errorMessage)
      toast.error("Login Failed", {
        description: errorMessage
      })
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Registration functions
  const registerStudent = async (userData: any) => {
    try {
      setLoading(true)
      clearError()

      await registerUser(userData, 'student')

      toast.success("Registration Successful", {
        description: "Account created successfully! Logging you in..."
      })

      // After successful registration, log in the user
      const loginResult = await loginStudent(userData.email, userData.password)
      return loginResult
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed"
      setError(errorMessage)
      toast.error("Registration Failed", {
        description: errorMessage
      })
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const registerTeacher = async (userData: any) => {
    try {
      setLoading(true)
      clearError()

      await registerUser(userData, 'teacher')

      toast.success("Registration Successful", {
        description: "Account created successfully! Logging you in..."
      })

      // After successful registration, log in the user
      const loginResult = await loginTeacher(userData.email, userData.password)
      return loginResult
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed"
      setError(errorMessage)
      toast.error("Registration Failed", {
        description: errorMessage
      })
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const registerAdmin = async (userData: any) => {
    try {
      setLoading(true)
      clearError()

      await registerUser(userData, 'admin')

      toast.success("Registration Successful", {
        description: "Account created successfully! Logging you in..."
      })

      // After successful registration, log in the user
      const loginResult = await loginAdmin(userData.email, userData.password)
      return loginResult
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed"
      setError(errorMessage)
      toast.error("Registration Failed", {
        description: errorMessage
      })
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      setLoading(true)

      // Use NextAuth's built-in redirect
      await signOut({
        redirect: true,
        callbackUrl: '/auth'
      })

      setCurrentUser(null)
      clearError()
      toast.success("Logged Out", {
        description: "See you next time!"
      })
      return { success: true }
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Logout Failed", {
        description: "Please try again"
      })
      return { success: false, error: "Logout failed" }
    } finally {
      setLoading(false)
    }
  }

  return {
    // State
    user: currentUser,
    isAuthenticated: !!session,
    isLoading: status === "loading" || isLoading,
    error,
    session,
    
    // Actions
    loginStudent,
    loginTeacher,
    loginAdmin,
    registerStudent,
    registerTeacher,
    registerAdmin,
    logout,
    clearError,
    
    // Access token for API calls
    accessToken: session?.accessToken,
  }
}
