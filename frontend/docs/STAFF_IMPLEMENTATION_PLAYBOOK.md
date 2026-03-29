# Staff Implementation Playbook (FE-first, BE-contract driven)

Tai lieu nay tong hop day du cach da trien khai module `staff` de AI/nguoi dev co the ap dung lai cho `customers`, `products`, ... theo mot quy trinh dong bo, it vo contract.

## 1. Muc tieu va nguyen tac

- Backend la **nguon su that** (source of truth) cho contract API/DTO.
- Frontend phai map 1-1 theo contract BE truoc khi lam UI nang cao.
- Chia rollout thanh tung buoc nho: auth -> read-only -> search -> CRUD -> error handling -> polish UI.
- Khong gop nhieu thay doi lon trong mot buoc neu chua test xong buoc truoc.
- Uu tien **dong bo hanh vi** truoc, sau do moi toi uu UX.

## 2. Contract backend da chot cho Staff

### 2.1 Endpoint

- `GET /staff` -> danh sach phan trang (khong search).
- `GET /staff/search?keyword=...` -> search 1 o, match tren `fullName/email/phone` (OR).
- `GET /staff/{id}` -> lay chi tiet.
- `POST /staff` -> tao moi.
- `PUT /staff/{id}` -> cap nhat.
- `DELETE /staff/{id}` -> xoa.

### 2.2 Role/bao mat

- Staff module BE hien tai yeu cau role `OWNER`.
- Neu token sai quyen -> `403`.

### 2.3 DTO write contract

`StaffCreateRequest`:
- `username` (3-50, required)
- `password` (8-100, required)
- `fullName` (max 80, required)
- `email` (email, required)
- `phone` (regex SDT VN, optional)
- `address` (max 255, optional)
- `gender` (`MALE|FEMALE|OTHER`, optional)
- `staffId` (required, max 30, regex `[A-Za-z0-9_-]{3,30}`)
- `role` (BE default `STAFF`)

`StaffUpdateRequest`:
- khong co `username/password`
- giu cac field con lai: `fullName,email,phone,address,gender,staffId`

### 2.4 DTO read contract (StaffResponse)

- `id, username, fullName, email, phone, address, gender, role, staffId, joinDate, createdAt`

### 2.5 Paging contract (Spring Page)

BE tra ve theo Spring:
- `content`
- `number` (0-based)
- `size`
- `totalElements`

FE map:
- `data = content`
- `page = number + 1`
- `total = totalElements`

## 3. Kien truc FE da dung cho Staff

Thu tu chuan:
1. `types`
2. `schemas`
3. `api`
4. `hooks`
5. `components`
6. `pages`
7. `routes`

Duong dan chinh:
- `src/features/staff/types/staff.ts`
- `src/features/staff/schemas/staffSchema.ts`
- `src/features/staff/api/staffService.ts`
- `src/features/staff/hooks/useStaffList.ts`
- `src/features/staff/components/StaffForm.tsx`
- `src/features/staff/pages/StaffListPage.tsx`
- `src/features/staff/pages/StaffCreatePage.tsx`
- `src/features/staff/pages/StaffUpdatePage.tsx`

Route:
- `src/routes/paths.ts`
- `src/app/router/AppRouter.tsx`

Dung chung:
- `src/lib/axiosClient.ts`
- `src/lib/apiError.ts`

## 4. Quy trinh trien khai da ap dung (theo buoc)

### Buoc A - Noi auth that

- FE dung token that qua `axiosClient` interceptor.
- Xac minh role `OWNER` truoc khi test staff API.

### Buoc B - Chot read-only contract

- Bo mock list cho staff.
- Chuyen list sang goi API that (`/staff`, `/staff/search`).
- Chot cot table theo `StaffResponse` that (`staffId, username, address, createdAt,...`).

### Buoc C - Chot search dung contract

- Tu 3 filter rieng -> chuyen ve 1 `keyword` theo backend.
- Search behavior backend OR tren `fullName/email/phone`.

### Buoc D - Mo lai write flow

- Form create/update map dung DTO write.
- Gender enum dung gia tri BE (`MALE/FEMALE/OTHER`) thay vi label VN.
- `phone/address` duoc normalize: rong -> `null` truoc khi gui payload.

### Buoc E - Chuan hoa error FE

- Tach parser chung `parseApiErrorMessage` trong `src/lib/apiError.ts`.
- Rule:
  - `400`: uu tien `details` -> `message`
  - `409`: uu tien `message`
  - `403`: thong diep quyen
- Form create/update hien thi submit error ro rang ngay tren UI.

### Buoc F - Viet hoa giao dien

- Toan bo text user-facing cua staff da doi sang tieng Viet co dau.
- Khong doi logic/API/ID/route behavior.

## 5. Luat quan trong khi lam module moi (Customer/Product/...)

### 5.1 Luat contract

- Luon doc DTO + Controller + Repository query truoc khi code FE.
- Khong doan field/search behavior dua tren mock UI.
- Neu BE dung enum, FE phai gui dung enum value, label chi de hien thi.

### 5.2 Luat search va paging

- Respect 0-based page cua BE, FE UI co the 1-based.
- Chot ro endpoint fallback:
  - Khong filter -> endpoint list
  - Co filter -> endpoint search
- Neu doi tu nhieu filter sang keyword, uu tien sua BE de tranh FE heuristic.

### 5.3 Luat error

- Khong hardcode 1 thong diep generic cho moi loi.
- Parse `message/details/status` tu response de hien thi dung ngu canh.
- Form submit nen co khu vuc show `submitError` rieng.

### 5.4 Luat rollout

- Lam tung buoc nho, user test xong moi qua buoc tiep.
- Moi buoc deu build/lint de tranh vo day chuyen.

## 6. Pattern copy-paste cho module khac

## 6.1 Type contract

- Tao `Xxx`, `XxxQuery`, `XxxListResponse`, `XxxCreatePayload`, `XxxUpdatePayload`.
- Neu BE tra Spring Page, tao `SpringPageResponse<T>` dung chung.

### 6.2 API service

- Su dung `axiosClient`.
- Day du method:
  - `getXxxList`
  - `getXxxById`
  - `createXxx`
  - `updateXxx`
  - `deleteXxx`
- Bat loi qua `parseApiErrorMessage`.

### 6.3 Hook list

- Quan ly: `data,total,loading,error,reload,onDelete`.
- `fetchData` dung `useCallback` + dependency ro rang.

### 6.4 Form + schema

- Tach schema `create`/`update` neu payload khac nhau.
- FE validate sat BE rule de giam 400.
- Co `submitError` de show loi API.

### 6.5 Page list/create/update

- List page:
  - Search
  - Table
  - Loading/Empty/Error
  - Confirm delete
- Create/Update page:
  - Back button
  - Form submit
  - Alert success + dieu huong

## 7. Cac luu y domain quan trong da gap o Staff

- `fullName` trong entity `User` hien dang `unique = true` (rang buoc DB), nen co the khong cho trung ten.
- `staffId` la unique rieng cua staff.
- `address` trong `User` co annotation `@NotBlank`, nhung flow staff service hien tai co normalize blank->null cho create/update; can thong nhat BE neu muon strict hon.
- Role `ADMIN` co tren FE type nhung BE enum role hien tai la `CUSTOMER|STAFF|OWNER`; can de y khi dong bo toan he thong role.

## 8. Checklist truoc khi merge 1 module moi

- [ ] Da chot contract voi BE (endpoint + request + response + role).
- [ ] FE types map dung DTO.
- [ ] Search/paging map dung hanh vi backend.
- [ ] CRUD payload dung field va enum.
- [ ] Error 400/409/403 hien thi dung thong diep.
- [ ] UI text da Viet hoa (neu module cho nguoi dung VN).
- [ ] Build frontend thanh cong.
- [ ] User test tay cac scenario chinh thanh cong.

## 9. Cach AI nen lam viec cho module tiep theo

Quy trinh de xai lai cho `customers/products/...`:

1. Doc contract BE cua module dich.
2. Liet ke mismatch FE-BE hien tai.
3. Chot read-only truoc (list/search/paging/error).
4. Sau khi user test, mo create/update/delete.
5. Chuan hoa error parser va thong diep UI.
6. Viet hoa text UI.
7. Build/test moi buoc, khong nhay buoc.

## 10. Quick reference file map (Staff)

- `src/features/staff/types/staff.ts`
- `src/features/staff/schemas/staffSchema.ts`
- `src/features/staff/api/staffService.ts`
- `src/features/staff/hooks/useStaffList.ts`
- `src/features/staff/components/StaffForm.tsx`
- `src/features/staff/pages/StaffListPage.tsx`
- `src/features/staff/pages/StaffCreatePage.tsx`
- `src/features/staff/pages/StaffUpdatePage.tsx`
- `src/lib/apiError.ts`
- `src/routes/paths.ts`
- `src/app/router/AppRouter.tsx`

---

Neu can, co the tao them 1 tai lieu sibling cho tung module theo mau nay:
- `frontend/docs/CUSTOMER_IMPLEMENTATION_PLAYBOOK.md`
- `frontend/docs/PRODUCT_IMPLEMENTATION_PLAYBOOK.md`

De AI tai su dung pattern, giu duoc tinh dong bo contract va giam loi hoi quy.

