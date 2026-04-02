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
  if (gender === "FEMALE") return "Nu";
  return "Khac";
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
      toast.success("Da xoa nhan vien.");
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
      toast.success(variables.isActive ? "Da mo khoa nhan vien." : "Da khoa nhan vien.");
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
          <CardTitle>Quan ly nhan vien</CardTitle>
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tim theo ten, email hoac so dien thoai..."
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
                <TableHead className="text-right">Thao tac</TableHead>
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
                        {staff.isActive ? "Lock" : "Unlock"}
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteTarget(staff)}>
                        <Trash2 className="mr-1 h-4 w-4" />
                        Delete
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
            <DialogTitle>{lockTarget?.isActive ? "Xac nhan khoa tai khoan" : "Xac nhan mo khoa tai khoan"}</DialogTitle>
            <DialogDescription>
              {lockTarget?.isActive
                ? `Ban co chac chan muon khoa tai khoan ${lockTarget?.fullName || "nay"} khong?`
                : `Ban co chac chan muon mo khoa tai khoan ${lockTarget?.fullName || "nay"} khong?`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setLockTarget(null)}>
              Huy
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
              {lockMutation.isPending ? "Dang xu ly..." : lockTarget?.isActive ? "Khoa" : "Mo khoa"}
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
            <DialogTitle>Xac nhan xoa nhan vien</DialogTitle>
            <DialogDescription>
              Ban co chac chan muon xoa nhan vien {deleteTarget?.fullName || "nay"} khong?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Huy
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
              {deleteMutation.isPending ? "Dang xoa..." : "Xoa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
