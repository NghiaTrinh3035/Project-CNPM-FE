# FRONTEND FILE GUIDE

Tai lieu nay tong hop cac file da duoc tao/chinh trong batch vua roi, de:
- Ban de nam nhanh codebase
- AI de doc va hieu cau truc khi mo rong tiep

## 1) Tong quan kien truc

Frontend dang theo huong feature-based:
- `src/app`: bootstrap app, router, providers
- `src/layouts`: layout tong (dashboard shell)
- `src/components`: reusable UI/layout/feedback/table
- `src/features`: module theo nghiep vu (auth, staff, ...)
- `src/lib`: adapter ky thuat (axios, local storage)
- `src/routes`: route path + cau hinh menu
- `src/types`: type dung chung toan app
- `src/utils`: helper function
- `src/mocks`: mock utility dung chung

Trang thai hien tai:
- Da hoan thien khung dashboard + role-based routing
- Da hoan thien `Staff List` + `Staff Create`
- Cac module khac hien la placeholder page

## 2) Entry points va config

### `vite.config.ts`
- Bat plugin React + Tailwind Vite plugin
- Cau hinh alias `@` -> `src`

### `.env`
- `VITE_API_BASE_URL=http://localhost:8080/api`

### `src/main.tsx`
- Mount React app
- Bao `App` trong `BrowserRouter`
- Nap global css `src/index.css`

### `src/App.tsx`
- Root component
- Gom `AppProviders` + `AppRouter`

### `src/index.css`
- Global theme/token co ban theo screenshot
- Base style cho body, root

## 3) App layer (router + providers)

### `src/app/providers/AppProviders.tsx`
- Wrapper provider tong
- Hien tai chi gom `AuthProvider`

### `src/app/providers/AuthProvider.tsx`
- Quan ly state session user (mock)
- Cung cap `login`, `logout`, `isAuthenticated`, `user`
- Persist session qua localStorage (`watchstore.session`)
- Mock token `watchstore.token`

### `src/hooks/useAuth.ts`
- Custom hook lay context auth an toan

### `src/app/router/AppRouter.tsx`
- Dinh nghia toan bo route cua app
- Gom route public (`/dang-nhap`, `/forbidden`)
- Gom route private trong `DashboardLayout`
- Route guard theo role:
  - OWNER: staff, reports, vouchers
  - STAFF+OWNER: products, warranty, customers
  - ADMIN+OWNER: suppliers

### `src/app/router/RouteGuard.tsx`
- Neu chua dang nhap -> redirect login
- Neu sai role -> redirect forbidden

## 4) Route config + shared types

### `src/routes/paths.ts`
- Hang so path route trung tam
- Tranh hard-code duong dan o nhieu noi

### `src/routes/menuConfig.ts`
- Cau hinh menu sidebar
- Moi item co: label, icon, path, allowedRoles

### `src/types/role.ts`
- Khai bao role constant + role type union:
  - `OWNER`, `STAFF`, `ADMIN`

### `src/types/auth.ts`
- `SessionUser` type dung cho auth session

### `src/features/auth/types/auth.ts`
- Kieu payload login feature auth

## 5) Layout + reusable components

### Layout shell
- `src/layouts/DashboardLayout.tsx`
  - Khung trang admin: sidebar + header + content outlet
  - Ho tro mobile toggle sidebar

- `src/components/layout/AppSidebar.tsx`
  - Sidebar co logo store + menu theo role
  - Hien user card ben duoi

- `src/components/layout/AppHeader.tsx`
  - Topbar co search + bell icon + mobile menu button

- `src/components/layout/PageHeader.tsx`
  - Header reusable cho moi page (title, subtitle, action)

### UI components
- `src/components/ui/Button.tsx`
  - Nut co variant: primary/secondary/danger/ghost

- `src/components/ui/SearchInput.tsx`
  - O tim kiem co icon search

- `src/components/ui/FormField.tsx`
  - Wrapper label + required mark + error message

- `src/components/ui/ConfirmModal.tsx`
  - Modal xac nhan (dang dung cho delete)

- `src/components/ui/StatusBadge.tsx`
  - Badge trang thai voi tone mau

### Data display
- `src/components/data-display/DataTable.tsx`
  - Bang generic: header columns + body + footer

- `src/components/data-display/Pagination.tsx`
  - Phan trang don gian (Truoc/Sau)

### Feedback states
- `src/components/feedback/LoadingState.tsx`
- `src/components/feedback/EmptyState.tsx`
- `src/components/feedback/ErrorState.tsx`
- `src/components/feedback/FeaturePlaceholder.tsx`

## 6) Feature Auth

### `src/features/auth/schemas/loginSchema.ts`
- Zod schema validate form login
- Rule: email format, password min len, role required

### `src/features/auth/pages/LoginPage.tsx`
- Form dang nhap mock role
- Dung `react-hook-form` + `zodResolver`
- Dang nhap xong redirect dashboard

### `src/features/auth/pages/ForbiddenPage.tsx`
- Trang 403 neu role khong du quyen

## 7) Feature Staff (da hoan thien)

### Types & schema
- `src/features/staff/types/staff.ts`
  - `Staff`, `StaffQuery`, `StaffListResponse`, `StaffCreatePayload`

- `src/features/staff/schemas/staffSchema.ts`
  - Validate: required, email, phone regex, gender, birthDate hop le

### Mock data + service
- `src/features/staff/mock/staffData.ts`
  - Du lieu nhan vien ban dau

- `src/features/staff/api/staffService.ts`
  - Mock async CRUD can thiet:
    - `getStaffList`
    - `createStaff` (co check duplicate email/phone)
    - `deleteStaff`

- `src/mocks/delay.ts`
  - Utility gia lap do tre API

### Hook + components + pages
- `src/features/staff/hooks/useStaffList.ts`
  - Quan ly fetch list state: loading/error/data/total
  - Co `reload` va `onDelete`

- `src/features/staff/components/StaffForm.tsx`
  - Form reusable cho tao/sua (hien dung cho create)

- `src/features/staff/pages/StaffListPage.tsx`
  - Danh sach, search, pagination, delete confirm
  - Hien thi loading/empty/error
  - Nut them nhan vien

- `src/features/staff/pages/StaffCreatePage.tsx`
  - Form tao nhan vien moi
  - Nut quay lai
  - Submit -> create -> thong bao -> ve list

## 8) Cac feature dang placeholder

Nhung file nay da co route va khung, nhung chua co CRUD chi tiet:
- `src/features/dashboard/pages/DashboardPage.tsx`
- `src/features/products/pages/ProductsPage.tsx`
- `src/features/warranty/pages/WarrantyPage.tsx`
- `src/features/customers/pages/CustomersPage.tsx`
- `src/features/suppliers/pages/SuppliersPage.tsx`
- `src/features/reports/pages/ReportsPage.tsx`
- `src/features/vouchers/pages/VouchersPage.tsx`

## 9) Lib + utility

### `src/lib/axiosClient.ts`
- Axios instance dung chung
- Doc token tu localStorage va gan Authorization header

### `src/lib/storage.ts`
- `saveSession`, `getSession`, `clearSession`

### `src/utils/cn.ts`
- Wrapper cho `clsx` de gop class condition

## 10) Data flow hien tai (de AI doc nhanh)

1. User vao app -> `main.tsx` -> `App.tsx`
2. `AppProviders` khoi tao auth context tu localStorage
3. `AppRouter` giai route
4. Route private qua `RouteGuard`
5. Layout dashboard render `AppSidebar` + `AppHeader`
6. Staff pages goi `staffService` (mock async) -> cap nhat UI

## 11) Quy uoc mo rong batch sau

Khi lam module tiep theo, nen giu dung pattern da co o Staff:
- `types` -> `schemas` -> `mock` -> `api` -> `hooks` -> `components` -> `pages`
- List page can co: search + table + loading/empty/error + confirm delete
- Form page can co: back button + validate + disable submit + thong bao ket qua

## 12) Ghi chu nhanh cho nguoi moi vao project

- Neu thay route loi, check lai `paths.ts` truoc
- Neu menu khong hien thi, check role hien tai + `menuConfig.ts`
- Neu auth bi vang session, check key localStorage trong `storage.ts`
- Neu muon doi mock sang API that, thay trong tung file `features/*/api/*Service.ts`

