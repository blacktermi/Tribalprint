import type { CreateOrderRequest, CreateOrderResponse, Settings, DeliveryData, Catalog } from './types'

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
}

export function isApiConfigured(): boolean {
  return Boolean(BASE_URL)
}
