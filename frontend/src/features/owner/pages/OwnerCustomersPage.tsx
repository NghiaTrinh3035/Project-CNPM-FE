import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Lock, LockOpen, Trash2, UserRoundCog } from "lucide-react";
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
import { Select } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

const toGenderLabel = (gender?: User["gender"]) => {
  if (gender === "MALE") return "Nam";
  if (gender === "FEMALE") return "Nữ";
  return "Khác";
};

export const OwnerCustomersPage = () => {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [lockTarget, setLockTarget] = useState<User | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  const customersQuery = useQuery({
    queryKey: ["owner-customers", page, pageSize],
    queryFn: () => adminService.listCustomers({ page, pageSize }),
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.removeCustomer,
    onSuccess: () => {
      toast.success("Đã xóa khách hàng.");
      queryClient.invalidateQueries({ queryKey: ["owner-customers"] });
      queryClient.invalidateQueries({ queryKey: ["staff-customers"] });
      setDeleteTarget(null);
    },
  });

  const lockMutation = useMutation({
    mutationFn: adminService.setCustomerActiveStatus,
    onSuccess: (_, variables) => {
      toast.success(variables.isActive ? "Đã mở khóa khách hàng." : "Đã khóa khách hàng.");
      queryClient.invalidateQueries({ queryKey: ["owner-customers"] });
      queryClient.invalidateQueries({ queryKey: ["staff-customers"] });
      setLockTarget(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const promoteMutation = useMutation({
    mutationFn: adminService.promoteCustomerToStaff,
    onSuccess: () => {
      toast.success("Đã nâng quyền khách hàng thành nhân viên.");
      queryClient.invalidateQueries({ queryKey: ["owner-customers"] });
      queryClient.invalidateQueries({ queryKey: ["staff-customers"] });
      queryClient.invalidateQueries({ queryKey: ["owner-staff"] });
      setPromoteTarget(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const rows = useMemo(() => {
    const customers = customersQuery.data?.items ?? [];
    return customers
      .filter((customer) => {
        if (!keyword) return true;
        const name = (customer.fullName ?? "").toLowerCase();
        const email = (customer.email ?? "").toLowerCase();
        return name.includes(keyword.toLowerCase()) || email.includes(keyword.toLowerCase());
      });
  }, [customersQuery.data?.items, keyword]);

  const totalPages = customersQuery.data?.totalPages ?? 0;
  const totalItems = customersQuery.data?.total ?? 0;

  return (
    <>
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>Quản lý khách hàng</CardTitle>
          <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm theo tên hoặc email..." />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Giới tính</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.id}</TableCell>
                  <TableCell>{customer.fullName || "--"}</TableCell>
                  <TableCell>{customer.phone || "--"}</TableCell>
                  <TableCell>{customer.email || "--"}</TableCell>
                  <TableCell>{customer.address || "--"}</TableCell>
                  <TableCell>{toGenderLabel(customer.gender)}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(ROUTES.owner.customerDetail.replace(":id", customer.id))}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        Xem
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setLockTarget(customer)}>
                        {customer.isActive ? <Lock className="mr-1 h-4 w-4" /> : <LockOpen className="mr-1 h-4 w-4" />}
                        {customer.isActive ? "Khóa" : "Mở khóa"}
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteTarget(customer)}>
                        <Trash2 className="mr-1 h-4 w-4" />
                        Xóa
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-600 text-white hover:bg-blue-500"
                        onClick={() => setPromoteTarget(customer)}
                      >
                        <UserRoundCog className="mr-1 h-4 w-4" />
                        Nâng quyền
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Trang {page} / {Math.max(totalPages, 1)} - Tổng {totalItems} khách hàng
            </div>
            <div className="flex items-center gap-2">
              <Select
                className="w-24"
                value={String(pageSize)}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
              >
                <option value="10">10 / trang</option>
                <option value="20">20 / trang</option>
                <option value="50">50 / trang</option>
              </Select>
              <Button variant="outline" disabled={page <= 1 || customersQuery.isFetching} onClick={() => setPage((prev) => prev - 1)}>
                Trước
              </Button>
              <Button
                variant="outline"
                disabled={page >= Math.max(totalPages, 1) || customersQuery.isFetching}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
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
                lockMutation.mutate({ customerId: lockTarget.id, isActive: !lockTarget.isActive });
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
            <DialogTitle>Xác nhận xóa khách hàng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa khách hàng {deleteTarget?.fullName || "này"} không?
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
                if (deleteTarget) {
                  deleteMutation.mutate(deleteTarget.id);
                }
              }}
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(promoteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setPromoteTarget(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận nâng quyền</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn nâng khách hàng {promoteTarget?.fullName || "này"} thành nhân viên không?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPromoteTarget(null)}>
              Hủy
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-500"
              disabled={!promoteTarget || promoteMutation.isPending}
              onClick={() => {
                if (!promoteTarget) {
                  return;
                }
                promoteMutation.mutate(promoteTarget.id);
              }}
            >
              {promoteMutation.isPending ? "Đang nâng quyền..." : "Nâng quyền"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
