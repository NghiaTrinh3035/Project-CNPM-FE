import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { EmptyState } from "@/shared/components/states/EmptyState";
import { WARRANTY_STATUS_LABEL } from "@/shared/constants/labels";
import { warrantyService } from "@/services/warrantyService";
import { useSession } from "@/shared/hooks/useSession";
import { toShortDate } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export const WarrantyPage = () => {
  const { user } = useSession();
  const query = useQuery({
    queryKey: ["warranties", user?.id],
    queryFn: () => (user ? warrantyService.listByUser(user.id) : Promise.resolve([])),
    enabled: Boolean(user),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lịch sử yêu cầu bảo hành</CardTitle>
        <Button asChild variant="outline">
          <Link to="/warranty/new">Tạo yêu cầu mới</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {query.data?.length ? (
          query.data.map((item) => (
            <div key={item.id} className="rounded-xl border border-border/60 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Yêu cầu #{item.id}</p>
                <Badge variant={item.status === "REJECTED" ? "danger" : "outline"}>{WARRANTY_STATUS_LABEL[item.status]}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">Ngày tạo: {toShortDate(item.createdAt)}</p>
              {item.technicianNote ? (
                <p className="mt-2 rounded-md bg-accent p-2 text-xs">{item.technicianNote}</p>
              ) : null}
            </div>
          ))
        ) : (
          <EmptyState title="Chưa có yêu cầu bảo hành" description="Khi tạo yêu cầu mới, trạng thái sẽ hiển thị tại đây." />
        )}
      </CardContent>
    </Card>
  );
};
