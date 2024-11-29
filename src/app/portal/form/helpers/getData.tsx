import { api } from "@/api";
import { jwtDecode } from "jwt-decode";

// Simulated function to check if user exists
export const getUser = (): string | null => {
  const token = localStorage.getItem('token')
  if(token) {
    const decoded = jwtDecode(token) as any
    return decoded?.email
  }
  return null
}

// Simulated function to fetch existing application data
export const fetchExistingApplication = async (email: string): Promise<any> => {
  // This is a mock implementation. In a real scenario, this would be an API call.

  const result = await api.get(`applications?email=${email}`)

  if(result.status === 200 && result.data?.[result.data.length - 1]?.status !== 'draft') {
    return result.data?.[result.data.length - 1]
  }

  return null
}

// New function to check for draft
export const checkForDraft = async (): Promise<any> => {
  const email = getUser()
  if(email) {
    const result = await api.get(`applications?email=${email}`)

    console.log('result check for checkForDraft', result)

    if(result.status === 200 && (result.data?.[result.data.length - 1]?.status === 'draft' || result.data?.[result.data.length - 1]?.status === 'in review')) {
      return result.data?.[result.data.length - 1]
    }
  }

  return null
}