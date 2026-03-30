import type { Staff } from '@/features/staff/types/staff'

export const initialStaffData: Staff[] = [
  {
    id: '1',
    username: 'an.nguyen',
    fullName: 'Nguyen Van An',
    email: 'an.nguyen@watchstore.vn',
    phone: '0912345678',
    address: null,
    gender: 'MALE',
    role: 'STAFF',
    staffId: 'S001',
    joinDate: '2024-01-15T00:00:00.000Z',
    createdAt: '2024-01-10T00:00:00.000Z',
  },
  {
    id: '2',
    username: 'binh.tran',
    fullName: 'Tran Thi Binh',
    email: 'binh.tran@watchstore.vn',
    phone: '0923456789',
    address: null,
    gender: 'FEMALE',
    role: 'STAFF',
    staffId: 'S002',
    joinDate: '2024-03-02T00:00:00.000Z',
    createdAt: '2024-02-27T00:00:00.000Z',
  },
  {
    id: '3',
    username: 'cuong.le',
    fullName: 'Le Hoang Cuong',
    email: 'cuong.le@watchstore.vn',
    phone: '0934567890',
    address: null,
    gender: 'MALE',
    role: 'STAFF',
    staffId: 'S003',
    joinDate: '2023-11-20T00:00:00.000Z',
    createdAt: '2023-11-15T00:00:00.000Z',
  },
]

