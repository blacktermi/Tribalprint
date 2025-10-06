// Types de l’API Tribal Ops (v1)

export interface Settings {
  waveUrl: string
  socialLinks: Record<string, string>
  legalPages: Array<{ slug: string; title: string }>
  cutoff: string // HH:mm
  windows: Array<string> // ex: ["10h–13h","14h–18h"]
}

export interface DeliveryData {
  zones: Array<{ id: number; label: string; fee: number }>
  communes: Array<{ name: string; zoneId: number }>
  next: { iso: string; window: string; label?: string }
}

export interface CatalogProductFormat {
  code: string
  label: string
  widthCm?: number
  heightCm?: number
  basePrice?: number
}

export interface CatalogProduct {
  slug: string
  label: string
  coverUrl?: string
  formats?: CatalogProductFormat[]
  constraints?: Record<string, unknown>
}

export interface Catalog {
  products: CatalogProduct[]
}

export interface OrderContact {
  name: string
  phone: string
  email?: string
}

export interface OrderDelivery {
  zone: number
  commune: string
  date: string // ISO
  window: string
}

export interface OrderItem {
  product_slug: string
  product_label: string
  quantity: number
  unit_price: number
  options?: Record<string, unknown>
}

export interface OrderUpload {
  url?: string
  mime_type?: string
  original_name?: string
  item_index?: number
}

export interface OrderPricing {
  subtotal: number
  discount: number
  delivery_fee: number
  total: number
}

export interface CreateOrderRequest {
  contact: OrderContact
  delivery: OrderDelivery
  items: OrderItem[]
  uploads?: OrderUpload[]
  pricing: OrderPricing
}

export interface CreateOrderResponse {
  order_id: string
  ref: string
  status: 'pending' | 'confirmed' | 'draft'
  acompte?: number
}
