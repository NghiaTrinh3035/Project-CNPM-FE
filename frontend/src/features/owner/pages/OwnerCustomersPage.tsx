import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { CustomerForm } from "@/features/customers/components/CustomerForm";
import type { CustomerFormValues } from "@/features/customers/schemas/customerSchema";
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

export const OwnerCustomersPage = () => {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "update">("create");
  const [editingCustomer, setEditingCustomer] = useState<User | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const navigate = useNavigate();

  const customersQuery = useQuery({
    queryKey: ["owner-customers"],
    queryFn: adminService.listCustomers,
  });

  const createMutation = useMutation({
    mutationFn: adminService.createCustomer,
    onSuccess: () => {
      toast.success("Them khach hang thanh cong.");
      queryClient.invalidateQueries({ queryKey: ["owner-customers"] });
      queryClient.invalidateQueries({ queryKey: ["staff-customers"] });
      setFormOpen(false);
      setEditingCustomer(null);
      setSubmitError(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof adminService.updateCustomer>[1] }) =>
      adminService.updateCustomer(id, payload),
    onSuccess: () => {
      toast.success("Cap nhat khach hang thanh cong.");
      queryClient.invalidateQueries({ queryKey: ["owner-customers"] });
      queryClient.invalidateQueries({ queryKey: ["staff-customers"] });
      setFormOpen(false);
      setEditingCustomer(null);
      setSubmitError(null);
    },
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

  const rows = useMemo(() => {
    const customers = customersQuery.data ?? [];
    return customers
      .filter((customer) => {
        if (!keyword) return true;
        const name = (customer.fullName ?? "").toLowerCase();
        const email = (customer.email ?? "").toLowerCase();
        return name.includes(keyword.toLowerCase()) || email.includes(keyword.toLowerCase());
      });
  }, [customersQuery.data, keyword]);

  const openCreateForm = () => {
    setFormMode("create");
    setEditingCustomer(null);
    setSubmitError(null);
    setFormOpen(true);
  };

  const openUpdateForm = (customer: User) => {
    setFormMode("update");
    setEditingCustomer(customer);
    setSubmitError(null);
    setFormOpen(true);
  };

  const handleSubmit = async (values: CustomerFormValues) => {
    const payload = {
      username: (values.username || editingCustomer?.username || "").trim(),
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      gender: values.gender,
    };

    setSubmitError(null);

    try {
      if (formMode === "create") {
        const password = values.password?.trim();
        if (!password) {
          throw new Error("Mat khau khong hop le.");
        }
        await createMutation.mutateAsync({ ...payload, password });
        return;
      }
      if (!editingCustomer) {
        throw new Error("Khong tim thay khach hang de cap nhat.");
      }
      await updateMutation.mutateAsync({ id: editingCustomer.id, payload });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Khong the luu khach hang.");
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Quan ly khach hang</CardTitle>
            <Button onClick={openCreateForm}>
              <Plus className="mr-2 h-4 w-4" />
              Them khach hang
            </Button>
          </div>
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
                      <Button variant="outline" size="sm" onClick={() => openUpdateForm(customer)}>
                        <Pencil className="mr-1 h-4 w-4" />
                        Update
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
        </CardContent>
      </Card>

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditingCustomer(null);
            setSubmitError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formMode === "create" ? "Them khach hang" : "Cap nhat khach hang"}</DialogTitle>
            <DialogDescription>
              {formMode === "create"
                ? "Nhap thong tin de tao moi khach hang."
                : "Cap nhat thong tin khach hang da co."}
            </DialogDescription>
          </DialogHeader>

          <CustomerForm
            mode={formMode}
            initialValues={
              editingCustomer
                ? {
                    username: editingCustomer.username,
                    fullName: editingCustomer.fullName,
                    email: editingCustomer.email,
                    phone: editingCustomer.phone,
                    address: editingCustomer.address ?? "",
                    gender: editingCustomer.gender === "MALE" || editingCustomer.gender === "FEMALE" ? editingCustomer.gender : "OTHER",
                  }
                : undefined
            }
            submitError={submitError}
            onCancel={() => setFormOpen(false)}
            onSubmit={handleSubmit}
          />
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
