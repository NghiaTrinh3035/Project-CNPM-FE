import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { WARRANTY_STATUS_LABEL } from "@/shared/constants/labels";
import { warrantyService } from "@/services/warrantyService";
import type { WarrantyStatus } from "@/shared/types/domain";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";

export const StaffWarrantiesPage = () => {
  const [note, setNote] = useState("");
  const [targetId, setTargetId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["staff-warranties"],
    queryFn: warrantyService.listAll,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, noteValue }: { id: string; status: WarrantyStatus; noteValue?: string }) =>
      warrantyService.updateStatus(id, status, noteValue),
    onSuccess: () => {
      toast.success("Đã cập nhật bảo hành.");
      queryClient.invalidateQueries({ queryKey: ["staff-warranties"] });
      setTargetId(null);
      setNote("");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý bảo hành</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {query.data?.map((item) => (
          <div key={item.id} className="rounded-xl border border-border/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">#{item.id}</p>
              <Badge variant={item.status === "REJECTED" ? "danger" : "outline"}>{WARRANTY_STATUS_LABEL[item.status]}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            {item.technicianNote ? <p className="mt-2 text-xs text-muted-foreground">Ghi chú: {item.technicianNote}</p> : null}
            <div className="mt-3 grid gap-2 sm:grid-cols-[180px_1fr_auto]">
              <Select
                onChange={(event) =>
                  updateMutation.mutate({
                    id: item.id,
                    status: event.target.value as WarrantyStatus,
                    noteValue: targetId === item.id ? note : undefined,
                  })
                }
                defaultValue=""
              >
                <option value="" disabled>
                  Cập nhật trạng thái
                </option>
                <option value="RECEIVED">Đã tiếp nhận</option>
                <option value="PROCESSING">Đang xử lý</option>
                <option value="REJECTED">Từ chối</option>
                <option value="COMPLETED">Hoàn tất</option>
              </Select>
              <Input
                placeholder="Ghi chú kỹ thuật viên"
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
                Lưu note
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
