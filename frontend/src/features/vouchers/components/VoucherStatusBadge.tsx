import { StatusBadge } from '@/components/ui/StatusBadge'
import type { VoucherStatus } from '@/features/vouchers/types/voucher'

const STATUS_LABELS: Record<VoucherStatus, string> = {
  ACTIVE: 'Dang hoat dong',
  EXPIRED: 'Het han',
  USED_UP: 'Da dung het',
}

const STATUS_TONES: Record<VoucherStatus, 'success' | 'warning' | 'danger'> = {
  ACTIVE: 'success',
  EXPIRED: 'warning',
  USED_UP: 'danger',
}

interface VoucherStatusBadgeProps {
  status: VoucherStatus
}

export function VoucherStatusBadge({ status }: VoucherStatusBadgeProps) {
  return <StatusBadge label={STATUS_LABELS[status]} tone={STATUS_TONES[status]} />
}

