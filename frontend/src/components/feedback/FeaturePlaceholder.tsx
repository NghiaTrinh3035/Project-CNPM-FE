interface FeaturePlaceholderProps {
  title: string
  description: string
}

export function FeaturePlaceholder({ title, description }: FeaturePlaceholderProps) {
  return (
    <div className="rounded-xl border border-app-border bg-white p-6">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  )
}

