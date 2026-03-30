import axios from 'axios'

export interface ApiErrorBody {
  message?: string
  details?: Record<string, string> | string
}

function normalizeText(value: string | undefined | null): string | null {
  if (!value) {
    return null
  }
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function parseDetails(details: ApiErrorBody['details']): string | null {
  if (!details) {
    return null
  }

  if (typeof details === 'string') {
    return normalizeText(details)
  }

  const messages = Object.values(details)
    .map((value) => normalizeText(value))
    .filter((value): value is string => value !== null)

  if (messages.length === 0) {
    return null
  }

  return messages.join('; ')
}

export function parseApiErrorMessage(error: unknown, fallbackMessage: string): string {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return fallbackMessage
  }

  const status = error.response?.status
  const message = normalizeText(error.response?.data?.message)
  const details = parseDetails(error.response?.data?.details)

  if (status === 400) {
    return details ?? message ?? 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.'
  }

  if (status === 409) {
    return message ?? details ?? 'Dữ liệu bị trùng hoặc xung đột. Vui lòng kiểm tra lại.'
  }

  if (status === 403) {
    return message ?? 'Bạn không có quyền thực hiện thao tác này.'
  }

  return details ?? message ?? fallbackMessage
}

