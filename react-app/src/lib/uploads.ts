import type { OrderUpload } from './api/types'

export function makeFileKey(file: File): string {
  return `${file.name}|${file.size}|${file.lastModified}`
}

export function normalizeUpload(file: File, response: OrderUpload): OrderUpload {
  return {
    original_name: response.original_name ?? file.name,
    mime_type: response.mime_type ?? file.type,
    url: response.url,
    item_index: response.item_index,
  }
}
