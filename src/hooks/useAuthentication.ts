'use client'

import { api, instance } from "@/api"
import { User } from "@/types/User"
import { jwtDecode } from "jwt-decode"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface UseAuthenticationReturn {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: () => Promise<boolean>
  logout: () => void
  validateToken: (token: string) => boolean;
  token: string | null
}

const useAuthentication = (): UseAuthenticationReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const token = typeof window === 'undefined' ? null : window?.localStorage?.getItem('token')
  const searchParams = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search)
  const tokenUrl = searchParams?.get('token_url') ?? null;

  const validateToken = (token: string): boolean => {
    try {
      const decoded = jwtDecode(token) as User
      return !!(decoded && decoded.email && decoded.citizen_id)
    } catch {
      return false
    }
  }

  const _authenticate = async (): Promise<boolean> => {

    if (!tokenUrl) return false;

    const tokenAuthenticate = jwtDecode(tokenUrl) as any

    if(tokenAuthenticate && tokenAuthenticate.url) {
      const response = await api.post(tokenAuthenticate.url)
      if(response.status === 200 && response.data?.access_token) {
        window?.localStorage?.setItem('token', response.data.access_token)
        instance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`
        const decoded = jwtDecode(response.data.access_token) as User
        setUser(decoded)
        return true
      }
    }

    return false;
  }

  const login = async (): Promise<boolean> => {
    const isAuthenticated = await _authenticate()

    if (isAuthenticated) {
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const logout = () => {
    window?.localStorage?.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
    setIsLoading(false)
    router.push('/auth')
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!token) {
      if(!tokenUrl){
        setIsLoading(false)
      }
      return
    }
    
    if (validateToken(token)) {
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const decoded = jwtDecode(token) as User
      setUser(decoded)
      setIsAuthenticated(true)
    } else {
      logout()
    }
    setIsLoading(false)
  }, [token, tokenUrl])

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    validateToken, 
    token,
  }
}

export default useAuthentication