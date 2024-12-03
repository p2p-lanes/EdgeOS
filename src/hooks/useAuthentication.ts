'use client'

import { User } from "@/types/User"
import { jwtDecode } from "jwt-decode"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface UseAuthenticationReturn {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: () => boolean
  logout: () => void
  validateToken: (token: string) => boolean;
  token: string | null
}

const useAuthentication = (): UseAuthenticationReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const paramssearch = new URLSearchParams(window.location.search)
  const token = paramssearch.get('token_url')

  const validateToken = (token: string): boolean => {
    try {
      const decoded = jwtDecode(token) as User
      return !!(decoded && decoded.email && decoded.citizen_id)
    } catch {
      return false
    }
  }

  const login = (): boolean => {
    if (!token) return false

    if (validateToken(token)) {
      window?.localStorage?.setItem('token', token)
      const decoded = jwtDecode(token) as User
      setUser(decoded)
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const logout = () => {
    window?.localStorage?.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
    router.push('/auth')
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    const token = window?.localStorage?.getItem('token')
    if (!token) {
      setIsLoading(false)
      return
    }

    if (validateToken(token)) {
      const decoded = jwtDecode(token) as User
      setUser(decoded)
      setIsAuthenticated(true)
    } else {
      logout()
    }
    setIsLoading(false)
  }, [token])

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    validateToken, 
    token
  }
}

export default useAuthentication