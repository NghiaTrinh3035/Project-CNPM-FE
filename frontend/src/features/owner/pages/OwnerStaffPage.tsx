import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Lock, LockOpen, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { adminService } from "@/services/adminService";
import { ROUTES } from "@/shared/constants/routes";
import type { User } from "@/shared/types/domain";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

const toGenderLabel = (gender?: User["gender"]) => {
  if (gender === "MALE") return "Nam";
  if (gender === "FEMALE") return "Nữ";
  return "Khác";
};

export const OwnerStaffPage = () => {
  const staffApi = adminService as typeof adminService & {
    setStaffActiveStatus: (payload: { staffId: string; isActive: boolean }) => Promise<User>;
  };
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [lockTarget, setLockTarget] = useState<User | null>(null);
  const navigate = useNavigate();

  const staffQuery = useQuery({
    queryKey: ["owner-staff"],
    queryFn: adminService.listStaff,
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.removeStaff,
    onSuccess: () => {
      toast.success("Đã xóa nhân viên.");
      queryClient.invalidateQueries({ queryKey: ["owner-staff"] });
      setDeleteTarget(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const lockMutation = useMutation({
    mutationFn: staffApi.setStaffActiveStatus,
    onSuccess: (_, variables) => {
      toast.success(variables.isActive ? "Đã mở khóa nhân viên." : "Đã khóa nhân viên.");
      queryClient.invalidateQueries({ queryKey: ["owner-staff"] });
      setLockTarget(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const rows = useMemo(() => {
    const staff = staffQuery.data ?? [];
    const normalizedKeyword = keyword.trim().toLowerCase();

    return staff.filter((member) => {
      if (!normalizedKeyword) {
        return true;
      }
      const searchTarget = `${member.fullName ?? ""} ${member.email ?? ""} ${member.phone ?? ""}`.toLowerCase();
      return searchTarget.includes(normalizedKeyword);
    });
  }, [keyword, staffQuery.data]);

  return (
    <>
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>Quản lý nhân viên</CardTitle>
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm theo tên, email hoặc số điện thoại..."
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Giới tính</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>{staff.id}</TableCell>
                  <TableCell>{staff.fullName || "--"}</TableCell>
                  <TableCell>{staff.phone || "--"}</TableCell>
                  <TableCell>{staff.email || "--"}</TableCell>
                  <TableCell>{staff.address || "--"}</TableCell>
                  <TableCell>{toGenderLabel(staff.gender)}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(ROUTES.owner.staffDetail.replace(":id", staff.id))}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        Xem
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setLockTarget(staff)}>
                        {staff.isActive ? <Lock className="mr-1 h-4 w-4" /> : <LockOpen className="mr-1 h-4 w-4" />}
                        {staff.isActive ? "Khóa" : "Mở khóa"}
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteTarget(staff)}>
                        <Trash2 className="mr-1 h-4 w-4" />
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

      <Dialog
        open={Boolean(lockTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setLockTarget(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{lockTarget?.isActive ? "Xác nhận khóa tài khoản" : "Xác nhận mở khóa tài khoản"}</DialogTitle>
            <DialogDescription>
              {lockTarget?.isActive
                ? `Bạn có chắc chắn muốn khóa tài khoản ${lockTarget?.fullName || "này"} không?`
                : `Bạn có chắc chắn muốn mở khóa tài khoản ${lockTarget?.fullName || "này"} không?`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setLockTarget(null)}>
              Hủy
            </Button>
            <Button
              variant="outline"
              disabled={!lockTarget || lockMutation.isPending}
              onClick={() => {
                if (!lockTarget) {
                  return;
                }
                lockMutation.mutate({ staffId: lockTarget.id, isActive: !lockTarget.isActive });
              }}
            >
              {lockMutation.isPending ? "Đang xử lý..." : lockTarget?.isActive ? "Khóa" : "Mở khóa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa nhân viên</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa nhân viên {deleteTarget?.fullName || "này"} không?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              disabled={!deleteTarget || deleteMutation.isPending}
              onClick={() => {
                if (!deleteTarget) {
                  return;
                }
                deleteMutation.mutate(deleteTarget.id);
              }}
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
