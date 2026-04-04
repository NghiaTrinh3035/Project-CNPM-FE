import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { userService } from "@/services/userService";
import { useAuthStore } from "@/shared/hooks/useAuthStore";
import type { User } from "@/shared/types/domain";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";

const schema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Họ và tên phải có ít nhất 2 ký tự.")
    .max(80, "Họ và tên tối đa 80 ký tự."),
  username: z
    .string()
    .trim()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự.")
    .max(50, "Tên đăng nhập tối đa 50 ký tự."),
  email: z.string().trim().email("Email không hợp lệ."),
  phone: z.string().regex(/^(?:\+84|0)[3-9]\d{8}$/, "Số điện thoại không hợp lệ."),
  address: z
    .string()
    .trim()
    .min(5, "Địa chỉ quá ngắn.")
    .max(255, "Địa chỉ tối đa 255 ký tự."),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
});

type ProfileFormValues = z.infer<typeof schema>;
type ProfileGender = ProfileFormValues["gender"];

const toProfileGender = (gender: User["gender"]): ProfileGender =>
  gender === "MALE" || gender === "FEMALE" || gender === "OTHER" ? gender : undefined;

export const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: user?.fullName ?? "",
      username: user?.username ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      address: user?.address ?? "",
      gender: toProfileGender(user?.gender),
    },
  });

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) {
        throw new Error("Không tìm thấy thông tin người dùng.");
      }
      return userService.getById(user.id);
    },
    enabled: Boolean(user?.id),
  });

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }

    const profile = profileQuery.data;
    form.reset({
      fullName: profile.fullName ?? "",
      username: profile.username ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      address: profile.address ?? "",
      gender: toProfileGender(profile.gender),
    });
    updateUser(profile);
  }, [form, profileQuery.data, updateUser]);

  const updateProfileMutation = useMutation({
    mutationFn: (values: ProfileFormValues) => {
      if (!user) {
        throw new Error("Không tìm thấy thông tin người dùng.");
      }
      return userService.updateProfile({
        id: user.id,
        fullName: values.fullName,
        username: values.username,
        email: values.email,
        phone: values.phone,
        address: values.address,
        gender: values.gender,
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

  const handleSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin cá nhân</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 sm:max-w-xl" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Họ và tên</label>
            <Input {...form.register("fullName")} />
            {form.formState.errors.fullName ? (
              <p className="text-xs text-red-500">{form.formState.errors.fullName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tên đăng nhập</label>
            <Input {...form.register("username")} />
            {form.formState.errors.username ? (
              <p className="text-xs text-red-500">{form.formState.errors.username.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input type="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
            ) : null}
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Giới tính</label>
            <Select {...form.register("gender")}>
              <option value="">Chưa cập nhật</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Vai trò</label>
            <Input value={user.role} disabled />
          </div>

          <Button type="submit" className="w-fit">
            {updateProfileMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>

          {profileQuery.isFetching ? <p className="text-xs text-muted-foreground">Đang đồng bộ dữ liệu từ hệ thống...</p> : null}
        </form>
      </CardContent>
    </Card>
  );
};
