import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { userService } from "@/services/userService";
import { useAuthStore } from "@/shared/hooks/useAuthStore";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

const schema = z.object({
  username: z
    .string()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự.")
    .max(50, "Tên đăng nhập tối đa 50 ký tự."),
  phone: z.string().regex(/^(?:\+84|0)[3-9]\d{8}$/, "Số điện thoại không hợp lệ."),
  address: z
    .string()
    .min(5, "Địa chỉ quá ngắn.")
    .max(255, "Địa chỉ tối đa 255 ký tự."),
});

type ProfileFormValues = z.infer<typeof schema>;

export const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: user?.username ?? "",
      phone: user?.phone ?? "",
      address: user?.address ?? "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (values: ProfileFormValues) => {
      if (!user) {
        throw new Error("Không tìm thấy thông tin người dùng.");
      }
      return userService.updateProfile({
        id: user.id,
        username: values.username,
        email: user.email,
        phone: values.phone,
        address: values.address,
        gender: user.gender,
        role: user.role,
      });
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      toast.success("Cập nhật hồ sơ thành công.");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Cập nhật hồ sơ thất bại.";
      toast.error(message);
    },
  });

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin cá nhân</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 sm:max-w-xl"
          onSubmit={form.handleSubmit((values) => updateProfileMutation.mutate(values))}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên đăng nhập</label>
            <Input {...form.register("username")} />
            {form.formState.errors.username ? (
              <p className="text-xs text-red-500">{form.formState.errors.username.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input value={user.email} disabled />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Số điện thoại</label>
            <Input {...form.register("phone")} />
            {form.formState.errors.phone ? (
              <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Địa chỉ</label>
            <Input {...form.register("address")} />
            {form.formState.errors.address ? (
              <p className="text-xs text-red-500">{form.formState.errors.address.message}</p>
            ) : null}
          </div>
          <Button type="submit" className="w-fit">
            {updateProfileMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
