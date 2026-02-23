import { AxiosError } from "axios"
import type { ApiError } from "./client"

interface ApiErrorBody {
  detail?: string | Array<{ msg: string }>
}

function extractErrorMessage(err: ApiError): string {
  if (err instanceof AxiosError) {
    return err.message
  }

  const errDetail = (err.body as ApiErrorBody)?.detail
  if (Array.isArray(errDetail)) {
    return errDetail.length > 0 ? errDetail[0].msg : "Something went wrong."
  }
  return errDetail || "Something went wrong."
}

export function createErrorHandler(showToast: (msg: string) => void) {
  return (err: ApiError) => {
    const errorMessage = extractErrorMessage(err)
    showToast(errorMessage)
  }
}

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}
