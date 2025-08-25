"use client"

import { useRouter } from "next/navigation"
import ProfessorSignup from "@/components/auth/ProfessorSignup"
import { ProfessorSignupData } from "@/types/auth"
import { useAuth } from "@/hooks/useAuth"

export default function ProfessorSignupPage() {
  const router = useRouter()
  const { registerTeacher, isLoading } = useAuth()

  const handleSignup = async (data: ProfessorSignupData) => {
    const result = await registerTeacher(data)
    if (result.success) {
      router.push('/')
    }
    // Error handling is now done in the useAuth hook with Sonner
  }

  return <ProfessorSignup onSignup={handleSignup} isLoading={isLoading} />
}
