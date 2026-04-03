# Staff Module Changelog (Frontend) - AI Reference

## 1) Muc tieu
Tai lieu nay mo ta phien ban moi cua quan ly nhan vien, duoc dong bo theo pattern cua customer management.

Nguyen tac:
- Table read-only.
- Action co confirm cho thao tac nguy hiem.
- Khong dung mock fallback.
- Chi OWNER duoc quan ly staff.

---

## 2) Hanh vi hien tai

### 2.1 Table staff
- Cot hien thi: `id`, `name`, `phone`, `email`, `address`, `gender`, `thao tac`.
- Khong con form them/sua trong trang list.
- Search theo ten/email/phone.

### 2.2 Action staff
- `Xem chi tiet`
- `Lock/Unlock` (thay cho update)
- `Delete` (co confirm)

### 2.3 Detail staff
- Hien thi theo du lieu backend:
  - id, username, fullName, email, phone, address, gender, role, isActive, createdAt.
- Khong giu field UI du thua.

---

## 3) Quyen truy cap

Chi OWNER duoc thao tac quan ly nhan vien:
- FE route o namespace owner (`/owner/staff`, `/owner/staff/:id`).
- BE service lock/unlock va list theo role duoc buoc OWNER.

---

## 4) API backend duoc dung

Frontend (`adminService`) dang su dung:
- `GET /users/role/STAFF`
- `GET /users/{id}`
- `PATCH /users/{id}/lock`
- `PATCH /users/{id}/unlock`
- `DELETE /users/{id}`

Khong co fallback mock:
- `list` fail -> `[]`
- `detail` fail -> `null`
- `lock/unlock/delete` fail -> throw error + toast

---

## 5) File da thay doi

### Frontend
- `src/features/owner/pages/OwnerStaffPage.tsx`
- `src/features/owner/pages/OwnerStaffDetailPage.tsx`
- `src/services/adminService.ts`
- `src/shared/constants/routes.ts`
- `src/app/router/AppRouter.tsx`

### Backend
- `oose-be/Project-CNPM/demo/src/main/java/com/example/demo/controllers/UserController.java`
- `oose-be/Project-CNPM/demo/src/main/java/com/example/demo/services/UserService.java`
- `oose-be/Project-CNPM/demo/src/main/java/com/example/demo/dtos/response/UserResponse.java`

---

## 6) Kiem tra nhanh

- [ ] Owner vao `Quan ly nhan vien` thay dung cot va action.
- [ ] Lock/Unlock co dialog confirm, thao tac xong refresh list.
- [ ] Delete co dialog confirm, thao tac xong refresh list.
- [ ] Detail mo dung route `/owner/staff/:id`.
- [ ] Goi API loi hien toast error, khong hien success ao.
- [ ] User bi lock khong the authenticate.

---

## 7) Ghi chu
`get_errors` trong IDE co the tre cache doi voi TypeScript language service. Neu gap canh bao stale ve method moi cua `adminService`, hay reload TS service/IDE; build `tsc` la nguon xac nhan chinh.

