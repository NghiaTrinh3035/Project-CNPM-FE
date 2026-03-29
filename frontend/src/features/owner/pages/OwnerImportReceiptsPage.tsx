import { useQuery } from "@tanstack/react-query";

import { adminService } from "@/services/adminService";
import { toCurrency, toShortDate } from "@/shared/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export const OwnerImportReceiptsPage = () => {
  const query = useQuery({
    queryKey: ["owner-import-receipts"],
    queryFn: adminService.listImportReceipts,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý phiếu nhập</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {query.data?.map((receipt) => (
          <div key={receipt.id} className="rounded-xl border border-border/60 p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">#{receipt.id}</p>
              <p className="text-xs text-muted-foreground">{toShortDate(receipt.importedAt)}</p>
            </div>
            <p className="text-sm text-muted-foreground">Supplier: {receipt.supplierId}</p>
            <div className="mt-2 space-y-1 text-sm">
              {receipt.details.map((detail) => (
                <p key={detail.id}>
                  Product {detail.productId} - SL {detail.quantity} - Giá nhập {toCurrency(detail.unitCost)}
                </p>
              ))}
            </div>
            {receipt.note ? <p className="mt-2 text-xs text-muted-foreground">Ghi chú: {receipt.note}</p> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
