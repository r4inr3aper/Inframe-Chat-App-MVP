import { create } from 'zustand'

export type ViewType = 'search' | 'chat' | 'study-groups' | 'manage-groups' | 'test-dashboard'

interface UIState {
  // Sidebar state
  isSidebarOpen: boolean
  isMobile: boolean
  
  // Current view
  currentView: ViewType
  
  // Loading states
  isPageLoading: boolean
  isComponentLoading: boolean
  
  // Modal states
  isModalOpen: boolean
  modalType: string | null
  modalData: any
  
  // Toast/notification state
  notifications: Notification[]
  
  // Theme
  theme: 'light' | 'dark' | 'system'
  
  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setMobile: (mobile: boolean) => void
  setCurrentView: (view: ViewType) => void
  setPageLoading: (loading: boolean) => void
  setComponentLoading: (loading: boolean) => void
  openModal: (type: string, data?: any) => void
  closeModal: () => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  isSidebarOpen: true,
  isMobile: false,
  currentView: 'study-groups',
  isPageLoading: false,
  isComponentLoading: false,
  isModalOpen: false,
  modalType: null,
  modalData: null,
  notifications: [],
  theme: 'light',

  // Actions
  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }))
  },

  setSidebarOpen: (open: boolean) => {
    set({ isSidebarOpen: open })
  },

  setMobile: (mobile: boolean) => {
    set({ isMobile: mobile })
    // Auto-close sidebar on mobile
    if (mobile) {
      set({ isSidebarOpen: false })
    }
  },

  setCurrentView: (view: ViewType) => {
    set({ currentView: view })
  },

  setPageLoading: (loading: boolean) => {
    set({ isPageLoading: loading })
  },

  setComponentLoading: (loading: boolean) => {
    set({ isComponentLoading: loading })
  },

  openModal: (type: string, data?: any) => {
    set({
      isModalOpen: true,
      modalType: type,
      modalData: data
    })
  },

  closeModal: () => {
    set({
      isModalOpen: false,
      modalType: null,
      modalData: null
    })
  },

  addNotification: (notification: Omit<Notification, 'id'>) => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newNotification: Notification = {
      id,
      duration: 5000, // Default 5 seconds
      ...notification
    }
    
    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }))

    // Auto-remove notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id)
      }, newNotification.duration)
    }
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }))
  },

  clearNotifications: () => {
    set({ notifications: [] })
  },

  setTheme: (theme: 'light' | 'dark' | 'system') => {
    set({ theme })
    
    // Apply theme to document
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement
      
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        root.classList.toggle('dark', systemTheme === 'dark')
      } else {
        root.classList.toggle('dark', theme === 'dark')
      }
    }
  }
}))

// Helper hook for notifications
export const useNotifications = () => {
  const { notifications, addNotification, removeNotification, clearNotifications } = useUIStore()
  
  const showSuccess = (title: string, message?: string) => {
    addNotification({ type: 'success', title, message })
  }
  
  const showError = (title: string, message?: string) => {
    addNotification({ type: 'error', title, message })
  }
  
  const showWarning = (title: string, message?: string) => {
    addNotification({ type: 'warning', title, message })
  }
  
  const showInfo = (title: string, message?: string) => {
    addNotification({ type: 'info', title, message })
  }
  
  return {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearNotifications
  }
}
