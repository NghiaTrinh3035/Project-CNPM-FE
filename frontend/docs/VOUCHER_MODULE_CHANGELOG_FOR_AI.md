# Voucher Module Changelog (Frontend) - AI Reference

## 1) Muc tieu
Tai lieu nay mo ta baseline moi cho module quan ly voucher o khu vuc Owner.

Nguyen tac:
- Chi OWNER duoc truy cap va thao tac.
- Table read-only + action theo row.
- Co search, pagination, create/update/delete (delete co confirm).
- Validate day du o form, thong bao toast ro rang.
- Khong fallback mock cho CRUD owner (tranh success ao).

---

## 2) Hanh vi hien tai

### 2.1 Danh sach voucher
- Cot table: `id`, `ma code`, `% giam`, `so lan su dung`, `so luong`, `status`, `tao luc`, `valid from`, `valid to`, `thao tac`.
- Co o tim kiem theo ma voucher.
- Co phan trang server-side (`page`, `size`) va doi `pageSize`.

### 2.2 Thao tac
- `Them moi` (mo dialog).
- `Sua` (mo dialog prefill).
- `Xoa` (co dialog xac nhan).
- Khong co man chi tiet voucher trong owner list flow.

### 2.3 Validate + thong bao
- Validate schema voi Zod:
  - `code`: 4-50 ky tu.
  - `discountPercent`: so nguyen 1-100.
  - `quantity`: so nguyen >= 1.
  - `validTo` phai sau `validFrom`.
- Loi validate hien duoi tung field.
- Loi API -> toast error message.
- Success API -> toast success.

---

## 3) File da thay doi

### Frontend
- `src/features/owner/pages/OwnerVouchersPage.tsx`
- `src/features/owner/components/OwnerVoucherFormDialog.tsx`
- `src/features/owner/schemas/voucherSchema.ts`
- `src/services/adminService.ts`
- `src/services/api/backendMappers.ts`
- `src/shared/types/domain.ts`
- `src/shared/ui/table.tsx`
- `src/mocks/data/commerce.ts`
- `src/test/routeGuard.test.tsx`

### Backend lien quan (tham chieu)
- `oose-be/Project-CNPM/demo/src/main/java/com/example/demo/controllers/VoucherController.java`
- `oose-be/Project-CNPM/demo/src/main/java/com/example/demo/services/VoucherService.java`
- `oose-be/Project-CNPM/demo/src/main/java/com/example/demo/config/SecurityConfig.java`

---

## 4) API owner dang dung
- `GET /vouchers` (search + pagination)
- `POST /vouchers`
- `PUT /vouchers/{id}`
- `DELETE /vouchers/{id}`

Ghi chu:
- FE map theo field backend: `code`, `discountPercent`, `quantity`, `status`, `validFrom`, `validTo`.
- `usedCount` va `createdAt` duoc normalize trong mapper de hien thi table on dinh.

---

## 5) Rule tai su dung
1. Domain owner CRUD phai backend-authoritative.
2. Action nguy hiem bat buoc confirm dialog.
3. Form khong submit neu schema fail.
4. Toast success chi sau khi API thanh cong that.
5. Route owner phai duoc guard role OWNER.

---

## 6) Checklist verify
- [ ] OWNER vao `owner/vouchers` thay dung cot va du lieu.
- [ ] STAFF truy cap route owner vouchers bi chan (forbidden).
- [ ] Search theo code hoat dong.
- [ ] Pagination next/prev + doi page size dung.
- [ ] Tao voucher voi du lieu hop le thanh cong.
- [ ] Tao/sua voi du lieu sai hien loi validate tung field.
- [ ] Xoa voucher co confirm va refresh list.
- [ ] API loi hien toast error, khong fake success.

