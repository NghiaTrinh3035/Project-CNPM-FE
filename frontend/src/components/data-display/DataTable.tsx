import type { ReactNode } from 'react'

interface DataTableProps {
  columns: string[]
  children: ReactNode
  footer?: ReactNode
}

export function DataTable({ columns, children, footer }: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-app-border bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => (
                <th className="px-4 py-3 font-semibold" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">{children}</tbody>
        </table>
      </div>
      {footer && <div className="border-t border-slate-100 px-4 py-3">{footer}</div>}
    </div>
  )
}

