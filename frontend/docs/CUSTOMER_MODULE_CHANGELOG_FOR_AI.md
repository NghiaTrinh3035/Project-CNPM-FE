# Customer Module Changelog (Frontend) - AI Reference

## 1) Muc tieu tai lieu
Tai lieu nay tong hop chi tiet tat ca thay doi da thuc hien cho module `Customer` trong frontend moi (`oose-ui/Project-CNPM-UI/frontend`).
Muc dich:
- Lam nguon tham khao cho AI khi sua cac module khac (Staff, Supplier, Voucher, ...).
- Giu logic, quyet dinh ky thuat, va cac bai hoc de tranh lap lai loi.
- Cung cap checklist test va guideline de replicate pattern CRUD dung chuan backend.

---

## 2) Yeu cau goc tu user (da implement)
1. Table Customer chi hien thi cac field:
   - `id`, `name`, `phone`, `email`, `address`, `gender`, `thao tac`.
2. Thao tac tren table:
   - `view detail`, `update`, `delete`.
3. Trang detail:
   - Hien thi day du field entity backend (khong du field).
   - Bo cac field du: `so don hang`, `tong chi tieu`.
4. Search:
   - Giu nguyen logic tim kiem (khong thay doi hanh vi tim kiem).
5. Form:
   - Tham khao form them moi trong `frontend-old`.
   - `create` va `update` dung chung 1 form.
6. Delete:
   - Bat buoc confirm truoc khi xoa.
7. Table list:
   - O che do read-only (khong inline edit trong table).
8. Phan quyen:
   - Staff va Owner deu CRUD duoc (quan ly song song).
9. Sau cung:
   - Loai bo mock customer; neu khong get duoc du lieu thi de danh sach rong.
10. Validate:
   - Validate dung khi create/update; hien thi toast loi dung khi tao that bai.

---

## 3) Cac file da thay doi / tao moi

### 3.1 Files tao moi
- `src/features/customers/schemas/customerSchema.ts`
- `src/features/customers/components/CustomerForm.tsx`
- `docs/CUSTOMER_MODULE_CHANGELOG_FOR_AI.md` (file nay)

### 3.2 Files cap nhat
- `src/services/adminService.ts`
- `src/features/staff/pages/StaffCustomersPage.tsx`
- `src/features/owner/pages/OwnerCustomersPage.tsx`
- `src/features/staff/pages/StaffCustomerDetailPage.tsx`
- `src/features/owner/pages/OwnerCustomerDetailPage.tsx`
- `src/shared/ui/select.tsx`

---

## 4) Thay doi chi tiet theo nhom

## A. UI danh sach Customer (Staff + Owner)

### A1. Staff page
File: `src/features/staff/pages/StaffCustomersPage.tsx`

Da chinh:
- Table cot duoc chuan hoa:
  - `ID`, `Name`, `Phone`, `Email`, `Address`, `Gender`, `Thao tac`.
- Search logic duoc giu nguyen y nghia:
  - Van filter theo text gom ten + email + phone.
- Them action button:
  - `Xem` -> vao detail route.
  - `Update` -> mo dialog form dung chung.
  - `Delete` -> mo dialog confirm roi moi xoa.
- Them dialog form create/update:
  - Nut `Them khach hang` mo form mode create.
  - Nut `Update` mo form mode update voi `initialValues`.
- Read-only list:
  - Khong co inline input trong row table.

### A2. Owner page
File: `src/features/owner/pages/OwnerCustomersPage.tsx`

Da chinh dong bo voi Staff:
- Cot table va action giong Staff.
- CRUD tuong tu.
- Co confirm xoa.
- Co dialog dung chung form create/update.

---

## B. Trang detail Customer (Staff + Owner)

### B1. Staff detail
File: `src/features/staff/pages/StaffCustomerDetailPage.tsx`

Da bo:
- `So don hang`
- `Tong chi tieu`

Da giu/hien thi:
- `Ma khach hang`, `Tai khoan`, `Ho va ten`, `Email`, `So dien thoai`, `Dia chi`,
- `Gioi tinh`, `Vai tro`, `Trang thai`, `Avatar`, `Ngay tao`.

### B2. Owner detail
File: `src/features/owner/pages/OwnerCustomerDetailPage.tsx`

Thay doi tuong tu Staff detail.

---

## C. Form dung chung create/update

### C1. Schema
File: `src/features/customers/schemas/customerSchema.ts`

Da tao:
- `customerCreateSchema`
  - Validate: `username`, `password`, `fullName`, `email`, `phone`, `address`, `gender`.
- `customerUpdateSchema`
  - Validate update (khong bat buoc password).
- Types:
  - `CustomerCreateFormValues`
  - `CustomerUpdateFormValues`
  - `CustomerFormValues`

### C2. Shared Form
File: `src/features/customers/components/CustomerForm.tsx`

Da tao:
- Component form dung chung cho 2 mode:
  - `mode: create | update`
- Neu mode `create`:
  - Hien `username`, `password`.
- Neu mode `update`:
  - An `password`, van co cac field chung.
- Validate bang `zodResolver` theo mode.
- Hien thi loi truong (field-level error) + `submitError`.
- Co 2 button:
  - `Huy`
  - `Them moi` / `Cap nhat`.

---

## D. API integration va phan quyen (quan trong nhat)

### D1. Van de phat hien
Ban dau frontend CRUD customer qua endpoint `/api/users/**` nen:
- Owner update/delete duoc.
- Staff bi chan boi `UserService` backend (chi owner hoac self).

### D2. Fix chuan
File: `src/services/adminService.ts`

Da chuyen customer CRUD sang endpoint dung domain:
- List: `GET /customers?page=0&size=500`
- Detail: `GET /customers/{id}`
- Create: `POST /customers`
- Update: `PUT /customers/{id}`
- Delete: `DELETE /customers/{id}`

Ly do:
- Backend `CustomerController` + `CustomerService` da mo dung policy cho STAFF/OWNER.
- Khop voi SecurityConfig cho `/api/customers/**`.

### D3. Rule payload
Create payload gui:
- `username`, `password`, `fullName`, `email`, `phone`, `address`, `gender`

Update payload gui:
- `fullName`, `email`, `phone`, `address`, `gender`

Luu y:
- Khong gui role linh tinh trong update customer.
- Mapping response tiep tuc qua `mapBackendUser`.

---

## E. Error handling + Toast behavior

### E1. Van de phat hien
Truoc day khi create/update loi backend, service co fallback mock -> UI co the bao success nhung du lieu khong luu tren backend.

### E2. Fix da ap dung
File: `src/services/adminService.ts`

- Customer khong con fallback mock cho CRUD.
- Khi API loi:
  - Throw error message de page bat va hien thi toast.
- Helper parse loi API:
  - uu tien `response.data.message`
  - fallback message mac dinh.

### E3. Toast loi
Files:
- `src/features/staff/pages/StaffCustomersPage.tsx`
- `src/features/owner/pages/OwnerCustomersPage.tsx`

Da them `onError` cho create mutation:
- `toast.error(error.message)`

Ket qua:
- Neu tao khong duoc => thong bao loi ro rang.
- Khong con hien thong bao success gia.

---

## F. Remove mock cho customer theo yeu cau moi

File: `src/services/adminService.ts`

Da chinh:
- `listCustomers()`:
  - Neu API fail => `return []` (danh sach rong).
- `getCustomerById()`:
  - Neu API fail => `return null`.
- `create/update/delete customer`:
  - Neu API fail => throw error, KHONG thao tac mock DB.

Ket qua:
- Nguon su that duy nhat cho customer la backend.
- Dung dung yeu cau user: khong get duoc data thi de rong.

---

## G. Bug validate gioi tinh (FEMALE/OTHER bi bao sai)

### G1. Nguyen nhan
`Select` component khong forward `ref`, dan den React Hook Form register field select khong on dinh.
He qua: chon `FEMALE` hoac `OTHER` van co the bi validator bao sai `Vui long chon gioi tinh`.

### G2. Fix
File: `src/shared/ui/select.tsx`

- Chuyen `Select` sang `forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>`.
- Truyen `ref` vao `<select>`.
- Dat `displayName`.

Ket qua:
- Gender value duoc bind dung voi RHF.
- Validate create/update hoat dong dung.

---

## 5) Pattern tai su dung cho module khac (AI guideline)

Khi sua module CRUD khac, uu tien pattern nay:

1. **Dung endpoint dung bounded-context**
   - VD: Supplier thi goi `/suppliers/**`, Warranty goi `/warranties/**`.
   - Tranh dung endpoint generic `/users/**` neu co endpoint domain rieng.

2. **Form create/update dung chung + schema theo mode**
   - Tranh duplicate UI va validation drift.

3. **Khong fallback mock cho du lieu quan ly backend-authoritative**
   - Neu team uu tien su that backend, tra list rong / throw loi ro rang.

4. **Toast success/failed ro rang**
   - Success chi khi API success that.
   - Failure parse message backend roi toast.error.

5. **Read-only table + action explicit**
   - Tranh inline edit neu requirement muon control theo dialog.

6. **Confirm truoc delete**
   - Bao ve thao tac pha huy.

7. **Shared UI component phai compatible voi RHF**
   - Input/Select can support `ref`.

---

## 6) Checklist test de AI/Dev verify khi sua module tuong tu

### CRUD flow
- [ ] List load dung data backend.
- [ ] Search hoat dong nhu requirement (khong vo tinh thay doi behavior).
- [ ] Create success -> row moi xuat hien.
- [ ] Create fail (invalid data) -> hien field error/toast error, khong success.
- [ ] Update success -> row thay doi dung.
- [ ] Update fail -> toast error ro rang.
- [ ] Delete can confirm truoc khi xoa.
- [ ] Delete success -> row bien mat.
- [ ] Delete fail -> toast error ro rang.

### Validation
- [ ] Username/password validate dung create mode.
- [ ] Gender chon MALE/FEMALE/OTHER deu pass khi hop le.
- [ ] Phone validate theo regex VN neu co yeu cau.

### Permission
- [ ] Staff co the CRUD dung theo policy backend.
- [ ] Owner co the CRUD dung theo policy backend.

### No mock fallback
- [ ] Tat backend endpoint customer -> list tra rong.
- [ ] Tao/sua/xoa khi backend loi -> khong tao du lieu ao tren UI.

---

## 7) Command da dung de verify (reference)
```powershell
Push-Location "C:\Users\ADMIN\Documents\workshop\oose\oose-ui\Project-CNPM-UI\frontend"
npm run build
Pop-Location
```

---

## 8) Luu y ky thuat / risk hien tai
1. Message loi backend co the khac format theo env; `toApiErrorMessage` dang uu tien `message`/`error`.
2. List customer dang lay `size=500`; neu data lon can chuyen sang paging that.
3. Search hien tai la client-side filter tren tap da load; neu data lon nen doi sang backend search endpoint.

---

## 9) Ket luan
Module Customer da duoc chuan hoa theo yeu cau:
- UI table/detal/form dung requirement.
- CRUD chay dung endpoint `/customers/**`.
- Staff va Owner dong bo policy.
- Validate dung va toast loi dung.
- Khong con mock fallback cho customer; API fail thi list rong / thao tac fail co thong bao.

Tai lieu nay la baseline de AI ap dung cho module CRUD tiep theo.

