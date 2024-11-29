'use client'

import { jwtDecode } from "jwt-decode"

export const getToken = () => {
  if(typeof window === 'undefined') return;
  const token = window?.localStorage?.getItem('token')
  if(token) { 
    const decoded = jwtDecode(token) as any
    return decoded
  }
  return null
}