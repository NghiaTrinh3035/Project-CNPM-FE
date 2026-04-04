import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";

import { orderService } from "@/services/orderService";
import { warrantyService } from "@/services/warrantyService";
import { useSession } from "@/shared/hooks/useSession";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

const schema = z.object({
  orderId: z.string().min(1, "Vui lòng chọn đơn hàng."),
  orderItemId: z.string().min(1, "Vui lòng chọn sản phẩm."),
  description: z.string().min(10, "Mô tả lỗi tối thiểu 10 ký tự."),
  imageUrl: z.string().optional(),
});

type WarrantyValues = z.infer<typeof schema>;

export const NewWarrantyPage = () => {
  const { user } = useSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const form = useForm<WarrantyValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      orderId: "",
      orderItemId: "",
      description: "",
      imageUrl: "",
    },
  });

  const ordersQuery = useQuery({
    queryKey: ["warranty-eligible-orders", user?.id],
    queryFn: () => (user ? orderService.getOrdersByUser(user.id) : Promise.resolve([])),
    enabled: Boolean(user),
  });

  const selectedOrder = ordersQuery.data?.find((order) => order.id === form.watch("orderId"));

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    const orderItemId = searchParams.get("orderItemId");

    if (orderId) {
      form.setValue("orderId", orderId, { shouldDirty: false, shouldTouch: false });
    }
    if (orderItemId) {
      form.setValue("orderItemId", orderItemId, { shouldDirty: false, shouldTouch: false });
    }
  }, [form, searchParams]);

  useEffect(() => {
    if (!selectedOrder) {
      return;
    }

    const selectedOrderItemId = form.getValues("orderItemId");
    const hasSelectedItem = selectedOrder.items.some((item) => item.id === selectedOrderItemId);
    if (!hasSelectedItem && selectedOrder.items.length > 0) {
      form.setValue("orderItemId", selectedOrder.items[0].id, { shouldDirty: false, shouldTouch: false });
    }
  }, [form, selectedOrder]);

  const createMutation = useMutation({
    mutationFn: (values: WarrantyValues) => {
      if (!user) {
        return Promise.reject(new Error("Chưa đăng nhập."));
      }
      const item = selectedOrder?.items.find((orderItem) => orderItem.id === values.orderItemId);
      if (!item) {
        return Promise.reject(new Error("Không tìm thấy sản phẩm trong đơn."));
      }
      return warrantyService.create({
        orderId: values.orderId,
        orderItemId: values.orderItemId,
        issueDescription: values.description,
        images: values.imageUrl ? [values.imageUrl] : [],
      });
    },
    onSuccess: () => {
      toast.success("Đã gửi yêu cầu bảo hành.");
      navigate("/warranty");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tạo yêu cầu bảo hành</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4 sm:max-w-xl" onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}>
          <div className="grid gap-3 rounded-2xl border border-border/60 bg-card/40 p-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Khách hàng</p>
              <p className="mt-1 font-medium">{selectedOrder?.shipping.address.fullName || user?.fullName || "--"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Số điện thoại</p>
              <p className="mt-1 font-medium">{selectedOrder?.shipping.address.phone || user?.phone || "--"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Sản phẩm đã chọn</p>
              <p className="mt-1 font-medium">
                {selectedOrder?.items.find((item) => item.id === form.watch("orderItemId"))?.productName || "--"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Đơn hàng đã mua</label>
            <Select {...form.register("orderId")}>
              <option value="">Chọn đơn hàng</option>
              {ordersQuery.data
                ?.filter((order) => ["DELIVERED", "COMPLETED"].includes(order.status))
                .map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.id}
                  </option>
                ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Sản phẩm cần bảo hành</label>
            <Select {...form.register("orderItemId")}>
              <option value="">Chọn sản phẩm</option>
              {selectedOrder?.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.productName} x{item.quantity}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mô tả lỗi</label>
            <Textarea {...form.register("description")} placeholder="Mô tả chi tiết lỗi gặp phải..." />
            {form.formState.errors.description ? (
              <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Ảnh đính kèm (mock URL)</label>
            <Input {...form.register("imageUrl")} placeholder="https://..." />
          </div>
          <Button type="submit" variant="luxury" disabled={createMutation.isPending}>
            Gửi yêu cầu
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
