import { useMutation, useQuery } from "@tanstack/react-query";
import { Filter, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { ProductCard } from "@/features/catalog/components/ProductCard";
import { ProductGridSkeleton } from "@/features/catalog/components/ProductGridSkeleton";
import { cartService } from "@/services/cartService";
import { productService } from "@/services/productService";
import { LoginPromptDialog } from "@/shared/components/common/LoginPromptDialog";
import { SectionHeading } from "@/shared/components/common/SectionHeading";
import { EmptyState } from "@/shared/components/states/EmptyState";
import { queryKeys } from "@/shared/constants/queryKeys";
import { useCompareStore } from "@/shared/hooks/useCompareStore";
import { useSession } from "@/shared/hooks/useSession";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";

const pageSize = 9;

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isListView, setIsListView] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const compareAdd = useCompareStore((state) => state.add);
  const { user } = useSession();

  const filters = useMemo(
    () => ({
      keyword: searchParams.get("keyword") ?? "",
      brand: searchParams.get("brand") ?? "",
      category: searchParams.get("category") ?? "",
      movementType: searchParams.get("movement") ?? "",
      waterResistance: searchParams.get("water") ?? "",
      strapMaterial: searchParams.get("strap") ?? "",
      stockOnly: searchParams.get("stockOnly") === "true",
      sortBy: (searchParams.get("sortBy") ?? "latest") as
        | "latest"
        | "price-asc"
        | "price-desc"
        | "best-seller"
        | "top-rated",
      page: Number(searchParams.get("page") ?? "1"),
    }),
    [searchParams],
  );

  const productsQuery = useQuery({
    queryKey: [...queryKeys.products, filters],
    queryFn: () => productService.getAll({ ...filters, pageSize }),
  });

  const filterOptionsQuery = useQuery({
    queryKey: ["product-filter-options"],
    queryFn: productService.getFilters,
  });

  const addCartMutation = useMutation({
    mutationFn: (productId: string) => {
      if (!user) {
        return Promise.reject(new Error("UNAUTH"));
      }
      return cartService.addItem(user.id, productId);
    },
    onSuccess: () => toast.success("Đã thêm vào giỏ hàng."),
    onError: (error) => {
      if (error.message === "UNAUTH") {
        setLoginPromptOpen(true);
        return;
      }
      toast.error(error.message);
    },
  });

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set("page", "1");
    setSearchParams(next);
  };

  const filterPanel = (
    <div className="space-y-4">
      <Input
        value={filters.keyword}
        placeholder="Tìm kiếm theo tên, thương hiệu..."
        onChange={(event) => updateFilter("keyword", event.target.value)}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Select value={filters.brand} onChange={(event) => updateFilter("brand", event.target.value)}>
          <option value="">Tất cả thương hiệu</option>
          {filterOptionsQuery.data?.brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </Select>

        <Select value={filters.category} onChange={(event) => updateFilter("category", event.target.value)}>
          <option value="">Tất cả danh mục</option>
          {filterOptionsQuery.data?.categories.map((category) =>
            category ? (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ) : null,
          )}
        </Select>

        <Select value={filters.movementType} onChange={(event) => updateFilter("movement", event.target.value)}>
          <option value="">Loại máy</option>
          {filterOptionsQuery.data?.movementTypes.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>

        <Select value={filters.waterResistance} onChange={(event) => updateFilter("water", event.target.value)}>
          <option value="">Chống nước</option>
          {filterOptionsQuery.data?.waterResistanceLevels.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>

        <Select value={filters.strapMaterial} onChange={(event) => updateFilter("strap", event.target.value)}>
          <option value="">Chất liệu dây</option>
          {filterOptionsQuery.data?.strapMaterials.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>

        <Select value={filters.sortBy} onChange={(event) => updateFilter("sortBy", event.target.value)}>
          <option value="latest">Mới nhất</option>
          <option value="price-asc">Giá tăng dần</option>
          <option value="price-desc">Giá giảm dần</option>
          <option value="best-seller">Bán chạy</option>
          <option value="top-rated">Đánh giá cao</option>
        </Select>
      </div>
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-10 md:px-6">
      <SectionHeading
        eyebrow="Luxury Shop"
        title="Bộ sưu tập đồng hồ"
        description="Khám phá các mẫu đồng hồ cao cấp theo thương hiệu, phong cách và nhu cầu sử dụng."
      />

      <Card className="border-border/60">
        <CardContent className="space-y-4 p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="hidden flex-1 md:block">{filterPanel}</div>
            <div className="flex items-center gap-2 md:hidden">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Bộ lọc
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bộ lọc sản phẩm</DialogTitle>
                  </DialogHeader>
                  {filterPanel}
                </DialogContent>
              </Dialog>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button
                variant={isListView ? "outline" : "default"}
                size="icon"
                onClick={() => setIsListView(false)}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={isListView ? "default" : "outline"}
                size="icon"
                onClick={() => setIsListView(true)}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button variant="ghost" onClick={() => setSearchParams(new URLSearchParams())}>
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {productsQuery.isLoading ? (
        <ProductGridSkeleton count={9} />
      ) : productsQuery.data && productsQuery.data.items.length > 0 ? (
        <>
          <div
            className={
              isListView
                ? "space-y-3"
                : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            }
          >
            {productsQuery.data.items.map((product) => (
              <div key={product.id} className={isListView ? "max-w-none" : ""}>
                <ProductCard
                  product={product}
                  onAddToCart={(id) => addCartMutation.mutate(id)}
                  onCompare={(id) => {
                    compareAdd(id);
                    toast.success("Đã thêm vào so sánh.");
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border/60 p-4">
            <p className="text-sm text-muted-foreground">
              Trang {productsQuery.data.page}/{productsQuery.data.totalPages} - {productsQuery.data.total} sản phẩm
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={productsQuery.data.page <= 1}
                onClick={() => updateFilter("page", String(productsQuery.data!.page - 1))}
              >
                Trang trước
              </Button>
              <Button
                variant="outline"
                disabled={productsQuery.data.page >= productsQuery.data.totalPages}
                onClick={() => updateFilter("page", String(productsQuery.data!.page + 1))}
              >
                Trang sau
              </Button>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          title="Không tìm thấy sản phẩm phù hợp"
          description="Bạn có thể thử nới lỏng bộ lọc hoặc dùng từ khóa khác."
          actionLabel="Xóa bộ lọc"
          onAction={() => setSearchParams(new URLSearchParams())}
        />
      )}

      <LoginPromptDialog open={loginPromptOpen} onOpenChange={setLoginPromptOpen} />
    </section>
  );
};
