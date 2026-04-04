import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquareMore, Scale, ShieldCheck, ShoppingBag, Star } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { cartService } from "@/services/cartService";
import { discussionService } from "@/services/discussionService";
import { productService } from "@/services/productService";
import { reviewService } from "@/services/reviewService";
import { LoginPromptDialog } from "@/shared/components/common/LoginPromptDialog";
import { EmptyState } from "@/shared/components/states/EmptyState";
import { ErrorState } from "@/shared/components/states/ErrorState";
import { LoadingState } from "@/shared/components/states/LoadingState";
import { useAverageRatings } from "@/shared/hooks/useAverageRatings";
import { toCurrency, toShortDate } from "@/shared/lib/format";
import { useCompareStore } from "@/shared/hooks/useCompareStore";
import { useSession } from "@/shared/hooks/useSession";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Textarea } from "@/shared/ui/textarea";


const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Vui lòng nhập tối thiểu 10 ký tự."),
});

const discussionSchema = z.object({
  content: z.string().min(4, "Nội dung quá ngắn."),
});


type ReviewFormValues = z.infer<typeof reviewSchema>;
type DiscussionFormValues = z.infer<typeof discussionSchema>;

export const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const compareAdd = useCompareStore((state) => state.add);
  const discussionLoadMoreRef = useRef<HTMLDivElement | null>(null);

  const productQuery = useQuery({
    queryKey: ["product-detail", productId],
    queryFn: () => (productId ? productService.getById(productId) : Promise.resolve(null)),
    enabled: Boolean(productId),
  });

  const reviewsQuery = useQuery({
    queryKey: ["reviews", productQuery.data?.id],
    queryFn: () =>
      productQuery.data ? reviewService.listByProduct(productQuery.data.id) : Promise.resolve([]),
    enabled: Boolean(productQuery.data?.id),
  });

  const discussionsQuery = useInfiniteQuery({
    queryKey: ["discussions", productQuery.data?.id],
    queryFn: ({ pageParam }) => {
      const currentPage = typeof pageParam === "number" ? pageParam : 1;
      return productQuery.data
        ? discussionService.listByProduct(productQuery.data.id, { page: currentPage, pageSize: 10 })
        : Promise.resolve({ items: [], page: 1, pageSize: 10, total: 0, totalPages: 0 });
    },
    enabled: Boolean(productQuery.data?.id),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });

  const discussionItems = useMemo(
    () => discussionsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [discussionsQuery.data],
  );
  const {
    hasNextPage: hasNextDiscussionPage,
    isFetchingNextPage: isFetchingNextDiscussionPage,
    isLoading: isDiscussionLoading,
    fetchNextPage: fetchNextDiscussionPage,
  } = discussionsQuery;

  useEffect(() => {
    const target = discussionLoadMoreRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);
        if (
          isVisible &&
          hasNextDiscussionPage &&
          !isFetchingNextDiscussionPage &&
          !isDiscussionLoading
        ) {
          fetchNextDiscussionPage();
        }
      },
      { rootMargin: "120px 0px 120px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [
    fetchNextDiscussionPage,
    hasNextDiscussionPage,
    isFetchingNextDiscussionPage,
    isDiscussionLoading,
  ]);

  const relatedQuery = useQuery({
    queryKey: ["related", productQuery.data?.id],
    queryFn: () => productService.getByIds(productQuery.data?.relatedProducts ?? []),
    enabled: Boolean(productQuery.data?.relatedProducts?.length ?? 0),
  });

  const averageRatingsQuery = useAverageRatings(productQuery.data?.id ? [productQuery.data.id] : []);
  const relatedAverageRatingsQuery = useAverageRatings(relatedQuery.data?.map((item) => item.id) ?? []);

  const addCartMutation = useMutation({
    mutationFn: () => {
      if (!user || !productQuery.data) {
        return Promise.reject(new Error("UNAUTH"));
      }
      return cartService.addItem(user.id, productQuery.data.id);
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

  const reviewForm = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (values: ReviewFormValues) => {
      if (!user || !productQuery.data) {
        return Promise.reject(new Error("UNAUTH"));
      }
      return reviewService.create({
        customerId: user.id,
        productId: productQuery.data.id,
        ...values,
      });
    },
    onSuccess: () => {
      toast.success("Cảm ơn bạn đã gửi đánh giá.");
      reviewForm.reset({ rating: 0, comment: "" });
      queryClient.invalidateQueries({ queryKey: ["reviews", productQuery.data?.id] });
    },
    onError: (error) => {
      if (error.message === "UNAUTH") {
        setLoginPromptOpen(true);
        return;
      }
      toast.error(error.message);
    },
  });

  const discussionForm = useForm<DiscussionFormValues>({
    resolver: zodResolver(discussionSchema),
    defaultValues: { content: "" },
  });

  const discussionMutation = useMutation({
    mutationFn: (values: DiscussionFormValues) => {
      if (!user || !productQuery.data) {
        return Promise.reject(new Error("UNAUTH"));
      }
      return discussionService.create({
        content: values.content,
        productId: productQuery.data.id,
      });
    },
    onSuccess: () => {
      discussionForm.reset({ content: "" });
      queryClient.invalidateQueries({ queryKey: ["discussions", productQuery.data?.id] });
      toast.success("Đã gửi bình luận.");
    },
    onError: (error) => {
      if (error.message === "UNAUTH") {
        setLoginPromptOpen(true);
        return;
      }
      toast.error(error.message);
    },
  });

  const product = productQuery.data;

  const activeImage = useMemo(() => product?.images[activeImageIndex], [product, activeImageIndex]);
  const displayRating = product
    ? averageRatingsQuery.data?.[product.id] ?? product.averageRating ?? product.rating ?? 0
    : 0;
  const displayReviewCount = reviewsQuery.data?.length ?? product?.reviewCount ?? 0;
  const detailSpecs = useMemo(() => {
    if (!product) {
      return [] as Array<{ label: string; value: string }>;
    }

    return [
      ...(product.specs ?? []),
      {
        label: "Danh mục",
        value: (product.categories?.map((category) => category.name).filter(Boolean).join(", ") || product.category?.name || "-") as string,
      },
      { label: "Kích thước mặt", value: product.faceSize ?? "-" },
      { label: "Chất liệu dây", value: product.strapMaterial ?? product.wireMaterial ?? "-" },
      { label: "Màu dây", value: product.strapColor ?? product.wireColor ?? "-" },
      { label: "Màu vỏ", value: product.caseColor ?? "-" },
      { label: "Màu mặt", value: product.faceColor ?? "-" },
      { label: "Màu sắc", value: product.color ?? "-" },
      { label: "Size", value: product.size ?? "-" },
    ];
  }, [product]);
  const relatedProducts = (relatedQuery.data ?? []).map((item) => {
    const relatedRating = relatedAverageRatingsQuery.data?.[item.id];
    if (relatedRating === undefined) {
      return item;
    }

    return {
      ...item,
      averageRating: relatedRating,
      rating: relatedRating,
    };
  });

  if (productQuery.isLoading) {
    return <LoadingState text="Đang tải chi tiết sản phẩm..." />;
  }

  if (productQuery.isError) {
    return <ErrorState message="Không thể tải sản phẩm. Vui lòng thử lại sau." onRetry={productQuery.refetch} />;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14">
        <EmptyState
          title="Không tìm thấy sản phẩm"
          description="Sản phẩm có thể đã ngừng kinh doanh hoặc đường dẫn không hợp lệ."
          actionLabel="Quay về cửa hàng"
          onAction={() => navigate("/shop")}
        />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-6">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          <button
            type="button"
            className="overflow-hidden rounded-3xl border border-border/60"
            onClick={() => setZoomOpen(true)}
          >
            <img
              src={activeImage?.url}
              alt={activeImage?.alt ?? product.name}
              className="h-[500px] w-full object-cover transition duration-500 hover:scale-105"
            />
          </button>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                className={`overflow-hidden rounded-xl border ${
                  index === activeImageIndex ? "border-luxury-gold" : "border-border/60"
                }`}
                onClick={() => setActiveImageIndex(index)}
              >
                <img src={image.url} alt={image.alt} className="h-20 w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.25em] text-luxury-gold">{product.brand}</p>
          <h1 className="font-display text-3xl">{product.name}</h1>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-luxury-gold text-luxury-gold" />
            <p className="text-sm">
              {displayRating > 0 ? `${displayRating.toFixed(1)} (${displayReviewCount} đánh giá)` : "Chưa có đánh giá"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-2xl font-semibold text-luxury-gold">
              {toCurrency(product.salePrice ?? product.price)}
            </p>
            {product.salePrice ? (
              <p className="text-sm text-muted-foreground line-through">{toCurrency(product.price)}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant={product.stockQuantity > 0 ? "success" : "danger"}>
              {product.stockQuantity > 0 ? `Còn hàng: ${product.stockQuantity}` : "Hết hàng"}
            </Badge>
            <Badge variant="outline">{product.movementType}</Badge>
            <Badge variant="outline">{product.waterResistance}</Badge>
          </div>

          <p className="text-sm text-muted-foreground">{product.description}</p>

          <div className="flex flex-wrap gap-3">
            <Button variant="luxury" onClick={() => addCartMutation.mutate()} disabled={product.stockQuantity <= 0}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Thêm vào giỏ
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                await addCartMutation.mutateAsync();
                navigate("/checkout");
              }}
              disabled={product.stockQuantity <= 0}
            >
              Mua ngay
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                compareAdd(product.id);
                toast.success("Đã thêm sản phẩm vào so sánh.");
              }}
            >
              <Scale className="mr-2 h-4 w-4" />
              So sánh
            </Button>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/40 p-4 text-sm">
            <p className="font-medium">Liên hệ tư vấn trực tiếp</p>
            <div className="mt-2 flex gap-2">
              <Button variant="outline" asChild>
                <a href="https://facebook.com" target="_blank" rel="noreferrer">
                  Facebook
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://zalo.me" target="_blank" rel="noreferrer">
                  Zalo
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="description">
        <TabsList>
          <TabsTrigger value="description">Mô tả</TabsTrigger>
          <TabsTrigger value="specs">Thông số</TabsTrigger>
          <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
          <TabsTrigger value="discussion">Thảo luận</TabsTrigger>
          <TabsTrigger value="warranty">Bảo hành</TabsTrigger>
        </TabsList>

        <TabsContent value="description">
          <Card>
            <CardContent className="space-y-4 p-6">
              <p className="text-muted-foreground">{product.description}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(product.tags ?? []).map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specs">
          <Card>
            <CardContent className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
              {detailSpecs.map((spec) => (
                <div key={spec.label} className="rounded-lg border border-border/60 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{spec.label}</p>
                  <p className="mt-1 font-medium">{spec.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardContent className="space-y-6 p-6">
              <form
                className="grid gap-3 rounded-2xl border border-border/60 p-4"
                onSubmit={reviewForm.handleSubmit((values) => reviewMutation.mutate(values))}
              >
                <p className="font-medium">Gửi đánh giá của bạn</p>
                <Input type="number" min={1} max={5} {...reviewForm.register("rating", { valueAsNumber: true })} />
                <Textarea placeholder="Trải nghiệm của bạn..." {...reviewForm.register("comment")} />
                {reviewForm.formState.errors.comment ? (
                  <p className="text-xs text-red-500">{reviewForm.formState.errors.comment.message}</p>
                ) : null}
                <Button type="submit">Gửi đánh giá</Button>
              </form>
              <div className="space-y-3">
                {reviewsQuery.data?.map((review) => (
                  <div key={review.id} className="rounded-xl border border-border/60 p-4">
                    <p className="text-sm font-medium">Đánh giá {review.rating}/5</p>
                    <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{toShortDate(review.createdAt)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discussion">
          <Card>
            <CardContent className="space-y-6 p-6">
              <form
                className="space-y-3 rounded-2xl border border-border/60 p-4"
                onSubmit={discussionForm.handleSubmit((values) => discussionMutation.mutate(values))}
              >
                <p className="font-medium">Đặt câu hỏi / thảo luận</p>
                <Textarea placeholder="Nhập câu hỏi của bạn..." {...discussionForm.register("content")} />
                {discussionForm.formState.errors.content ? (
                  <p className="text-xs text-red-500">{discussionForm.formState.errors.content.message}</p>
                ) : null}
                <Button type="submit" disabled={discussionMutation.isPending}>
                  <MessageSquareMore className="mr-2 h-4 w-4" />
                  Gửi thảo luận
                </Button>
              </form>

              <div className="space-y-3">
                {discussionItems.map((comment) => (
                  <div
                    key={comment.id}
                    className={`rounded-xl border border-border/60 p-4 ${
                      comment.parentId ? "ml-6 bg-card/40" : ""
                    }`}
                  >
                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-luxury-gold/80">
                      {comment.aiHandled || comment.handledBy === "AI"
                        ? "AI Assistant"
                        : (comment.senderName ?? "Khách hàng")}
                    </p>
                    <p className="text-sm">{comment.content}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{toShortDate(comment.createdAt)}</p>
                  </div>
                ))}

                {discussionsQuery.isLoading ? (
                  <p className="text-center text-sm text-muted-foreground">Đang tải thảo luận...</p>
                ) : null}

                {discussionsQuery.isFetchingNextPage ? (
                  <p className="text-center text-sm text-muted-foreground">Đang tải thêm...</p>
                ) : null}

                {!discussionsQuery.hasNextPage && discussionItems.length > 0 ? (
                  <p className="text-center text-xs text-muted-foreground">Đã hiển thị hết thảo luận.</p>
                ) : null}

                <div ref={discussionLoadMoreRef} className="h-1 w-full" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warranty">
          <Card>
            <CardContent className="space-y-3 p-6">
              <p className="font-medium">Chính sách bảo hành</p>
              <p className="text-sm text-muted-foreground">
                Sản phẩm được bảo hành chính hãng theo thời hạn quy định. Sau khi nhận hàng, bạn có thể tạo yêu
                cầu bảo hành trong mục tài khoản của mình nếu phát sinh lỗi kỹ thuật hợp lệ.
              </p>
              <Button variant="outline" asChild>
                <a href="/policies/return">Xem chi tiết chính sách</a>
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-luxury-gold" />
                Quy trình minh bạch - theo dõi trạng thái từng bước.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {relatedProducts.length > 0 ? (
        <section className="space-y-5">
          <h2 className="font-display text-2xl">Sản phẩm tương tự</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} onAddToCart={() => addCartMutation.mutate()} onCompare={compareAdd} />
            ))}
          </div>
        </section>
      ) : null}

      <AnimatePresence>
        {zoomOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4"
            onClick={() => setZoomOpen(false)}
          >
            <img
              src={activeImage?.url}
              alt={activeImage?.alt ?? product.name}
              className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <LoginPromptDialog open={loginPromptOpen} onOpenChange={setLoginPromptOpen} />
    </section>
  );
};
