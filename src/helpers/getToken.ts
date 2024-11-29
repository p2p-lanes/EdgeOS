import { jwtDecode } from "jwt-decode"

export const getToken = () => {
  const token = localStorage.getItem('token')
  if(token) { 
    const decoded = jwtDecode(token) as any
    return decoded
  }
  return null
}