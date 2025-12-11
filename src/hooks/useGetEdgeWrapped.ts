"use client"

import { useState, useCallback } from "react"
import { api, instance } from "@/api"

interface UseGetEdgeWrappedReturn {
  isLoading: boolean
  error: string | null
  data: string | null
  fetchWrapped: () => Promise<void>
  reset: () => void
}

export const useGetEdgeWrapped = (): UseGetEdgeWrappedReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<string | null>(null)

  const fetchWrapped = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setData(null) // Clear previous data
    
    // Ensure auth token is set in headers (similar to useGetProfile)
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("token")
      if (token) {
        instance.defaults.headers.common["Authorization"] = `Bearer ${token}`
      }
    }

    try {
      const response = await api.get("citizens/edge-mapped", {
        responseType: 'arraybuffer'
      })
      if (response?.status === 200) {
        // Convert arraybuffer to base64 string
        const base64 = Buffer.from(response.data, 'binary').toString('base64');
        const imageUrl = `data:image/png;base64,${base64}`;
        setData(imageUrl)
      } else {
        setError("Failed to fetch Edge Wrapped")
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unexpected error fetching Edge Wrapped"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return { isLoading, error, data, fetchWrapped, reset }
}
