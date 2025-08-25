// Export all stores
export { useAuthStore } from './authStore'
export { useUIStore, useNotifications } from './uiStore'
export { useChatStore, useChatActions, useChatSelectors } from './chatStore'
export { useGroupStore, useGroupActions, useGroupSelectors } from './groupStore'

// Export types
export type { ViewType } from './uiStore'

// Re-export with different names for convenience
export { useUIStore as useUI } from './uiStore'
