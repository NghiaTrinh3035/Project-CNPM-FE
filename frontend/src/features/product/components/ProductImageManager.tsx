import { ImagePlus, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { useProductImages } from "@/features/product/hooks/useProductImages";
import type { ProductImage } from "@/shared/types/domain";
import { EmptyState } from "@/shared/components/states/EmptyState";
import { ErrorState } from "@/shared/components/states/ErrorState";
import { LoadingState } from "@/shared/components/states/LoadingState";
import { ConfirmDialog } from "@/shared/components/common/ConfirmDialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

interface ProductImageManagerProps {
  productId: string;
}

export const ProductImageManager = ({ productId }: ProductImageManagerProps) => {
  const { images, loading, error, reload, onUpload, onDelete, onReplace } = useProductImages(productId);
  const [altText, setAltText] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [pendingDeleteImage, setPendingDeleteImage] = useState<ProductImage | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      setActionError(null);
      await onUpload(file, altText, isPrimary);
      setAltText("");
      setIsPrimary(false);
      if (uploadInputRef.current) {
        uploadInputRef.current.value = "";
      }
      toast.success("Upload ảnh thành công.");
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Không thể upload ảnh sản phẩm.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image: ProductImage) => {
    try {
      setActiveImageId(image.id);
      setActionError(null);
      await onDelete(image.id);
      toast.success("Đã xóa ảnh sản phẩm.");
      setPendingDeleteImage(null);
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Không thể xóa ảnh sản phẩm.");
    } finally {
      setActiveImageId(null);
    }
  };

  const handleReplace = async (image: ProductImage, file: File) => {
    try {
      setActiveImageId(image.id);
      setActionError(null);
      await onReplace(image, file);
      toast.success("Đã cập nhật ảnh sản phẩm.");
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "Không thể cập nhật ảnh sản phẩm.");
    } finally {
      setActiveImageId(null);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-border/60 p-4">
      <div>
        <h3 className="text-base font-semibold">Hình ảnh sản phẩm</h3>
        <p className="text-sm text-muted-foreground">Upload, thay thế hoặc xóa ảnh như màn quản trị ở FE cũ.</p>
      </div>

      <div className="space-y-3 rounded-lg border border-border/60 bg-accent/20 p-3">
        <Input placeholder="Mô tả ảnh (alt text)" value={altText} onChange={(event) => setAltText(event.target.value)} />
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={isPrimary} onChange={(event) => setIsPrimary(event.target.checked)} />
          Đặt làm ảnh đại diện
        </label>
        <input
          ref={uploadInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleUpload(file);
            }
          }}
        />
        <Button variant="outline" onClick={() => uploadInputRef.current?.click()} disabled={uploading}>
          {uploading ? <Upload className="mr-2 h-4 w-4 animate-pulse" /> : <ImagePlus className="mr-2 h-4 w-4" />}
          {uploading ? "Đang upload..." : "Upload ảnh mới"}
        </Button>
      </div>

      {loading ? <LoadingState text="Đang tải danh sách ảnh..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={reload} /> : null}
      {actionError ? <ErrorState message={actionError} /> : null}

      {!loading && !error && images.length === 0 ? (
        <EmptyState title="Chưa có ảnh sản phẩm" description="Hãy upload ảnh đầu tiên cho sản phẩm này." />
      ) : null}

      {!loading && !error && images.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => {
            const busy = activeImageId === image.id;
            return (
              <div key={image.id} className="space-y-2 rounded-lg border border-border/60 p-2">
                <img src={image.url} alt={image.alt || "product image"} className="h-36 w-full rounded-md object-cover" />
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate text-muted-foreground">{image.alt || "--"}</span>
                  {image.isPrimary ? <Badge variant="success">Ảnh đại diện</Badge> : null}
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-accent">
                    <Upload className="mr-1 h-3 w-3" />
                    Thay ảnh
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={busy}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          void handleReplace(image, file);
                        }
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                  <Button size="icon" variant="danger" disabled={busy} onClick={() => setPendingDeleteImage(image)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDeleteImage)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteImage(null);
          }
        }}
        title="Xác nhận xóa ảnh"
        description="Bạn có chắc chắn muốn xóa ảnh sản phẩm này không?"
        confirmText="Xóa ảnh"
        loading={Boolean(pendingDeleteImage && activeImageId === pendingDeleteImage.id)}
        onConfirm={() => {
          if (pendingDeleteImage) {
            void handleDelete(pendingDeleteImage);
          }
        }}
      />
    </div>
  );
};

