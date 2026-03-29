import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { adminService } from "@/services/adminService";
import type { Voucher } from "@/shared/types/domain";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { toShortDate } from "@/shared/lib/format";

const createDraft = (): Voucher => ({
  id: `v-${Date.now()}`,
  code: "",
  title: "",
  description: "",
  discountPercent: 5,
  minOrderValue: 0,
  validFrom: new Date().toISOString(),
  validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  isActive: true,
});

export const OwnerVouchersPage = () => {
  const [draft, setDraft] = useState<Voucher>(createDraft());
  const queryClient = useQueryClient();

  const vouchersQuery = useQuery({
    queryKey: ["owner-vouchers"],
    queryFn: adminService.listVouchers,
  });

  const saveMutation = useMutation({
    mutationFn: adminService.saveVoucher,
    onSuccess: () => {
      toast.success("Đã lưu voucher.");
      queryClient.invalidateQueries({ queryKey: ["owner-vouchers"] });
      setDraft(createDraft());
    },
  });

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
      <Card>
        <CardHeader>
          <CardTitle>Danh sách voucher</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Giảm</TableHead>
                <TableHead>Hiệu lực</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchersQuery.data?.map((voucher) => (
                <TableRow key={voucher.id} onClick={() => setDraft(voucher)} className="cursor-pointer">
                  <TableCell>
                    <p className="font-medium">{voucher.code}</p>
                    <p className="text-xs text-muted-foreground">{voucher.title}</p>
                  </TableCell>
                  <TableCell>{voucher.discountPercent}%</TableCell>
                  <TableCell>
                    {toShortDate(voucher.validFrom)} - {toShortDate(voucher.validTo)}
                  </TableCell>
                  <TableCell>{voucher.isActive ? "Active" : "Inactive"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tạo / chỉnh sửa voucher</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={draft.code} onChange={(event) => setDraft((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))} placeholder="Mã voucher" />
          <Input value={draft.title} onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))} placeholder="Tiêu đề" />
          <Input value={draft.description} onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))} placeholder="Mô tả" />
          <Input type="number" value={draft.discountPercent} onChange={(event) => setDraft((prev) => ({ ...prev, discountPercent: Number(event.target.value) }))} placeholder="Phần trăm giảm" />
          <Input type="number" value={draft.minOrderValue} onChange={(event) => setDraft((prev) => ({ ...prev, minOrderValue: Number(event.target.value) }))} placeholder="Giá trị đơn tối thiểu" />
          <Input type="date" value={draft.validFrom.slice(0, 10)} onChange={(event) => setDraft((prev) => ({ ...prev, validFrom: new Date(event.target.value).toISOString() }))} />
          <Input type="date" value={draft.validTo.slice(0, 10)} onChange={(event) => setDraft((prev) => ({ ...prev, validTo: new Date(event.target.value).toISOString() }))} />
          <div className="flex items-center justify-between rounded-md border border-border/60 p-3">
            <span className="text-sm">Kích hoạt voucher</span>
            <Switch checked={draft.isActive} onCheckedChange={(checked) => setDraft((prev) => ({ ...prev, isActive: checked }))} />
          </div>
          <Button className="w-full" variant="luxury" onClick={() => saveMutation.mutate(draft)}>
            Lưu voucher
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
