import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { warrantyService } from "@/services/warrantyService";
import { WARRANTY_STATUS_LABEL } from "@/shared/constants/labels";
import { ROUTES } from "@/shared/constants/routes";
import type { WarrantyStatus } from "@/shared/types/domain";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

export const OwnerWarrantiesPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [targetId, setTargetId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["owner-warranties"],
    queryFn: warrantyService.listAll,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, noteValue }: { id: string; status: WarrantyStatus; noteValue?: string }) =>
      warrantyService.updateStatus(id, status, noteValue),
    onSuccess: () => {
      toast.success("Đã cập nhật bảo hành.");
      queryClient.invalidateQueries({ queryKey: ["owner-warranties"] });
      setTargetId(null);
      setNote("");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý bảo hành (Owner)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã BH</TableHead>
              <TableHead>Đơn hàng</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ghi chú</TableHead>
              <TableHead className="text-right">Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.id}</TableCell>
                <TableCell>{item.orderId}</TableCell>
                <TableCell>{item.productId}</TableCell>
                <TableCell>
                  <Select
                    onChange={(event) =>
                      updateMutation.mutate({
                        id: item.id,
                        status: event.target.value as WarrantyStatus,
                        noteValue: targetId === item.id ? note : undefined,
                      })
                    }
                    defaultValue={item.status}
                  >
                    <option value="RECEIVED">Đã tiếp nhận</option>
                    <option value="PROCESSING">Đang xử lý</option>
                    <option value="REJECTED">Từ chối</option>
                    <option value="COMPLETED">Hoàn tất</option>
                  </Select>
                  <Badge className="mt-2" variant={item.status === "REJECTED" ? "danger" : "outline"}>
                    {WARRANTY_STATUS_LABEL[item.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ghi chú kỹ thuật"
                      value={targetId === item.id ? note : ""}
                      onFocus={() => setTargetId(item.id)}
                      onChange={(event) => setNote(event.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        updateMutation.mutate({
                          id: item.id,
                          status: item.status,
                          noteValue: targetId === item.id ? note : undefined,
                        })
                      }
                    >
                      Lưu
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(ROUTES.owner.warrantyDetail.replace(":id", item.id))}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default OwnerWarrantiesPage;


