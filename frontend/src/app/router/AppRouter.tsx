import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { CustomerLayout } from "@/app/layouts/CustomerLayout";
import { DashboardLayout } from "@/app/layouts/DashboardLayout";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { RouteGuard } from "@/app/router/RouteGuard";
import { ForbiddenPage } from "@/features/auth/pages/ForbiddenPage";
import { LoadingState } from "@/shared/components/states/LoadingState";
import { ROUTES } from "@/shared/constants/routes";

const HomePage = lazy(() => import("@/features/home/pages/HomePage").then((m) => ({ default: m.HomePage })));
const CatalogPage = lazy(() => import("@/features/catalog/pages/CatalogPage").then((m) => ({ default: m.CatalogPage })));
const SearchPage = lazy(() => import("@/features/catalog/pages/SearchPage").then((m) => ({ default: m.SearchPage })));
const ProductDetailPage = lazy(() => import("@/features/product/pages/ProductDetailPage").then((m) => ({ default: m.ProductDetailPage })));
const ComparePage = lazy(() => import("@/features/compare/pages/ComparePage").then((m) => ({ default: m.ComparePage })));
const AboutPage = lazy(() => import("@/features/static/pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import("@/features/static/pages/ContactPage").then((m) => ({ default: m.ContactPage })));
const TermsPage = lazy(() => import("@/features/static/pages/TermsPage").then((m) => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import("@/features/static/pages/PrivacyPage").then((m) => ({ default: m.PrivacyPage })));
const ReturnPolicyPage = lazy(() => import("@/features/static/pages/ReturnPolicyPage").then((m) => ({ default: m.ReturnPolicyPage })));
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage").then((m) => ({ default: m.RegisterPage })));
const VerifyEmailPage = lazy(() => import("@/features/auth/pages/VerifyEmailPage").then((m) => ({ default: m.VerifyEmailPage })));
const ForgotPasswordPage = lazy(() => import("@/features/auth/pages/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage })));
const ProfilePage = lazy(() => import("@/features/profile/pages/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const NotificationsPage = lazy(() => import("@/features/notifications/pages/NotificationsPage").then((m) => ({ default: m.NotificationsPage })));
const CartPage = lazy(() => import("@/features/cart/pages/CartPage").then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import("@/features/checkout/pages/CheckoutPage").then((m) => ({ default: m.CheckoutPage })));
const OrdersPage = lazy(() => import("@/features/orders/pages/OrdersPage").then((m) => ({ default: m.OrdersPage })));
const OrderDetailPage = lazy(() => import("@/features/orders/pages/OrderDetailPage").then((m) => ({ default: m.OrderDetailPage })));
const WarrantyPage = lazy(() => import("@/features/warranty/pages/WarrantyPage").then((m) => ({ default: m.WarrantyPage })));
const NewWarrantyPage = lazy(() => import("@/features/warranty/pages/NewWarrantyPage").then((m) => ({ default: m.NewWarrantyPage })));

const StaffDashboardPage = lazy(() => import("@/features/staff/pages/StaffDashboardPage").then((m) => ({ default: m.StaffDashboardPage })));
const StaffOrdersPage = lazy(() => import("@/features/staff/pages/StaffOrdersPage").then((m) => ({ default: m.StaffOrdersPage })));
const StaffOrderDetailPage = lazy(() => import("@/features/staff/pages/StaffOrderDetailPage").then((m) => ({ default: m.StaffOrderDetailPage })));
const StaffWarrantiesPage = lazy(() => import("@/features/staff/pages/StaffWarrantiesPage").then((m) => ({ default: m.StaffWarrantiesPage })));
const StaffWarrantyDetailPage = lazy(() =>
  import("@/features/staff/pages/StaffWarrantyDetailPage").then((m) => ({ default: m.StaffWarrantyDetailPage })),
);
const StaffProductsPage = lazy(() => import("@/features/staff/pages/StaffProductsPage").then((m) => ({ default: m.StaffProductsPage })));
const StaffProductCreatePage = lazy(() =>
  import("@/features/staff/pages/StaffProductCreatePage").then((m) => ({ default: m.StaffProductCreatePage })),
);
const StaffProductEditPage = lazy(() =>
  import("@/features/staff/pages/StaffProductEditPage").then((m) => ({ default: m.StaffProductEditPage })),
);
const StaffProductDetailPage = lazy(() =>
  import("@/features/staff/pages/StaffProductDetailPage").then((m) => ({ default: m.StaffProductDetailPage })),
);
const StaffCustomersPage = lazy(() =>
  import("@/features/staff/pages/StaffCustomersPage").then((m) => ({ default: m.StaffCustomersPage })),
);
const StaffCustomerDetailPage = lazy(() =>
  import("@/features/staff/pages/StaffCustomerDetailPage").then((m) => ({ default: m.StaffCustomerDetailPage })),
);
const StaffCategoriesPage = lazy(() =>
  import("@/features/staff/pages/StaffCategoriesPage").then((m) => ({ default: m.StaffCategoriesPage })),
);
const StaffSupportPage = lazy(() => import("@/features/staff/pages/StaffSupportPage").then((m) => ({ default: m.StaffSupportPage })));

const OwnerDashboardPage = lazy(() => import("@/features/owner/pages/OwnerDashboardPage").then((m) => ({ default: m.OwnerDashboardPage })));
const OwnerProductsPage = lazy(() => import("@/features/owner/pages/OwnerProductsPage").then((m) => ({ default: m.OwnerProductsPage })));
const OwnerProductCreatePage = lazy(() =>
  import("@/features/owner/pages/OwnerProductCreatePage").then((m) => ({ default: m.OwnerProductCreatePage })),
);
const OwnerProductEditPage = lazy(() =>
  import("@/features/owner/pages/OwnerProductEditPage").then((m) => ({ default: m.OwnerProductEditPage })),
);
const OwnerInventoryPage = lazy(() => import("@/features/owner/pages/OwnerInventoryPage").then((m) => ({ default: m.OwnerInventoryPage })));
const OwnerSuppliersPage = lazy(() => import("@/features/owner/pages/OwnerSuppliersPage").then((m) => ({ default: m.OwnerSuppliersPage })));
const OwnerImportReceiptsPage = lazy(() => import("@/features/owner/pages/OwnerImportReceiptsPage").then((m) => ({ default: m.OwnerImportReceiptsPage })));
const OwnerCustomersPage = lazy(() => import("@/features/owner/pages/OwnerCustomersPage").then((m) => ({ default: m.OwnerCustomersPage })));
const OwnerCustomerDetailPage = lazy(() =>
  import("@/features/owner/pages/OwnerCustomerDetailPage").then((m) => ({ default: m.OwnerCustomerDetailPage })),
);
const OwnerWarrantiesPage = lazy(() =>
  import("@/features/owner/pages/OwnerWarrantiesPage").then((m) => ({ default: m.OwnerWarrantiesPage })),
);
const OwnerWarrantyDetailPage = lazy(() =>
  import("@/features/owner/pages/OwnerWarrantyDetailPage").then((m) => ({ default: m.OwnerWarrantyDetailPage })),
);
const OwnerStaffPage = lazy(() => import("@/features/owner/pages/OwnerStaffPage").then((m) => ({ default: m.OwnerStaffPage })));
const OwnerStaffDetailPage = lazy(() =>
  import("@/features/owner/pages/OwnerStaffDetailPage").then((m) => ({ default: m.OwnerStaffDetailPage })),
);
const OwnerVouchersPage = lazy(() => import("@/features/owner/pages/OwnerVouchersPage").then((m) => ({ default: m.OwnerVouchersPage })));
const OwnerReportsPage = lazy(() => import("@/features/owner/pages/OwnerReportsPage").then((m) => ({ default: m.OwnerReportsPage })));
const OwnerContentPage = lazy(() => import("@/features/owner/pages/OwnerContentPage").then((m) => ({ default: m.OwnerContentPage })));
const OwnerCategoriesPage = lazy(() =>
  import("@/features/owner/pages/OwnerCategoriesPage").then((m) => ({ default: m.OwnerCategoriesPage })),
);
const OwnerProductDetailPage = lazy(() =>
  import("@/features/owner/pages/OwnerProductDetailPage").then((m) => ({ default: m.OwnerProductDetailPage })),
);

const NotFoundPage = lazy(() => import("@/features/static/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })));

export const AppRouter = () => (
  <BrowserRouter>
    <Suspense fallback={<LoadingState text="Đang tải giao diện..." />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path={ROUTES.shop} element={<CatalogPage />} />
          <Route path={ROUTES.search} element={<SearchPage />} />
          <Route path={ROUTES.productDetail} element={<ProductDetailPage />} />
          <Route path={ROUTES.compare} element={<ComparePage />} />
          <Route path={ROUTES.about} element={<AboutPage />} />
          <Route path={ROUTES.contact} element={<ContactPage />} />
          <Route path={ROUTES.policies.terms} element={<TermsPage />} />
          <Route path={ROUTES.policies.privacy} element={<PrivacyPage />} />
          <Route path={ROUTES.policies.returnPolicy} element={<ReturnPolicyPage />} />
          <Route path={ROUTES.auth.login} element={<LoginPage />} />
          <Route path={ROUTES.auth.register} element={<RegisterPage />} />
          <Route path={ROUTES.auth.verifyEmail} element={<VerifyEmailPage />} />
          <Route path={ROUTES.auth.forgotPassword} element={<ForgotPasswordPage />} />

          <Route
            element={
              <RouteGuard allowRoles={["CUSTOMER", "STAFF", "OWNER"]}>
                <CustomerLayout />
              </RouteGuard>
            }
          >
            <Route path={ROUTES.customer.profile} element={<ProfilePage />} />
            <Route path={ROUTES.customer.notifications} element={<NotificationsPage />} />
            <Route path={ROUTES.customer.cart} element={<CartPage />} />
            <Route path={ROUTES.customer.checkout} element={<CheckoutPage />} />
            <Route path={ROUTES.customer.orders} element={<OrdersPage />} />
            <Route path={ROUTES.customer.orderDetail} element={<OrderDetailPage />} />
            <Route path={ROUTES.customer.warranty} element={<WarrantyPage />} />
            <Route path={ROUTES.customer.newWarranty} element={<NewWarrantyPage />} />
          </Route>
        </Route>

        <Route
          element={
            <RouteGuard allowRoles={["STAFF"]}>
              <DashboardLayout role="STAFF" />
            </RouteGuard>
          }
        >
          <Route path={ROUTES.staff.dashboard} element={<StaffDashboardPage />} />
          <Route path={ROUTES.staff.orders} element={<StaffOrdersPage />} />
          <Route path={ROUTES.staff.orderDetail} element={<StaffOrderDetailPage />} />
          <Route path={ROUTES.staff.warranties} element={<StaffWarrantiesPage />} />
          <Route path={ROUTES.staff.warrantyDetail} element={<StaffWarrantyDetailPage />} />
          <Route path={ROUTES.staff.products} element={<StaffProductsPage />} />
          <Route path={ROUTES.staff.productCreate} element={<StaffProductCreatePage />} />
          <Route path={ROUTES.staff.productEdit} element={<StaffProductEditPage />} />
          <Route path={ROUTES.staff.productDetail} element={<StaffProductDetailPage />} />
          <Route path={ROUTES.staff.categories} element={<StaffCategoriesPage />} />
          <Route path={ROUTES.staff.customers} element={<StaffCustomersPage />} />
          <Route path={ROUTES.staff.customerDetail} element={<StaffCustomerDetailPage />} />
          <Route path={ROUTES.staff.support} element={<StaffSupportPage />} />
        </Route>

        <Route
          element={
            <RouteGuard allowRoles={["OWNER"]}>
              <DashboardLayout role="OWNER" />
            </RouteGuard>
          }
        >
          <Route path={ROUTES.owner.dashboard} element={<OwnerDashboardPage />} />
          <Route path={ROUTES.owner.products} element={<OwnerProductsPage />} />
          <Route path={ROUTES.owner.productCreate} element={<OwnerProductCreatePage />} />
          <Route path={ROUTES.owner.productEdit} element={<OwnerProductEditPage />} />
          <Route path={ROUTES.owner.productDetail} element={<OwnerProductDetailPage />} />
          <Route path={ROUTES.owner.categories} element={<OwnerCategoriesPage />} />
          <Route path={ROUTES.owner.inventory} element={<OwnerInventoryPage />} />
          <Route path={ROUTES.owner.suppliers} element={<OwnerSuppliersPage />} />
          <Route path={ROUTES.owner.importReceipts} element={<OwnerImportReceiptsPage />} />
          <Route path={ROUTES.owner.customers} element={<OwnerCustomersPage />} />
          <Route path={ROUTES.owner.customerDetail} element={<OwnerCustomerDetailPage />} />
          <Route path={ROUTES.owner.warranties} element={<OwnerWarrantiesPage />} />
          <Route path={ROUTES.owner.warrantyDetail} element={<OwnerWarrantyDetailPage />} />
          <Route path={ROUTES.owner.staff} element={<OwnerStaffPage />} />
          <Route path={ROUTES.owner.staffDetail} element={<OwnerStaffDetailPage />} />
          <Route path={ROUTES.owner.vouchers} element={<OwnerVouchersPage />} />
          <Route path={ROUTES.owner.reports} element={<OwnerReportsPage />} />
          <Route path={ROUTES.owner.content} element={<OwnerContentPage />} />
        </Route>

        <Route path={ROUTES.errors.forbidden} element={<ForbiddenPage />} />
        <Route path={ROUTES.errors.notFound} element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);
