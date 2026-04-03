# Customer Module Changelog (Frontend) - AI Reference

## 1) Muc tieu tai lieu
Tai lieu nay tong hop trang thai **hien tai** cua module `Customer` sau khi da chinh sua lai theo yeu cau moi.
Muc dich:
- Lam baseline cho AI/Dev khi sua cac module CRUD khac.
- Giu dung logic FE-BE va policy role (STAFF + OWNER).
- Tranh tai su dung nham cac flow cu da bi thay doi.

---

## 2) Yeu cau da chot va trang thai hien tai

### 2.1 Danh sach customer (table)
Da ap dung:
- Hien thi dung cac cot: `id`, `name`, `phone`, `email`, `address`, `gender`, `thao tac`.
- Table o che do read-only (khong inline edit).
- Search giu nguyen logic hien tai.
- Co phan trang FE va goi dung phan trang backend.

### 2.2 Thao tac tren table
Da ap dung:
- `Xem chi tiet`
- `Lock/Unlock` (thay cho `Update`)
- `Delete` (co confirm truoc khi xoa)

Da bo theo yeu cau moi:
- Nut `Them khach hang` tren man hinh Staff/Owner.
- Flow `Update` customer trong trang quan ly.

### 2.3 Trang chi tiet customer
Da ap dung:
- Hien thi theo entity/response backend, khong giu field du thua.
- Da bo field khong can thiet tren FE detail (vd `Avatar`, va cac field tong hop cu nhu don hang/tong chi tieu neu da ton tai truoc do).

### 2.4 Phan quyen
Da ap dung:
- STAFF va OWNER deu thao tac customer management tren cung endpoint domain `/api/customers/**`.

### 2.5 Validate va thong bao loi
Da ap dung:
- Khong con thong bao success ao khi backend that bai.
- Neu API tao/sua/xoa that bai: throw error + toast loi dung message.

### 2.6 Mock
Da ap dung:
- Da loai bo fallback mock cho customer.
- `list` loi API -> tra danh sach rong.
- `detail` loi API -> `null`.
- `create/update/delete` loi API -> throw error.

---

## 3) File da thay doi

## 3.1 Frontend
- `src/features/staff/pages/StaffCustomersPage.tsx`
- `src/features/owner/pages/OwnerCustomersPage.tsx`
- `src/features/staff/pages/StaffCustomerDetailPage.tsx`
- `src/features/owner/pages/OwnerCustomerDetailPage.tsx`
- `src/services/adminService.ts`
- `src/features/customers/components/CustomerForm.tsx` (van ton tai, nhung khong con duoc goi tu Owner/Staff customer list)
- `src/features/customers/schemas/customerSchema.ts`
- `src/shared/ui/select.tsx`

## 3.2 Backend lien quan (de AI hieu full flow)
- `oose-be/Project-CNPM/demo/src/main/java/com/example/demo/controllers/CustomerController.java`
- `oose-be/Project-CNPM/demo/src/main/java/com/example/demo/services/CustomerService.java`
- `oose-be/Project-CNPM/demo/src/main/java/com/example/demo/entities/User.java`
- `oose-be/Project-CNPM/demo/src/main/java/com/example/demo/dtos/response/CustomerResponse.java`
- `oose-be/Project-CNPM/demo/src/main/java/com/example/demo/dtos/DtoMapper.java`
- `oose-be/Project-CNPM/demo/src/main/java/com/example/demo/config/SecurityConfig.java`
- `oose-be/Project-CNPM/demo/src/main/java/com/example/demo/services/AuthService.java`
- `oose-be/Project-CNPM/demo/src/main/java/com/example/demo/config/JwtAuthenticationFilter.java`
- `oose-be/Project-CNPM/demo/src/main/java/com/example/demo/config/SystemBotInitializer.java`

---

## 4) Thay doi chi tiet

## A. Staff/Owner Customer List da chuyen sang lock/unlock

### A1. UI behavior moi
- Khong con nut `Them khach hang` tren list.
- Khong con action `Update` tren list.
- Action thay the:
  - `Lock` neu customer dang active.
  - `Unlock` neu customer dang inactive.
- Lock/Unlock deu co confirm dialog.
- `Delete` van co confirm dialog.

### A2. API duoc goi tu frontend
Trong `adminService`:
- `GET /customers` (co `page`, `size`)
- `GET /customers/{id}`
- `DELETE /customers/{id}`
- `PATCH /customers/{id}/lock`
- `PATCH /customers/{id}/unlock`

Ghi chu:
- `createCustomer`/`updateCustomer` helper van con trong service de tuong thich, nhung list UI Staff/Owner hien tai khong expose nut thao tac do.

---

## B. Backend lock/unlock da bo sung day du

### B1. Endpoint moi
`CustomerController` da co:
- `PATCH /api/customers/{id}/lock`
- `PATCH /api/customers/{id}/unlock`

### B2. Service moi
`CustomerService` da co:
- `lockCustomer(id)`
- `unlockCustomer(id)`
- ham noi bo cap nhat `isActive`

### B3. Model + DTO
- Entity `User` co them field `isActive`.
- `CustomerResponse` co field `isActive`.
- `DtoMapper.toCustomerResponse` da map `isActive`.

### B4. Security/Auth
- `SecurityConfig` cho phep STAFF + OWNER goi `PATCH /api/customers/**`.
- User bi lock (`isActive = false`) khong duoc authenticate qua UserDetails.
- `AuthService.login` tra fail neu user bi lock.
- `JwtAuthenticationFilter` bo qua user bi lock.

### B5. Luu y quan trong ve null `isActive`
Da fix de tranh loi `must not be null`:
- `User.isActive` duoc dat `@Builder.Default`.
- them `@PrePersist` + `@PreUpdate` de tu set true neu null.
- `SystemBotInitializer` set ro `isActive(true)` khi tao bot bang builder.

---

## C. Detail page duoc don dep field

Ca 2 trang detail:
- `src/features/staff/pages/StaffCustomerDetailPage.tsx`
- `src/features/owner/pages/OwnerCustomerDetailPage.tsx`

Da bo field khong thuoc du lieu backend can thiet cho customer detail.
Ket qua: trang chi tiet sat hon voi `CustomerResponse`.

---

## D. Validate + toast + khong mock

### D1. Validate form
- RHF + Zod schema da duoc ap dung cho customer form.
- Bug gioi tinh (`FEMALE/OTHER` bi bao sai) da xu ly bang cach sua `Select` support `ref` (`forwardRef`).

### D2. Toast behavior
- API fail -> toast error.
- Chi toast success khi API success that.

### D3. No mock fallback
Trong `adminService` cho customer:
- `list` fail -> tra rong.
- `detail` fail -> `null`.
- `create/update/delete/lock/unlock` fail -> throw error.

---

## 5) Rule tai su dung cho module khac

1. Dung endpoint theo domain (`/suppliers/**`, `/vouchers/**`, ...), tranh route generic sai policy.
2. Tach ro UI policy va API capability (co endpoint khong co nghia la phai expose tren UI).
3. Action nguy hiem (`delete`, `lock/unlock`) bat buoc confirm.
4. Backend-authoritative data: khong fallback mock de tranh UI success ao.
5. Parse loi backend thong nhat, toast ro rang.
6. Shared UI input/select phai tuong thich RHF (`ref`, controlled/uncontrolled behavior).

---

## 6) Checklist verify

### 6.1 Customer list
- [ ] Khong hien thi nut them moi.
- [ ] Cot table dung requirement.
- [ ] Search giu dung behavior.
- [ ] Phan trang hoat dong dung voi backend.

### 6.2 Action
- [ ] Co `Xem`, `Lock/Unlock`, `Delete`.
- [ ] Lock/Unlock co confirm va cap nhat lai list.
- [ ] Delete co confirm va cap nhat lai list.

### 6.3 Permission
- [ ] STAFF lock/unlock/delete duoc theo policy.
- [ ] OWNER lock/unlock/delete duoc theo policy.

### 6.4 Error path
- [ ] Tat backend customer API -> list rong.
- [ ] Goi lock/unlock/delete loi -> toast error, khong fake success.

### 6.5 Auth lock behavior
- [ ] User bi lock khong login duoc.
- [ ] JWT request cua user bi lock khong duoc gan auth context.

---

## 7) Lenh verify da chay

Backend compile (da verify pass):
```powershell
Set-Location "C:\Users\ADMIN\Documents\workshop\oose\oose-be\Project-CNPM\demo"
.\mvnw.cmd -q -DskipTests compile
```

Frontend build:
- Hien tai co loi TypeScript ton tai san o module khac (`orderService` unused symbols), khong phai loi do customer module lock/unlock.

---

## 8) Tom tat trang thai hien tai
Customer management tren Staff/Owner da duoc doi tu CRUD day du sang policy quan tri read-only + action control:
- **Khong them moi tren list**
- **Khong update profile customer tren list**
- **Dung lock/unlock de quan ly truy cap**
- **Delete co confirm**
- **Dung `/api/customers/**` de STAFF va OWNER dong bo policy**
- **Khong mock fallback cho customer**

Tai lieu nay la baseline moi de AI sua module khac theo cung pattern quan tri.
