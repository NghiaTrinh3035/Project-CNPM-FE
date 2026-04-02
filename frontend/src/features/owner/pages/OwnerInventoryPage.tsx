import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export const OwnerInventoryPage = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tồn kho</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Module tồn kho sẽ tách riêng ở phase sau.</p>
      </CardContent>
    </Card>
  );
};

