'use client'
import { User } from "@/types/User"
import { useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode";
import useWindow from "./useWindow";

const useGetTokenAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const { window } = useWindow()

  useEffect(() => {
    const token = window?.localStorage?.getItem('token')
    console.log('token', token)
    if(token) {
      const user = jwtDecode(token) as User
      setUser(user)
    }
  }, [window?.localStorage])

  return ({user})
}
export default useGetTokenAuth