import { axiosClient } from '@/lib/axiosClient'
import { parseApiErrorMessage } from '@/lib/apiError'
import type {
  SpringPageResponse,
  Staff,
  StaffCreatePayload,
  StaffListResponse,
  StaffQuery,
  StaffUpdatePayload,
} from '@/features/staff/types/staff'

export async function getStaffById(id: string): Promise<Staff> {
  try {
    const { data } = await axiosClient.get<Staff>(`/staff/${id}`)
    return data
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể tải thông tin nhân viên. Vui lòng thử lại.'))
  }
}

export async function createStaff(payload: StaffCreatePayload): Promise<Staff> {
  try {
    const { data } = await axiosClient.post<Staff>('/staff', payload)
    return data
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể tạo nhân viên. Vui lòng thử lại.'))
  }
}

export async function updateStaff(id: string, payload: StaffUpdatePayload): Promise<Staff> {
  try {
    const { data } = await axiosClient.put<Staff>(`/staff/${id}`, payload)
    return data
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể cập nhật nhân viên. Vui lòng thử lại.'))
  }
}

export async function getStaffList(query: StaffQuery): Promise<StaffListResponse> {
  const normalizedKeyword = query.keyword.trim()
  const page = Math.max(query.page - 1, 0)
  const hasKeyword = Boolean(normalizedKeyword)

  try {
    const { data } = hasKeyword
      ? await axiosClient.get<SpringPageResponse<Staff>>('/staff/search', {
          params: {
            keyword: normalizedKeyword,
            page,
            size: query.pageSize,
          },
        })
      : await axiosClient.get<SpringPageResponse<Staff>>('/staff', {
          params: {
            page,
            size: query.pageSize,
          },
        })

    return {
      data: data.content,
      total: data.totalElements,
      page: data.number + 1,
      pageSize: data.size,
    }
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể tải danh sách nhân viên. Vui lòng thử lại.'))
  }
}

export async function deleteStaff(id: string): Promise<void> {
  try {
    await axiosClient.delete(`/staff/${id}`)
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Không thể xóa nhân viên. Vui lòng thử lại.'))
  }
}

