export type ProductStatus = 'ACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED'

export interface ProductCategory {
  id: string
  name: string
}

export interface Product {
  id: string
  brand: string
  name: string
  description: string | null
  price: number
  stockQuantity: number
  movementType: string | null
  glassMaterial: string | null
  waterResistance: string | null
  faceSize: string | null
  wireMaterial: string | null
  wireColor: string | null
  caseColor: string | null
  faceColor: string | null
  status: ProductStatus
  updatedAt: string | null
  category: ProductCategory | null
}

export interface ProductImage {
  id: string
  imageUrl: string
  altText: string | null
  isThumbnail: boolean
}

export interface ProductImageUploadPayload {
  file: File
  altText?: string | null
  isThumbnail?: boolean
}

export interface ProductQuery {
  keyword: string
  page: number
  pageSize: number
}

export interface ProductListResponse {
  data: Product[]
  total: number
  page: number
  pageSize: number
}

export interface ProductCreatePayload {
  brand: string
  name: string
  description: string | null
  price: number
  stockQuantity: number
  categoryId: string
  movementType: string | null
  glassMaterial: string | null
  waterResistance: string | null
  faceSize: string | null
  wireMaterial: string | null
  wireColor: string | null
  caseColor: string | null
  faceColor: string | null
}

export interface ProductUpdatePayload extends ProductCreatePayload {
  status: ProductStatus
}

export interface SpringPageResponse<T> {
  content?: T[]
  number?: number
  size?: number
  totalElements?: number
}


