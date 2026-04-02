import { useCallback, useEffect, useState } from "react";

import { productService } from "@/services/productService";
import type { ProductImage } from "@/shared/types/domain";

export const useProductImages = (productId: string | undefined) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadImages = useCallback(async () => {
    if (!productId) {
      setImages([]);
      setLoading(false);
      setError("Không tìm thấy sản phẩm để quản lý ảnh.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProductImages(productId);
      setImages(data);
    } catch (nextError) {
      setImages([]);
      setError(nextError instanceof Error ? nextError.message : "Không thể tải danh sách ảnh sản phẩm.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void loadImages();
  }, [loadImages]);

  const onUpload = useCallback(
    async (file: File, altText: string, isPrimary: boolean) => {
      if (!productId) {
        throw new Error("Không tìm thấy sản phẩm để upload ảnh.");
      }
      await productService.uploadProductImage(productId, { file, altText, isPrimary });
      await loadImages();
    },
    [loadImages, productId],
  );

  const onDelete = useCallback(
    async (imageId: string) => {
      if (!productId) {
        throw new Error("Không tìm thấy sản phẩm để xóa ảnh.");
      }
      await productService.deleteProductImage(productId, imageId);
      setImages((current) => current.filter((item) => item.id !== imageId));
    },
    [productId],
  );

  const onReplace = useCallback(
    async (image: ProductImage, file: File) => {
      if (!productId) {
        throw new Error("Không tìm thấy sản phẩm để cập nhật ảnh.");
      }
      await productService.uploadProductImage(productId, {
        file,
        altText: image.alt,
        isPrimary: image.isPrimary,
      });
      await productService.deleteProductImage(productId, image.id);
      await loadImages();
    },
    [loadImages, productId],
  );

  return {
    images,
    loading,
    error,
    reload: loadImages,
    onUpload,
    onDelete,
    onReplace,
  };
};

