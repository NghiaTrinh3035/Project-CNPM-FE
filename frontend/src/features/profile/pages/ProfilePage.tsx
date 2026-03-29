import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { useAuthStore } from "@/shared/hooks/useAuthStore";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

const schema = z.object({
  fullName: z.string().min(2, "Tên quá ngắn."),
  phone: z.string().min(9, "Số điện thoại không hợp lệ."),
});

type ProfileFormValues = z.infer<typeof schema>;

export const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: user?.fullName ?? "",
      phone: user?.phone ?? "",
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
          onSubmit={form.handleSubmit((values) => {
            updateUser({ ...user, ...values });
            toast.success("Cập nhật hồ sơ thành công.");
          })}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Họ và tên</label>
            <Input {...form.register("fullName")} />
            {form.formState.errors.fullName ? (
              <p className="text-xs text-red-500">{form.formState.errors.fullName.message}</p>
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
          <Button type="submit" className="w-fit">
            Lưu thay đổi
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
