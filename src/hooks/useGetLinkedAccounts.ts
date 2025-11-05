"use client"

import { useEffect, useState } from "react"
import { api, instance } from "@/api"

interface LinkedAccountCluster {
  cluster_id: number
  citizen_ids: number[]
  member_count: number
  created_at: string | null
}

const useGetLinkedAccounts = () => {
  const [cluster, setCluster] = useState<LinkedAccountCluster | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("token")
      if (token) {
        instance.defaults.headers.common["Authorization"] = `Bearer ${token}`
      }
    }
  }, [])

  const fetchCluster = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get("account-clusters/my-cluster")
      if (response?.status === 200) {
        setCluster(response.data as LinkedAccountCluster)
      } else {
        setError("Failed to fetch linked accounts")
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setCluster({
          cluster_id: 0,
          citizen_ids: [],
          member_count: 1,
          created_at: null,
        })
      } else {
        setError(err?.message || "Failed to fetch linked accounts")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCluster()
  }, [])

  return { cluster, isLoading, error, refresh: fetchCluster }
}

export default useGetLinkedAccounts

