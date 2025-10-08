import type { CreateOrderRequest, CreateOrderResponse, Settings, DeliveryData, Catalog, OrderUpload } from './types'

const BASE_URL = import.meta.env.VITE_TRIBAL_OPS_API || ''

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${text || res.statusText}`)
  }
  return (await res.json()) as T
}

export const api = {
  getSettings: () => http<Settings>('/v1/settings'),
  getDelivery: () => http<DeliveryData>('/v1/delivery'),
  getCatalog: () => http<Catalog>('/v1/catalog'),
  createOrder: (body: CreateOrderRequest) => http<CreateOrderResponse>('/v1/orders', { method: 'POST', body: JSON.stringify(body) }),
  uploadFile: async (file: File): Promise<OrderUpload> => {
    if (!BASE_URL) throw new Error('API non configurée')
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${BASE_URL}/v1/uploads`, { method: 'POST', body: form })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Upload ${res.status}: ${text || res.statusText}`)
    }
    return (await res.json()) as OrderUpload
  },
}

export function isApiConfigured(): boolean {
  return Boolean(BASE_URL)
}
