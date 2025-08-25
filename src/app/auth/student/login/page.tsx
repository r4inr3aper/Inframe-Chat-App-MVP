"use client"

import { useRouter } from "next/navigation"
import StudentLogin from "@/components/auth/StudentLogin"
import { LoginData } from "@/types/auth"
import { useAuth } from "@/hooks/useAuth"

export default function StudentLoginPage() {
  const router = useRouter()
  const { loginStudent, isLoading } = useAuth()

  const handleLogin = async (data: LoginData) => {
    const result = await loginStudent(data.email, data.password)
    if (result.success) {
      router.push('/')
    }
    // Error handling is now done in the useAuth hook with Sonner
  }

  return <StudentLogin onLogin={handleLogin} isLoading={isLoading} />
}
