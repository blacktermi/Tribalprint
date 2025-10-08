import { useCallback, useMemo, useState } from 'react'
import { api, isApiConfigured } from '../api/client'
import type { OrderUpload } from '../api/types'
import { makeFileKey, normalizeUpload } from '../uploads'

type UploadState = {
  file: File
  uploading: boolean
  error: string | null
  result: OrderUpload | null
}

type UploadMap = Record<string, UploadState>

export function useMultiFileUpload() {
  const [uploads, setUploads] = useState<UploadMap>({})
  const [lastError, setLastError] = useState<string | null>(null)

  const uploadFile = useCallback(async (file: File): Promise<OrderUpload | null> => {
    if (!isApiConfigured()) return null
    const key = makeFileKey(file)
    setUploads(prev => {
      const current = prev[key]
      if (current) {
        return { ...prev, [key]: { ...current, uploading: true, error: null } }
      }
      return { ...prev, [key]: { file, uploading: true, error: null, result: null } }
    })
    try {
      const response = await api.uploadFile(file)
      const normalized = normalizeUpload(file, response)
      setUploads(prev => {
        const current = prev[key]
        const base: UploadState = current ?? { file, uploading: false, error: null, result: null }
        return { ...prev, [key]: { ...base, uploading: false, error: null, result: normalized } }
      })
      setLastError(null)
      return normalized
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload échoué'
      setUploads(prev => {
        const current = prev[key]
        const base: UploadState = current ?? { file, uploading: false, error: null, result: null }
        return { ...prev, [key]: { ...base, uploading: false, error: message, result: null } }
      })
      setLastError(message)
      return null
    }
  }, [])

  const registerFiles = useCallback((files: File[]) => {
    if (!files.length || !isApiConfigured()) {
      return
    }
    setLastError(null)
    files.forEach((file) => {
      const key = makeFileKey(file)
      setUploads(prev => {
        if (prev[key]) return prev
        return { ...prev, [key]: { file, uploading: true, error: null, result: null } }
      })
      void uploadFile(file)
    })
  }, [uploadFile])

  const unregisterFile = useCallback((file: File) => {
    const key = makeFileKey(file)
    setUploads(prev => {
      if (!(key in prev)) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setUploads({})
    setLastError(null)
  }, [])

  const ensureUploaded = useCallback(async (files: File[]) => {
    const result = new Map<string, OrderUpload>()
    if (!isApiConfigured() || files.length === 0) {
      return result
    }
    for (const file of files) {
      const key = makeFileKey(file)
      const state = uploads[key]
      if (state?.result?.url) {
        result.set(key, state.result)
        continue
      }
      const uploaded = await uploadFile(file)
      if (uploaded) {
        result.set(key, uploaded)
      }
    }
    return result
  }, [uploadFile, uploads])

  const getUploadFor = useCallback((file: File): OrderUpload | null => {
    const key = makeFileKey(file)
    return uploads[key]?.result ?? null
  }, [uploads])

  const getErrorFor = useCallback((file: File): string | null => {
    const key = makeFileKey(file)
    return uploads[key]?.error ?? null
  }, [uploads])

  const uploading = useMemo(() => Object.values(uploads).some(u => u.uploading), [uploads])

  return {
    registerFiles,
    unregisterFile,
    reset,
    ensureUploaded,
    getUploadFor,
    getErrorFor,
    uploading,
    lastError,
  }
}
