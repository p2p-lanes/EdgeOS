"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Loader2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LabelMuted } from "./label"
import InputForm from "./Form/Input"

interface FileUploadInputProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  acceptedFileTypes?: string[]
  label?: string
  placeholder?: string
  buttonText?: string
  onChange?: (files: File[]) => void
  id: string
  value: string
  error?: string
  isRequired?: boolean
  loading?: boolean
  subtitle?: string
}

export function FileUploadInput({
  onFilesSelected,
  maxFiles = 1,
  acceptedFileTypes = ["application/pdf"],
  placeholder = "Drag and drop files here, or",
  label = "Select file",
  id,
  value,
  error,
  isRequired = false,
  subtitle,
  loading = false,
}: FileUploadInputProps) {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleChange = (e: any) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles
      .filter((file) => acceptedFileTypes.some((type) => file.type.match(type)))
      .slice(0, maxFiles - files.length)

    const updatedFiles = [...files, ...validFiles]
    setFiles(updatedFiles)
    onFilesSelected(updatedFiles)
  }

  const removeFile = () => {
    setFiles([])
    onFilesSelected([])
  }

  const openFileDialog = () => {
    inputRef.current?.click()
  }

  const canUpload = files.length < maxFiles && !value
  const nameFile = decodeURIComponent(value).split('/').pop()

  return (
    <div className="flex flex-col gap-4">
      <LabelMuted>{subtitle} {isRequired && <span className="text-red-500">*</span>}</LabelMuted>
      <div
        className={`p-4 border-2 border-dashed rounded-lg ${
          dragActive ? "border-primary" : "border-gray-300"
        } transition-colors duration-300 ease-in-out ${!canUpload && 'border-transparent'} ${error && 'border-red-500'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="hidden">
          <Input
            id={id}
            error={error}
            ref={inputRef}
            type="file"
            multiple
            onChange={handleChange}
            accept={acceptedFileTypes.join(",")}
            className="hidden"
          />
        </div>
        {
          canUpload && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Upload className="w-12 h-6 text-gray-400" />
              <p className="text-sm text-gray-600">{placeholder}</p>
              <Button onClick={openFileDialog} variant="outline" type="button">
                {label}
              </Button>
            </div>
          )
        }
        {(nameFile || loading) && (
          <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
                <div className="flex items-center space-x-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <span className="text-sm truncate">{nameFile}</span>}
                </div>
                <Button variant="ghost" size="icon" onClick={removeFile} type="button">
                  <X className="w-4 h-4" />
                </Button>
              </div>
          </div>
        )}
      </div>
    </div>
  )
}

