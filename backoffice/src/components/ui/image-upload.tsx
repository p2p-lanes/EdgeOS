import { AlertCircle, Loader2, Upload, X } from "lucide-react"
import { useCallback, useState } from "react"

import { useFileUpload } from "@/hooks/useFileUpload"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  className?: string
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  className,
  disabled,
}: ImageUploadProps) {
  const { uploadFile, uploadProgress, reset, isUploading } = useFileUpload()
  const [dragActive, setDragActive] = useState(false)

  const handleFile = useCallback(
    async (file: File) => {
      try {
        const result = await uploadFile(file)
        onChange(result.publicUrl)
      } catch {
        // Error is handled by the hook
      }
    },
    [uploadFile, onChange],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)

      if (disabled || isUploading) return

      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [disabled, isUploading, handleFile],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
      e.target.value = ""
    },
    [handleFile],
  )

  const handleRemove = useCallback(() => {
    onChange(null)
    reset()
  }, [onChange, reset])

  if (value) {
    return (
      <div className={cn("relative inline-block", className)}>
        <img
          src={value}
          alt="Uploaded"
          className="max-w-full h-auto rounded-lg border max-h-48 object-contain"
        />
        {!disabled && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            aria-label="Remove image"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
        dragActive && "border-primary bg-primary/5",
        uploadProgress.status === "error" && "border-destructive",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setDragActive(true)
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Uploading... {uploadProgress.progress}%
          </p>
          <div className="w-full max-w-xs bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${uploadProgress.progress}%` }}
            />
          </div>
        </div>
      ) : uploadProgress.status === "error" ? (
        <div className="flex flex-col items-center gap-2">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive">{uploadProgress.error}</p>
          <Button type="button" variant="outline" size="sm" onClick={reset}>
            Try Again
          </Button>
        </div>
      ) : (
        <label
          className={cn(
            "flex flex-col items-center gap-2",
            !disabled && "cursor-pointer",
          )}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag & drop or click to upload
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, GIF, WebP up to 10MB
          </p>
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleChange}
            disabled={disabled}
          />
        </label>
      )}
    </div>
  )
}
