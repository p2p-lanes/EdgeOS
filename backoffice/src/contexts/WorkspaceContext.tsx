import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { TenantsService } from "@/client"
import useAuth from "@/hooks/useAuth"

interface WorkspaceContextType {
  // Tenant context (superadmins only)
  selectedTenantId: string | null
  setSelectedTenantId: (id: string | null) => void

  // Popup context (all users)
  selectedPopupId: string | null
  setSelectedPopupId: (id: string | null) => void

  // Derived state
  effectiveTenantId: string | null
  isContextReady: boolean
  needsTenantSelection: boolean
  needsPopupSelection: boolean
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null)

const TENANT_STORAGE_KEY = "workspace_tenant_id"
const POPUP_STORAGE_KEY = "workspace_popup_id"

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user, isSuperadmin } = useAuth()
  const queryClient = useQueryClient()

  // Initialize from localStorage
  const [selectedTenantId, setSelectedTenantIdState] = useState<string | null>(
    () => {
      if (typeof window === "undefined") return null
      return localStorage.getItem(TENANT_STORAGE_KEY)
    },
  )

  const [selectedPopupId, setSelectedPopupIdState] = useState<string | null>(
    () => {
      if (typeof window === "undefined") return null
      return localStorage.getItem(POPUP_STORAGE_KEY)
    },
  )

  // Fetch tenants for superadmin auto-selection
  const { data: tenants, isError: _tenantsError } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => TenantsService.listTenants({ skip: 0, limit: 100 }),
    enabled: isSuperadmin && !selectedTenantId,
  })

  // Auto-select first tenant for superadmins
  useEffect(() => {
    if (isSuperadmin && !selectedTenantId && tenants?.results?.length) {
      const firstTenantId = tenants.results[0].id
      setSelectedTenantIdState(firstTenantId)
      localStorage.setItem(TENANT_STORAGE_KEY, firstTenantId)
    }
  }, [isSuperadmin, selectedTenantId, tenants])

  // Persist tenant selection and invalidate queries
  const setSelectedTenantId = useCallback(
    (id: string | null) => {
      setSelectedTenantIdState(id)
      if (id) {
        localStorage.setItem(TENANT_STORAGE_KEY, id)
      } else {
        localStorage.removeItem(TENANT_STORAGE_KEY)
      }
      // Clear popup selection when tenant changes
      setSelectedPopupIdState(null)
      localStorage.removeItem(POPUP_STORAGE_KEY)
      // Invalidate tenant-scoped queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0]
          return [
            "products",
            "coupons",
            "groups",
            "applications",
            "attendees",
            "payments",
            "popups",
            "humans",
            "form-fields",
            "form-fields-schema",
            "approval-strategies",
            "popup-reviewers",
            "application-reviews",
          ].includes(key as string)
        },
      })
    },
    [queryClient],
  )

  // Persist popup selection and invalidate popup-scoped queries
  const setSelectedPopupId = useCallback(
    (id: string | null) => {
      setSelectedPopupIdState(id)
      if (id) {
        localStorage.setItem(POPUP_STORAGE_KEY, id)
      } else {
        localStorage.removeItem(POPUP_STORAGE_KEY)
      }
      // Invalidate popup-scoped queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0]
          return [
            "products",
            "coupons",
            "groups",
            "applications",
            "attendees",
            "payments",
            "form-builder",
          ].includes(key as string)
        },
      })
    },
    [queryClient],
  )

  // Derived state
  const isSuperadminUser = isSuperadmin
  const effectiveTenantId = isSuperadminUser
    ? selectedTenantId
    : (user?.tenant_id ?? null)
  const needsTenantSelection = isSuperadminUser && !selectedTenantId
  const needsPopupSelection = !selectedPopupId
  const isContextReady = !needsTenantSelection && !needsPopupSelection

  // Clear superadmin tenant selection if user logs out or is not superadmin
  useEffect(() => {
    if (user && !isSuperadminUser && selectedTenantId) {
      localStorage.removeItem(TENANT_STORAGE_KEY)
      setSelectedTenantIdState(null)
    }
  }, [user, isSuperadminUser, selectedTenantId])

  const value = useMemo(
    () => ({
      selectedTenantId,
      setSelectedTenantId,
      selectedPopupId,
      setSelectedPopupId,
      effectiveTenantId,
      isContextReady,
      needsTenantSelection,
      needsPopupSelection,
    }),
    [
      selectedTenantId,
      setSelectedTenantId,
      selectedPopupId,
      setSelectedPopupId,
      effectiveTenantId,
      isContextReady,
      needsTenantSelection,
      needsPopupSelection,
    ],
  )

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider")
  }
  return context
}

export function useOptionalWorkspace() {
  return useContext(WorkspaceContext)
}
