'use client'

import { jwtDecode } from "jwt-decode";

export const getUser = (): string | null => {
  const token = window?.localStorage?.getItem('token')
  if(token) {
    const decoded = jwtDecode(token) as any
    return decoded?.email
  }
  return null
}