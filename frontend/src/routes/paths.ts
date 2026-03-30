export const ROUTES = {
  login: '/dang-nhap',
  dashboard: '/',
  staffList: '/nhan-vien',
  staffCreate: '/nhan-vien/tao-moi',
  staffUpdate: '/nhan-vien/:id/chinh-sua',
  products: '/san-pham',
  productCreate: '/san-pham/tao-moi',
  productUpdate: '/san-pham/:id/chinh-sua',
  productDetail: '/san-pham/:id',
  warranty: '/bao-hanh',
  warrantyCreate: '/bao-hanh/tao-moi',
  warrantyUpdate: '/bao-hanh/:id/chinh-sua',
  warrantyDetail: '/bao-hanh/:id',
  customers: '/khach-hang',
  customerCreate: '/khach-hang/tao-moi',
  customerUpdate: '/khach-hang/:id/chinh-sua',
  customerDetail: '/khach-hang/:id',
  suppliers: '/nha-cung-cap',
  supplierCreate: '/nha-cung-cap/tao-moi',
  supplierUpdate: '/nha-cung-cap/:id/chinh-sua',
  supplierDetail: '/nha-cung-cap/:id',
  reports: '/bao-cao',
  vouchers: '/khuyen-mai',
  voucherCreate: '/khuyen-mai/tao-moi',
  voucherUpdate: '/khuyen-mai/:id/chinh-sua',
  voucherDetail: '/khuyen-mai/:id',
  forbidden: '/forbidden',
} as const

export function getStaffUpdatePath(id: string): string {
  return `/nhan-vien/${id}/chinh-sua`
}

export function getProductUpdatePath(id: string): string {
  return `/san-pham/${id}/chinh-sua`
}

export function getProductDetailPath(id: string): string {
  return `/san-pham/${id}`
}

export function getWarrantyUpdatePath(id: string): string {
  return `/bao-hanh/${id}/chinh-sua`
}

export function getWarrantyDetailPath(id: string): string {
  return `/bao-hanh/${id}`
}

export function getCustomerUpdatePath(id: string): string {
  return `/khach-hang/${id}/chinh-sua`
}

export function getCustomerDetailPath(id: string): string {
  return `/khach-hang/${id}`
}

export function getSupplierUpdatePath(id: string): string {
  return `/nha-cung-cap/${id}/chinh-sua`
}

export function getSupplierDetailPath(id: string): string {
  return `/nha-cung-cap/${id}`
}

export function getVoucherUpdatePath(id: string): string {
  return `/khuyen-mai/${id}/chinh-sua`
}

export function getVoucherDetailPath(id: string): string {
  return `/khuyen-mai/${id}`
}

