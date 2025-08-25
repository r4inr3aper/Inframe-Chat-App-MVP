"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/stores"

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

const colorMap = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800"
}

const iconColorMap = {
  success: "text-green-600",
  error: "text-red-600",
  warning: "text-yellow-600",
  info: "text-blue-600"
}

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      <AnimatePresence>
        {notifications.map((notification) => {
          const Icon = iconMap[notification.type]
          
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.3 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
              className={`
                relative p-4 rounded-lg border shadow-lg backdrop-blur-sm
                ${colorMap[notification.type]}
              `}
            >
              <div className="flex items-start space-x-3">
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColorMap[notification.type]}`} />
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold">{notification.title}</h4>
                  {notification.message && (
                    <p className="text-sm opacity-90 mt-1">{notification.message}</p>
                  )}
                  
                  {notification.action && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={notification.action.onClick}
                      className="mt-2 h-auto p-1 text-xs hover:bg-white/20"
                    >
                      {notification.action.label}
                    </Button>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNotification(notification.id)}
                  className="h-auto p-1 hover:bg-white/20 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// Hook for easy notification usage in components
export const useToast = () => {
  const { showSuccess, showError, showWarning, showInfo } = useNotifications()
  
  return {
    toast: {
      success: showSuccess,
      error: showError,
      warning: showWarning,
      info: showInfo
    }
  }
}
