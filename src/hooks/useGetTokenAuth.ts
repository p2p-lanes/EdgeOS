'use client'
import { User } from "@/types/User"
import { useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode";

const useGetTokenAuth = () => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if(typeof window === 'undefined') return;
    const token = window?.localStorage?.getItem('token')
    if(token) {
      const user = jwtDecode(token) as User
      setUser(user)
    }
  }, [])

  return ({user})
}
export default useGetTokenAuth