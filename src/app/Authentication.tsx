'use client'

import { User } from "@/types/User"
import { jwtDecode } from "jwt-decode"
import { useRouter } from "next/navigation"
import { ReactNode } from "react"

const Authentication = ({children}: {children: ReactNode}) => {
  
  const router = useRouter()
  if(typeof window === 'undefined') return;
  const token = window?.localStorage?.getItem('token')
  
  if(!token) {
    router.push('/auth')
    return;
  }

  if(token) {
    const user = jwtDecode(token) as User;
    if(!user.email || !user.citizen_id) {
      window?.localStorage?.removeItem('token')
      router.push('/auth')
      return;
    }
  }

  return (
    <div>
      {children}
    </div>
  )
}
export default Authentication