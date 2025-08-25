"use client"

import { useEffect } from "react"
import { useUIStore } from "@/stores"

interface StoreProviderProps {
  children: React.ReactNode
}

export default function StoreProvider({ children }: StoreProviderProps) {
  const { setMobile } = useUIStore()

  useEffect(() => {
    // Initialize mobile detection
    const checkMobile = () => {
      setMobile(window.innerWidth < 768)
    }

    // Check on mount
    checkMobile()

    // Listen for resize events
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [setMobile])

  return <>{children}</>
}
