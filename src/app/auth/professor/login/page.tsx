"use client"

import { useRouter } from "next/navigation"
import ProfessorLogin from "@/components/auth/ProfessorLogin"
import { LoginData } from "@/types/auth"
import { useAuth } from "@/hooks/useAuth"

export default function ProfessorLoginPage() {
  const router = useRouter()
  const { loginTeacher, isLoading } = useAuth()

  const handleLogin = async (data: LoginData) => {
    const result = await loginTeacher(data.email, data.password)
    if (result.success) {
      router.push('/')
    }
    // Error handling is now done in the useAuth hook with Sonner
  }

  return <ProfessorLogin onLogin={handleLogin} isLoading={isLoading} />
}
