import { Navigate, Route, Routes } from 'react-router-dom'
import { RouteGuard } from '@/app/router/RouteGuard'
import { ForbiddenPage } from '@/features/auth/pages/ForbiddenPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { CustomerCreatePage } from '@/features/customers/pages/CustomerCreatePage'
import { CustomerDetailPage } from '@/features/customers/pages/CustomerDetailPage'
import { CustomerUpdatePage } from '@/features/customers/pages/CustomerUpdatePage'
import { CustomersPage } from '@/features/customers/pages/CustomersPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { ProductCreatePage } from '@/features/products/pages/ProductCreatePage'
import { ProductDetailPage } from '@/features/products/pages/ProductDetailPage'
import { ProductUpdatePage } from '@/features/products/pages/ProductUpdatePage'
import { ProductsPage } from '@/features/products/pages/ProductsPage'
import { ReportsPage } from '@/features/reports/pages/ReportsPage'
import { StaffCreatePage } from '@/features/staff/pages/StaffCreatePage'
import { StaffListPage } from '@/features/staff/pages/StaffListPage'
import { StaffUpdatePage } from '@/features/staff/pages/StaffUpdatePage'
import { SupplierCreatePage } from '@/features/suppliers/pages/SupplierCreatePage'
import { SupplierDetailPage } from '@/features/suppliers/pages/SupplierDetailPage'
import { SupplierUpdatePage } from '@/features/suppliers/pages/SupplierUpdatePage'
import { SuppliersPage } from '@/features/suppliers/pages/SuppliersPage'
import { VoucherCreatePage } from '@/features/vouchers/pages/VoucherCreatePage'
import { VoucherDetailPage } from '@/features/vouchers/pages/VoucherDetailPage'
import { VoucherUpdatePage } from '@/features/vouchers/pages/VoucherUpdatePage'
import { VouchersPage } from '@/features/vouchers/pages/VouchersPage'
import { WarrantyCreatePage } from '@/features/warranty/pages/WarrantyCreatePage'
import { WarrantyDetailPage } from '@/features/warranty/pages/WarrantyDetailPage'
import { WarrantyPage } from '@/features/warranty/pages/WarrantyPage'
import { WarrantyUpdatePage } from '@/features/warranty/pages/WarrantyUpdatePage'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { ROUTES } from '@/routes/paths'
import { Role } from '@/types/role'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<LoginPage />} path={ROUTES.login} />
      <Route element={<ForbiddenPage />} path={ROUTES.forbidden} />

      <Route element={<RouteGuard />}>
        <Route element={<DashboardLayout />}>
          <Route element={<DashboardPage />} path={ROUTES.dashboard} />

          <Route element={<RouteGuard allowedRoles={[Role.OWNER]} />}>
            <Route element={<StaffListPage />} path={ROUTES.staffList} />
            <Route element={<StaffCreatePage />} path={ROUTES.staffCreate} />
            <Route element={<StaffUpdatePage />} path={ROUTES.staffUpdate} />
            <Route element={<ReportsPage />} path={ROUTES.reports} />
            <Route element={<VouchersPage />} path={ROUTES.vouchers} />
            <Route element={<VoucherCreatePage />} path={ROUTES.voucherCreate} />
            <Route element={<VoucherUpdatePage />} path={ROUTES.voucherUpdate} />
            <Route element={<VoucherDetailPage />} path={ROUTES.voucherDetail} />
          </Route>

          <Route element={<RouteGuard allowedRoles={[Role.OWNER, Role.STAFF]} />}>
            <Route element={<ProductsPage />} path={ROUTES.products} />
            <Route element={<ProductCreatePage />} path={ROUTES.productCreate} />
            <Route element={<ProductUpdatePage />} path={ROUTES.productUpdate} />
            <Route element={<ProductDetailPage />} path={ROUTES.productDetail} />
            <Route element={<WarrantyPage />} path={ROUTES.warranty} />
            <Route element={<WarrantyCreatePage />} path={ROUTES.warrantyCreate} />
            <Route element={<WarrantyUpdatePage />} path={ROUTES.warrantyUpdate} />
            <Route element={<WarrantyDetailPage />} path={ROUTES.warrantyDetail} />
            <Route element={<CustomersPage />} path={ROUTES.customers} />
            <Route element={<CustomerCreatePage />} path={ROUTES.customerCreate} />
            <Route element={<CustomerUpdatePage />} path={ROUTES.customerUpdate} />
            <Route element={<CustomerDetailPage />} path={ROUTES.customerDetail} />
          </Route>

          <Route element={<RouteGuard allowedRoles={[Role.OWNER, Role.ADMIN]} />}>
            <Route element={<SuppliersPage />} path={ROUTES.suppliers} />
            <Route element={<SupplierCreatePage />} path={ROUTES.supplierCreate} />
            <Route element={<SupplierUpdatePage />} path={ROUTES.supplierUpdate} />
            <Route element={<SupplierDetailPage />} path={ROUTES.supplierDetail} />
          </Route>
        </Route>
      </Route>

      <Route element={<Navigate replace to={ROUTES.dashboard} />} path="*" />
    </Routes>
  )
}
