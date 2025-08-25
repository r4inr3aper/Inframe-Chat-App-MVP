"use client"

import { useRouter } from "next/navigation"
import StudentSignup from "@/components/auth/StudentSignup"
import { StudentSignupData } from "@/types/auth"
import { useAuth } from "@/hooks/useAuth"

export default function StudentSignupPage() {
  const router = useRouter()
  const { registerStudent, isLoading } = useAuth()

  const handleSignup = async (data: StudentSignupData) => {
    const result = await registerStudent(data)
    if (result.success) {
      router.push('/')
    }
    // Error handling is now done in the useAuth hook with Sonner
  }

  return <StudentSignup onSignup={handleSignup} isLoading={isLoading} />
}
