import { axiosClient } from '@/lib/axiosClient'
import { parseApiErrorMessage } from '@/lib/apiError'
import type {
  Product,
  ProductCategory,
  ProductImage,
  ProductImageUploadPayload,
  ProductCreatePayload,
  ProductListResponse,
  ProductQuery,
  ProductUpdatePayload,
  SpringPageResponse,
} from '@/features/products/types/product'

function normalizeNullableText(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function normalizeProduct(input: Product): Product {
  return {
    ...input,
    category: input.category
      ? {
          id: input.category.id,
          name: input.category.name,
        }
      : null,
    description: normalizeNullableText(input.description),
    movementType: normalizeNullableText(input.movementType),
    glassMaterial: normalizeNullableText(input.glassMaterial),
    waterResistance: normalizeNullableText(input.waterResistance),
    faceSize: normalizeNullableText(input.faceSize),
    wireMaterial: normalizeNullableText(input.wireMaterial),
    wireColor: normalizeNullableText(input.wireColor),
    caseColor: normalizeNullableText(input.caseColor),
    faceColor: normalizeNullableText(input.faceColor),
    updatedAt: input.updatedAt ?? null,
  }
}

export async function getCategories(): Promise<ProductCategory[]> {
  try {
    const { data } = await axiosClient.get<ProductCategory[]>('/categories')
    return Array.isArray(data) ? data : []
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể tải danh mục sản phẩm. Vui lòng thử lại.'))
  }
}

export async function getProductList(query: ProductQuery): Promise<ProductListResponse> {
  const normalizedKeyword = query.keyword.trim()
  const page = Math.max(query.page - 1, 0)

  try {
    const { data } = await axiosClient.get<SpringPageResponse<Product>>('/products/search', {
      params: {
        page,
        size: query.pageSize,
        ...(normalizedKeyword ? { name: normalizedKeyword } : {}),
      },
    })

    const content = Array.isArray(data.content) ? data.content.map(normalizeProduct) : []

    return {
      data: content,
      total: typeof data.totalElements === 'number' ? data.totalElements : 0,
      page: typeof data.number === 'number' ? data.number + 1 : 1,
      pageSize: typeof data.size === 'number' ? data.size : query.pageSize,
    }
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể tải danh sách sản phẩm. Vui lòng thử lại.'))
  }
}

export async function getProductById(id: string): Promise<Product> {
  try {
    const { data } = await axiosClient.get<Product>(`/products/${id}`)
    return normalizeProduct(data)
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể tải chi tiết sản phẩm. Vui lòng thử lại.'))
  }
}

export async function createProduct(payload: ProductCreatePayload): Promise<Product> {
  try {
    const { data } = await axiosClient.post<Product>('/products', payload)
    return normalizeProduct(data)
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể tạo sản phẩm. Vui lòng thử lại.'))
  }
}

export async function updateProduct(id: string, payload: ProductUpdatePayload): Promise<Product> {
  try {
    const { data } = await axiosClient.put<Product>(`/products/${id}`, payload)
    return normalizeProduct(data)
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể cập nhật sản phẩm. Vui lòng thử lại.'))
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    await axiosClient.delete(`/products/${id}`)
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể xóa sản phẩm. Vui lòng thử lại.'))
  }
}

function normalizeProductImage(input: ProductImage): ProductImage {
  return {
    id: input.id,
    imageUrl: input.imageUrl,
    altText: normalizeNullableText(input.altText),
    isThumbnail: Boolean(input.isThumbnail),
  }
}

export async function getProductImages(productId: string): Promise<ProductImage[]> {
  try {
    const { data } = await axiosClient.get<ProductImage[]>(`/products/${productId}/images`)
    return Array.isArray(data) ? data.map(normalizeProductImage) : []
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể tải danh sách ảnh sản phẩm. Vui lòng thử lại.'))
  }
}

export async function uploadProductImage(productId: string, payload: ProductImageUploadPayload): Promise<ProductImage> {
  const formData = new FormData()
  formData.append('file', payload.file)
  if (typeof payload.altText === 'string') {
    const normalizedAltText = payload.altText.trim()
    if (normalizedAltText.length > 0) {
      formData.append('altText', normalizedAltText)
    }
  }
  formData.append('isThumbnail', String(Boolean(payload.isThumbnail)))

  try {
    const { data } = await axiosClient.post<ProductImage>(`/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return normalizeProductImage(data)
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể upload ảnh sản phẩm. Vui lòng thử lại.'))
  }
}

export async function deleteProductImage(productId: string, imageId: string): Promise<void> {
  try {
    await axiosClient.delete(`/products/${productId}/images/${imageId}`)
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể xóa ảnh sản phẩm. Vui lòng thử lại.'))
  }
}

