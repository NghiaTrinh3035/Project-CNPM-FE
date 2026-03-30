import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { adminService } from "@/services/adminService";
import type { User } from "@/shared/types/domain";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

const createDraft = (): User => ({
  id: `u-staff-${Date.now()}`,
  fullName: "",
  username: "",
  email: "",
  phone: "",
  role: "STAFF",
  isActive: true,
  createdAt: new Date().toISOString(),
});

export const OwnerStaffPage = () => {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<User>(createDraft());

  const staffQuery = useQuery({
    queryKey: ["owner-staff"],
    queryFn: adminService.listStaff,
  });

  const saveMutation = useMutation({
    mutationFn: adminService.saveStaff,
    onSuccess: () => {
      toast.success("Lưu thông tin nhân viên thành công.");
      queryClient.invalidateQueries({ queryKey: ["owner-staff"] });
      setDraft(createDraft());
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.removeStaff,
    onSuccess: () => {
      toast.success("Đã xóa nhân viên.");
      queryClient.invalidateQueries({ queryKey: ["owner-staff"] });
    },
  });

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhân viên</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffQuery.data?.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>{staff.fullName}</TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>{staff.phone}</TableCell>
                  <TableCell>{staff.isActive ? "Hoạt động" : "Khóa"}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setDraft(staff)}>
                        Chỉnh sửa
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => deleteMutation.mutate(staff.id)}>
                        Xóa
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Thêm / sửa nhân viên</CardTitle>
          <Button variant="outline" size="icon" onClick={() => setDraft(createDraft())}>
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={draft.fullName} onChange={(event) => setDraft((prev) => ({ ...prev, fullName: event.target.value }))} placeholder="Họ tên" />
          <Input value={draft.email} onChange={(event) => setDraft((prev) => ({ ...prev, email: event.target.value }))} placeholder="Email" />
          <Input value={draft.phone} onChange={(event) => setDraft((prev) => ({ ...prev, phone: event.target.value }))} placeholder="Số điện thoại" />
          <Select
            value={draft.isActive ? "active" : "inactive"}
            onChange={(event) => setDraft((prev) => ({ ...prev, isActive: event.target.value === "active" }))}
          >
            <option value="active">Hoạt động</option>
            <option value="inactive">Khóa</option>
          </Select>
          <Button className="w-full" onClick={() => saveMutation.mutate(draft)}>
            Lưu nhân viên
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
