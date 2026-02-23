import { useCallback, useState } from "react"
import { UploadsService } from "@/client"

export type UploadStatus =
  | "idle"
  | "getting-url"
  | "uploading"
  | "success"
  | "error"

export interface UploadProgress {
  status: UploadStatus
  progress: number // 0-100
  error?: string
}

export interface UploadResult {
  publicUrl: string
  key: string
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]

export function useFileUpload() {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    status: "idle",
    progress: 0,
  })

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}`
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024} MB`
    }
    return null
  }, [])

  const uploadFile = useCallback(
    async (file: File): Promise<UploadResult> => {
      const validationError = validateFile(file)
      if (validationError) {
        setUploadProgress({
          status: "error",
          progress: 0,
          error: validationError,
        })
        throw new Error(validationError)
      }

      try {
        setUploadProgress({ status: "getting-url", progress: 0 })

        const { upload_url, public_url, key } =
          await UploadsService.getPresignedUploadUrl({
            requestBody: {
              filename: file.name,
              content_type: file.type,
            },
          })

        setUploadProgress({ status: "uploading", progress: 0 })

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100)
              setUploadProgress({ status: "uploading", progress: percent })
            }
          })

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve()
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`))
            }
          })

          xhr.addEventListener("error", () => {
            reject(new Error("Network error during upload"))
          })

          xhr.addEventListener("abort", () => {
            reject(new Error("Upload aborted"))
          })

          xhr.open("PUT", upload_url)
          xhr.setRequestHeader("Content-Type", file.type)
          xhr.send(file)
        })

        setUploadProgress({ status: "success", progress: 100 })

        return { publicUrl: public_url, key }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed"
        setUploadProgress({ status: "error", progress: 0, error: errorMessage })
        throw error
      }
    },
    [validateFile],
  )

  const reset = useCallback(() => {
    setUploadProgress({ status: "idle", progress: 0 })
  }, [])

  return {
    uploadFile,
    uploadProgress,
    reset,
    isUploading:
      uploadProgress.status === "uploading" ||
      uploadProgress.status === "getting-url",
  }
}
