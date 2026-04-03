import { useParams } from "react-router-dom";

import { ProductUpsertPage } from "@/features/product/components/ProductUpsertPage";

export const OwnerProductEditPage = () => {
  const { id } = useParams<{ id: string }>();
  return <ProductUpsertPage mode="update" role="OWNER" productId={id} />;
};


