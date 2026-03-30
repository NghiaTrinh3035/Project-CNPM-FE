import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { getCategories, getProductById, updateProduct } from '@/features/products/api/productService'
import { ProductForm } from '@/features/products/components/ProductForm'
import { ProductImageManager } from '@/features/products/components/ProductImageManager'
import type { ProductFormValues } from '@/features/products/schemas/productSchema'
import type { ProductCategory, ProductUpdatePayload } from '@/features/products/types/product'
import { ROUTES } from '@/routes/paths'

function toNullable(value: string): string | null {
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function mapPayload(values: ProductFormValues): ProductUpdatePayload {
  return {
    brand: values.brand.trim(),
    name: values.name.trim(),
    description: toNullable(values.description),
    price: values.price,
    stockQuantity: values.stockQuantity,
    categoryId: values.categoryId,
    movementType: toNullable(values.movementType),
    glassMaterial: toNullable(values.glassMaterial),
    waterResistance: toNullable(values.waterResistance),
    faceSize: toNullable(values.faceSize),
    wireMaterial: toNullable(values.wireMaterial),
    wireColor: toNullable(values.wireColor),
    caseColor: toNullable(values.caseColor),
    faceColor: toNullable(values.faceColor),
    status: values.status,
  }
}

export function ProductUpdatePage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [initialValues, setInitialValues] = useState<ProductFormValues | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Không tìm thấy mã sản phẩm cần cập nhật.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const [categoriesResponse, product] = await Promise.all([getCategories(), getProductById(id)])
        setCategories(categoriesResponse)
        setInitialValues({
          brand: product.brand,
          name: product.name,
          description: product.description ?? '',
          price: product.price,
          stockQuantity: product.stockQuantity,
          categoryId: product.category?.id ?? '',
          movementType: product.movementType ?? '',
          glassMaterial: product.glassMaterial ?? '',
          waterResistance: product.waterResistance ?? '',
          faceSize: product.faceSize ?? '',
          wireMaterial: product.wireMaterial ?? '',
          wireColor: product.wireColor ?? '',
          caseColor: product.caseColor ?? '',
          faceColor: product.faceColor ?? '',
          status: product.status,
        })
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : 'Không thể tải thông tin sản phẩm.')
      } finally {
        setLoading(false)
      }
    }

    void fetchData()
  }, [id])

  const handleSubmit = async (values: ProductFormValues) => {
    if (!id) {
      throw new Error('Không tìm thấy mã sản phẩm cần cập nhật.')
    }

    setSubmitError(null)
    try {
      await updateProduct(id, mapPayload(values))
      window.alert('Cập nhật sản phẩm thành công')
      navigate(ROUTES.products)
    } catch (nextError) {
      setSubmitError(nextError instanceof Error ? nextError.message : 'Không thể cập nhật sản phẩm. Vui lòng thử lại.')
    }
  }

  return (
    <div>
      <button
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-700"
        onClick={() => navigate(-1)}
        type="button"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </button>

      <h1 className="text-[32px] font-bold leading-tight text-slate-900">Cập nhật sản phẩm</h1>
      <p className="mt-1 text-sm text-slate-500">Chỉnh sửa thông tin theo contract cập nhật từ backend</p>

      <div className="mt-5 rounded-xl border border-app-border bg-white p-5">
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} />}
        {!loading && !error && initialValues && (
          <>
            <ProductForm
              categories={categories}
              initialValues={initialValues}
              mode="update"
              onCancel={() => navigate(ROUTES.products)}
              onSubmit={handleSubmit}
              submitError={submitError}
            />
            {id && <ProductImageManager productId={id} />}
          </>
        )}
      </div>
    </div>
  )
}

