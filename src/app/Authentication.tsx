import useGetTokenAuth from "@/hooks/useGetTokenAuth"
import { User } from "@/types/User"
import { jwtDecode } from "jwt-decode"
import { useRouter } from "next/navigation"
import { ReactNode } from "react"

const Authentication = ({children}: {children: ReactNode}) => {
  const token = localStorage.getItem('token')
  const router = useRouter()
  
  if(!token) {
    router.push('/auth')
    return;
  }

  if(token) {
    const user = jwtDecode(token) as User;
    if(!user.email || !user.citizen_id) {
      localStorage.removeItem('token')
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