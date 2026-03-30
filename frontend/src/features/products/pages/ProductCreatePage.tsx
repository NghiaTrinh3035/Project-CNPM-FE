import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { createProduct, getCategories } from '@/features/products/api/productService'
import { ProductForm } from '@/features/products/components/ProductForm'
import { ProductImageManager } from '@/features/products/components/ProductImageManager'
import type { ProductFormValues } from '@/features/products/schemas/productSchema'
import type { ProductCategory, ProductCreatePayload } from '@/features/products/types/product'
import { ROUTES } from '@/routes/paths'

function toNullable(value: string): string | null {
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function mapPayload(values: ProductFormValues): ProductCreatePayload {
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
  }
}

export function ProductCreatePage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [createdProductId, setCreatedProductId] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await getCategories()
        setCategories(response)
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : 'Không thể tải danh mục sản phẩm.')
      } finally {
        setLoading(false)
      }
    }

    void fetchCategories()
  }, [])

  const handleSubmit = async (values: ProductFormValues) => {
    setSubmitError(null)
    try {
      const created = await createProduct(mapPayload(values))
      setCreatedProductId(created.id)
      window.alert('Thêm sản phẩm thành công')
    } catch (nextError) {
      setSubmitError(nextError instanceof Error ? nextError.message : 'Không thể tạo sản phẩm. Vui lòng thử lại.')
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

      <h1 className="text-[32px] font-bold leading-tight text-slate-900">Thêm sản phẩm mới</h1>
      <p className="mt-1 text-sm text-slate-500">Điền thông tin theo contract tạo mới từ backend</p>

      <div className="mt-5 rounded-xl border border-app-border bg-white p-5">
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} />}
        {!loading && !error && (
          <>
            <ProductForm
              categories={categories}
              mode="create"
              onCancel={() => navigate(ROUTES.products)}
              onSubmit={handleSubmit}
              submitError={submitError}
            />
            {createdProductId && <ProductImageManager productId={createdProductId} />}
          </>
        )}
      </div>
    </div>
  )
}

