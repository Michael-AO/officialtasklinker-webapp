"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, File, FileText, Video, Music, Archive, Download, Eye, Trash2, ImageIcon } from "lucide-react"

interface FileItem {
  id: string
  name: string
  size: number
  type: string
  url?: string
  uploadProgress?: number
  uploaded: boolean
}

interface FileUploadProps {
  maxFiles?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
  onFilesChange?: (files: FileItem[]) => void
  existingFiles?: FileItem[]
}

export function FileUpload({
  maxFiles = 5,
  maxSize = 10,
  acceptedTypes = ["image/*", "application/pdf", ".doc", ".docx", ".txt"],
  onFilesChange,
  existingFiles = [],
}: FileUploadProps) {
  const [files, setFiles] = useState<FileItem[]>(existingFiles)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-5 w-5" />
    if (type.startsWith("video/")) return <Video className="h-5 w-5" />
    if (type.startsWith("audio/")) return <Music className="h-5 w-5" />
    if (type.includes("pdf")) return <FileText className="h-5 w-5" />
    if (type.includes("zip") || type.includes("rar")) return <Archive className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }

    const fileType = file.type
    const fileName = file.name.toLowerCase()
    const isValidType = acceptedTypes.some((type) => {
      if (type.startsWith(".")) {
        return fileName.endsWith(type)
      }
      if (type.includes("*")) {
        return fileType.startsWith(type.split("*")[0])
      }
      return fileType === type
    })

    if (!isValidType) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(", ")}`
    }

    return null
  }

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      if (files.length + fileList.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`)
        return
      }

      const newFiles: FileItem[] = []
      const errors: string[] = []

      Array.from(fileList).forEach((file) => {
        const error = validateFile(file)
        if (error) {
          errors.push(`${file.name}: ${error}`)
        } else {
          const fileItem: FileItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            uploadProgress: 0,
            uploaded: false,
          }
          newFiles.push(fileItem)
        }
      })

      if (errors.length > 0) {
        alert(errors.join("\n"))
      }

      if (newFiles.length > 0) {
        setFiles((prev) => [...prev, ...newFiles])
        setUploading(true)

        // Simulate file upload
        for (const fileItem of newFiles) {
          await simulateUpload(fileItem)
        }

        setUploading(false)
      }
    },
    [files.length, maxFiles, maxSize, acceptedTypes],
  )

  const simulateUpload = async (fileItem: FileItem) => {
    return new Promise<void>((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 30
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id
                ? {
                    ...f,
                    uploadProgress: 100,
                    uploaded: true,
                    url: `/uploads/${f.name}`, // Mock URL
                  }
                : f,
            ),
          )
          resolve()
        } else {
          setFiles((prev) => prev.map((f) => (f.id === fileItem.id ? { ...f, uploadProgress: progress } : f)))
        }
      }, 200)
    })
  }

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter((f) => f.id !== fileId)
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

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault()
      if (e.target.files && e.target.files[0]) {
        handleFiles(e.target.files)
      }
    },
    [handleFiles],
  )

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Upload className="h-10 w-10 text-gray-400 mb-4" />
          <div className="text-center">
            <p className="text-lg font-medium">Drop files here or click to upload</p>
            <p className="text-sm text-muted-foreground mt-1">
              Maximum {maxFiles} files, up to {maxSize}MB each
            </p>
            <p className="text-xs text-muted-foreground mt-1">Supported: {acceptedTypes.join(", ")}</p>
          </div>
          <input
            type="file"
            multiple
            accept={acceptedTypes.join(",")}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button className="mt-4" variant="outline">
            Choose Files
          </Button>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">
            Uploaded Files ({files.length}/{maxFiles})
          </h4>
          {files.map((file) => (
            <Card key={file.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="text-blue-600">{getFileIcon(file.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      {file.uploaded && <Badge variant="secondary">Uploaded</Badge>}
                      {!file.uploaded && file.uploadProgress !== undefined && (
                        <Badge variant="outline">Uploading...</Badge>
                      )}
                    </div>
                    {!file.uploaded && file.uploadProgress !== undefined && (
                      <Progress value={file.uploadProgress} className="mt-2 h-2" />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {file.uploaded && file.url && (
                    <>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{file.name}</DialogTitle>
                            <DialogDescription>File preview</DialogDescription>
                          </DialogHeader>
                          <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                            {file.type.startsWith("image/") ? (
                              <img
                                src={file.url || "/placeholder.svg"}
                                alt={file.name}
                                className="max-w-full max-h-96 object-contain"
                              />
                            ) : (
                              <div className="text-center">
                                {getFileIcon(file.type)}
                                <p className="mt-2">Preview not available for this file type</p>
                                <Button className="mt-4" asChild>
                                  <a href={file.url} download={file.name}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                  </a>
                                </Button>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={file.url} download={file.name}>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
