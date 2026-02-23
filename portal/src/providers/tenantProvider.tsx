"use client"

import type { TenantPublic } from "@edgeos/api-client"
import { ApiError, TenantsService } from "@edgeos/api-client"
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"
import "@/lib/api-client"

const TENANT_STORAGE_KEY = "portal_tenant_id"

interface TenantContextValue {
  tenantId: string | null
  tenantSlug: string | null
  tenant: TenantPublic | null
  isLoading: boolean
  error: string | null
}

const TenantContext = createContext<TenantContextValue | null>(null)

function extractSubdomain(hostname: string): string | null {
  // e.g. "edge-city.portal.muvinai.com" -> "edge-city"
  // For local dev, use "edge-city.localhost" which resolves to 127.0.0.1
  const parts = hostname.split(".")
  if (parts.length >= 2 && parts[0] !== "www") {
    return parts[0]
  }

  return null
}

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const [tenant, setTenant] = useState<TenantPublic | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [slug, setSlug] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const hostname = window.location.hostname
    const extracted = extractSubdomain(hostname)
    setSlug(extracted)

    if (!extracted) {
      setError("Unable to determine tenant from domain")
      setIsLoading(false)
      return
    }

    TenantsService.getTenantBySlug({ slug: extracted })
      .then((result) => {
        setTenant(result)
        localStorage.setItem(TENANT_STORAGE_KEY, result.id)
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setError(`Tenant "${extracted}" not found`)
        } else {
          setError("Failed to resolve tenant")
        }
        localStorage.removeItem(TENANT_STORAGE_KEY)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-100">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-gray-900 rounded-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-100">
        <div className="text-center max-w-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Tenant not found
          </h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <TenantContext.Provider
      value={{
        tenantId: tenant?.id ?? null,
        tenantSlug: slug,
        tenant,
        isLoading,
        error,
      }}
    >
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider")
  }
  return context
}
