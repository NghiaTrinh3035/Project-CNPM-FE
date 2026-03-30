import axios from 'axios'
import { axiosClient } from '@/lib/axiosClient'
import type { LoginRequest, LoginResponse } from '@/features/auth/types/auth'

interface ErrorResponseBody {
  message?: string
}

function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ErrorResponseBody>(error)) {
    return error.response?.data?.message ?? 'Dang nhap that bai. Vui long thu lai.'
  }
  return 'Dang nhap that bai. Vui long thu lai.'
}

export async function loginWithApi(payload: LoginRequest): Promise<LoginResponse> {
  try {
    const { data } = await axiosClient.post<LoginResponse>('/auth/login', payload)
    return data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

