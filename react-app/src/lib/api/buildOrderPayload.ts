import type { CreateOrderRequest } from './types'

export function buildOrderPayload(input: {
  contact: { name: string; phone: string; email?: string }
  delivery: { zone: number; commune: string; date: string; window: string }
  items: Array<{ product_slug: string; product_label: string; quantity: number; unit_price: number; options?: Record<string, unknown> }>
  uploads?: Array<{ url?: string; mime_type?: string; original_name?: string; item_index?: number }>
  pricing: { subtotal: number; discount: number; delivery_fee: number; total: number }
}): CreateOrderRequest {
  return {
    contact: input.contact,
    delivery: input.delivery,
    items: input.items,
    uploads: input.uploads,
    pricing: input.pricing,
  }
}
