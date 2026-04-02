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
import { Select } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

const toGenderLabel = (gender?: User["gender"]) => {
  if (gender === "MALE") return "Nam";
  if (gender === "FEMALE") return "Nu";
  return "Khac";
};

export const OwnerCustomersPage = () => {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [lockTarget, setLockTarget] = useState<User | null>(null);
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
      toast.success("Da xoa khach hang.");
      queryClient.invalidateQueries({ queryKey: ["owner-customers"] });
      queryClient.invalidateQueries({ queryKey: ["staff-customers"] });
      setDeleteTarget(null);
    },
  });

  const lockMutation = useMutation({
    mutationFn: adminService.setCustomerActiveStatus,
    onSuccess: (_, variables) => {
      toast.success(variables.isActive ? "Da mo khoa khach hang." : "Da khoa khach hang.");
      queryClient.invalidateQueries({ queryKey: ["owner-customers"] });
      queryClient.invalidateQueries({ queryKey: ["staff-customers"] });
      setLockTarget(null);
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
          <CardTitle>Quan ly khach hang</CardTitle>
          <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm theo tên hoặc email..." />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead className="text-right">Thao tac</TableHead>
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
                        {customer.isActive ? "Lock" : "Unlock"}
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteTarget(customer)}>
                        <Trash2 className="mr-1 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Trang {page} / {Math.max(totalPages, 1)} - Tong {totalItems} khach hang
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
                <option value="10">10 / page</option>
                <option value="20">20 / page</option>
                <option value="50">50 / page</option>
              </Select>
              <Button variant="outline" disabled={page <= 1 || customersQuery.isFetching} onClick={() => setPage((prev) => prev - 1)}>
                Prev
              </Button>
              <Button
                variant="outline"
                disabled={page >= Math.max(totalPages, 1) || customersQuery.isFetching}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
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
                lockMutation.mutate({ customerId: lockTarget.id, isActive: !lockTarget.isActive });
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
            <DialogTitle>Xac nhan xoa khach hang</DialogTitle>
            <DialogDescription>
              Ban co chac chan muon xoa khach hang {deleteTarget?.fullName || "này"} khong?
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
                if (deleteTarget) {
                  deleteMutation.mutate(deleteTarget.id);
                }
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
