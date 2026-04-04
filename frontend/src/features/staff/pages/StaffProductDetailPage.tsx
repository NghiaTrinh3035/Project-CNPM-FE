import { useParams } from "react-router-dom";

import { ProductAdminDetailPage } from "@/features/product/components/ProductAdminDetailPage";

export const StaffProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  return <ProductAdminDetailPage role="STAFF" productId={id} />;
};

export default StaffProductDetailPage;

