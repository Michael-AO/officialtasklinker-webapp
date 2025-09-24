"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { X, Upload, File, ImageIcon, FileText } from "lucide-react"
import { formatFileSize } from "@/lib/api-utils"

interface FileUploadProps {
  maxFiles?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
  onFilesChange?: (files: File[]) => void
  className?: string
}

export function FileUpload({
  maxFiles = 5,
  maxSize = 10,
  acceptedTypes = ["*/*"],
  onFilesChange,
  className = "",
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles)
      const validFiles: File[] = []

      fileArray.forEach((file) => {
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
          console.warn(`File ${file.name} is too large. Max size is ${maxSize}MB`)
          return
        }

        // Check file type
        const isValidType = acceptedTypes.some((type) => {
          if (type === "*/*") return true
          if (type.startsWith(".")) return file.name.toLowerCase().endsWith(type.toLowerCase())
          return file.type.startsWith(type.split("/")[0])
        })

        if (!isValidType) {
          console.warn(`File ${file.name} is not an accepted file type`)
          return
        }

        validFiles.push(file)
      })

      const updatedFiles = [...files, ...validFiles].slice(0, maxFiles)
      setFiles(updatedFiles)
      onFilesChange?.(updatedFiles)
    },
    [files, maxFiles, maxSize, acceptedTypes, onFilesChange],
  )

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles],
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />
    } else if (file.type.includes("pdf") || file.type.includes("document")) {
      return <FileText className="h-5 w-5 text-red-500" />
    } else {
      return <File className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className={className}>
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">Drop files here or click to upload</span>
                <span className="mt-1 block text-xs text-gray-500">
                  Max {maxFiles} files, up to {maxSize}MB each
                </span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  multiple={maxFiles > 1}
                  accept={acceptedTypes.join(",")}
                  onChange={handleChange}
                />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getFileIcon(file)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Uploading files...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}
    </div>
  )
}
