import { useQuery } from "@tanstack/react-query";

import { adminService } from "@/services/adminService";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

export const OwnerSuppliersPage = () => {
  const query = useQuery({
    queryKey: ["owner-suppliers"],
    queryFn: adminService.listSuppliers,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nhà cung cấp</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên NCC</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data?.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>
                  <p className="font-medium">{supplier.name}</p>
                  <p className="text-xs text-muted-foreground">{supplier.address}</p>
                </TableCell>
                <TableCell>
                  {supplier.contactName}
                  <p className="text-xs text-muted-foreground">{supplier.phone}</p>
                </TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>
                  <Badge variant={supplier.isActive ? "success" : "danger"}>{supplier.isActive ? "Active" : "Inactive"}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
