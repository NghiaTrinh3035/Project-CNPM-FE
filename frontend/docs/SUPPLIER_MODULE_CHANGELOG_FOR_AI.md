# Supplier Module Changelog (Frontend) - AI Reference

## 1) Mục tiêu
Module quản lý nhà cung cấp cho OWNER theo pattern customer/staff/voucher:
- Table read-only + thao tác theo dòng.
- Có thêm mới, sửa, xóa (confirm), tìm kiếm, phân trang.
- Validate đầy đủ ở form và toast rõ ràng.
- Dùng backend thật, không fallback mock cho supplier.
- STAFF không được phép truy cập.

---

## 2) Hành vi hiện tại

### 2.1 Danh sách
- Cột: `Mã nhà cung cấp`, `Tên nhà cung cấp`, `Thông tin liên hệ`, `Địa chỉ`, `Thao tác`.
- Tìm kiếm theo `keyword` (tên/địa chỉ/thông tin liên hệ) với backend.
- Phân trang server-side (`page`, `size`) + đổi `pageSize`.

### 2.2 Thao tác
- `Thêm mới` (dialog).
- `Sửa` (dialog prefill).
- `Xóa` có confirm dialog.
- Không có trang chi tiết supplier.

### 2.3 Validate và thông báo
- Validate frontend bằng Zod:
  - `name`: bắt buộc, tối đa 100 ký tự.
  - `contractInfo`: tùy chọn, tối đa 500 ký tự.
  - `address`: tùy chọn, tối đa 255 ký tự.
- API lỗi hiển thị toast lỗi backend.
- Xóa nhà cung cấp đã có hóa đơn nhập hàng: backend trả lỗi nghiệp vụ.

---

## 3) API đang dùng
- `GET /suppliers`
- `GET /suppliers/search`
- `POST /suppliers`
- `PUT /suppliers/{id}`
- `DELETE /suppliers/{id}`

---

## 4) File đã thay đổi

### Frontend
- `src/features/owner/pages/OwnerSuppliersPage.tsx`
- `src/features/owner/components/OwnerSupplierFormDialog.tsx`
- `src/features/owner/schemas/supplierSchema.ts`
- `src/services/adminService.ts`
- `src/services/api/backendMappers.ts`
- `src/shared/types/domain.ts`
- `src/mocks/data/commerce.ts`
- `src/mocks/data/database.ts`

### Backend
- `oose-be/Project-CNPM/demo/src/main/java/com/example/demo/services/SupplierService.java`

---

## 5) Ghi chú quan trọng
- Route supplier nằm trong namespace owner, được bảo vệ bởi `RouteGuard allowRoles={["OWNER"]}`.
- Security backend đã giới hạn `/api/suppliers/**` cho OWNER.
- Module supplier không còn gọi mock data ở frontend.

