import { useParams } from "react-router-dom";

import { ProductAdminDetailPage } from "@/features/product/components/ProductAdminDetailPage";

export const OwnerProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  return <ProductAdminDetailPage role="OWNER" productId={id} />;
};

export default OwnerProductDetailPage;

