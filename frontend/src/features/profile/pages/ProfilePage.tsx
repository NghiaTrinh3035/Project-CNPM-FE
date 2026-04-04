import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
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

const profileSchema = z.object({
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

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "Vui lòng nhập mật khẩu cũ."),
    newPassword: z
      .string()
      .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự.")
      .max(100, "Mật khẩu mới tối đa 100 ký tự."),
    confirmNewPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu mới."),
  })
  .refine((values) => values.newPassword === values.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "Mật khẩu xác nhận không khớp.",
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type ProfileGender = ProfileFormValues["gender"];

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const details = error.response?.data?.details;
    if (Array.isArray(details) && details.length > 0) {
      const firstDetail = details[0];
      if (typeof firstDetail === "string" && firstDetail.trim()) {
        return firstDetail;
      }
    }

    const backendMessage = error.response?.data?.message;
    if (typeof backendMessage === "string" && backendMessage.trim()) {
      return backendMessage;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

const toProfileGender = (gender: User["gender"]): ProfileGender =>
  gender === "MALE" || gender === "FEMALE" || gender === "OTHER" ? gender : undefined;

export const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName ?? "",
      username: user?.username ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      address: user?.address ?? "",
      gender: toProfileGender(user?.gender),
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
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
    profileForm.reset({
      fullName: profile.fullName ?? "",
      username: profile.username ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      address: profile.address ?? "",
      gender: toProfileGender(profile.gender),
    });
    updateUser(profile);
  }, [profileForm, profileQuery.data, updateUser]);

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
      const message = getErrorMessage(error, "Cập nhật hồ sơ thất bại.");
      toast.error(message);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (values: PasswordFormValues) => {
      if (!user) {
        throw new Error("Không tìm thấy thông tin người dùng.");
      }
      await userService.changePassword(user.id, values);
    },
    onSuccess: () => {
      passwordForm.reset();
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmNewPassword(false);
      toast.success("Đổi mật khẩu thành công.");
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "Đổi mật khẩu thất bại.");
      toast.error(message);
    },
  });

  if (!user) {
    return null;
  }

  const handleProfileSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };

  const handleChangePassword = (values: PasswordFormValues) => {
    changePasswordMutation.mutate(values);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:max-w-xl" onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Họ và tên</label>
              <Input {...profileForm.register("fullName")} />
              {profileForm.formState.errors.fullName ? (
                <p className="text-xs text-red-500">{profileForm.formState.errors.fullName.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tên đăng nhập</label>
              <Input {...profileForm.register("username")} />
              {profileForm.formState.errors.username ? (
                <p className="text-xs text-red-500">{profileForm.formState.errors.username.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" {...profileForm.register("email")} />
              {profileForm.formState.errors.email ? (
                <p className="text-xs text-red-500">{profileForm.formState.errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Số điện thoại</label>
              <Input {...profileForm.register("phone")} />
              {profileForm.formState.errors.phone ? (
                <p className="text-xs text-red-500">{profileForm.formState.errors.phone.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Địa chỉ</label>
              <Input {...profileForm.register("address")} />
              {profileForm.formState.errors.address ? (
                <p className="text-xs text-red-500">{profileForm.formState.errors.address.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Giới tính</label>
              <Select {...profileForm.register("gender")}>
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

      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={passwordForm.handleSubmit(handleChangePassword)}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mật khẩu cũ</label>
              <div className="relative">
                <Input type={showOldPassword ? "text" : "password"} className="pr-11" {...passwordForm.register("oldPassword")} />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  aria-label={showOldPassword ? "Ẩn mật khẩu cũ" : "Hiện mật khẩu cũ"}
                  onClick={() => setShowOldPassword((prev) => !prev)}
                >
                  {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.oldPassword ? (
                <p className="text-xs text-red-500">{passwordForm.formState.errors.oldPassword.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mật khẩu mới</label>
              <div className="relative">
                <Input type={showNewPassword ? "text" : "password"} className="pr-11" {...passwordForm.register("newPassword")} />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  aria-label={showNewPassword ? "Ẩn mật khẩu mới" : "Hiện mật khẩu mới"}
                  onClick={() => setShowNewPassword((prev) => !prev)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.newPassword ? (
                <p className="text-xs text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">Mật khẩu mới cần từ 8 đến 100 ký tự.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nhập lại mật khẩu mới</label>
              <div className="relative">
                <Input
                  type={showConfirmNewPassword ? "text" : "password"}
                  className="pr-11"
                  {...passwordForm.register("confirmNewPassword")}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  aria-label={showConfirmNewPassword ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
                  onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                >
                  {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.confirmNewPassword ? (
                <p className="text-xs text-red-500">{passwordForm.formState.errors.confirmNewPassword.message}</p>
              ) : null}
            </div>

            <Button type="submit" className="w-full" disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending ? "Đang đổi mật khẩu..." : "Cập nhật mật khẩu"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};


