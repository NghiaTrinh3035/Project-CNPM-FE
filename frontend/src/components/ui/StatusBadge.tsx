import { cn } from '@/utils/cn'

interface StatusBadgeProps {
  label: string
  tone?: 'default' | 'success' | 'warning' | 'danger'
}

const toneStyles = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
}

export function StatusBadge({ label, tone = 'default' }: StatusBadgeProps) {
  return <span className={cn('rounded-full px-2 py-1 text-xs font-semibold', toneStyles[tone])}>{label}</span>
}

