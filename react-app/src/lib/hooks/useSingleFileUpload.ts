import { useCallback, useState } from 'react'
import { api, isApiConfigured } from '../api/client'
import type { OrderUpload } from '../api/types'
import { normalizeUpload } from '../uploads'

export function useSingleFileUpload() {
  const [file, setFileState] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadResult, setUploadResult] = useState<OrderUpload | null>(null)

  const uploadFile = useCallback(async (next: File) => {
    if (!isApiConfigured()) return null
    setUploading(true)
    try {
      const response = await api.uploadFile(next)
      const normalized = normalizeUpload(next, response)
      setUploadResult(normalized)
      setUploadError(null)
      return normalized
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload échoué'
      setUploadError(message)
      setUploadResult(null)
      throw error
    } finally {
      setUploading(false)
    }
  }, [])

  const setFile = useCallback((next: File | null) => {
    setFileState(next)
    setUploadError(null)
    if (!next) {
      setUploadResult(null)
      return
    }
    // L’upload est déclenché uniquement si l’API est configurée.
    if (!isApiConfigured()) {
      setUploadResult(null)
      return
    }
    void uploadFile(next)
  }, [uploadFile])

  const ensureUploaded = useCallback(async () => {
    if (!file || !isApiConfigured()) return null
    if (uploadResult?.url) return uploadResult
    try {
      return await uploadFile(file)
    } catch {
      return null
    }
  }, [file, uploadResult, uploadFile])

  return {
    file,
    setFile,
    uploading,
    uploadError,
    uploadResult,
    ensureUploaded,
  }
}
