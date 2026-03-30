import { Button } from '@/components/ui/Button'

interface ConfirmModalProps {
  open: boolean
  title: string
  description: string
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmModal({ open, title, description, onConfirm, onClose }: ConfirmModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={onClose} variant="secondary">
            Huy
          </Button>
          <Button onClick={onConfirm} variant="danger">
            Xoa
          </Button>
        </div>
      </div>
    </div>
  )
}

