"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react"

interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
}

export function AdminTable({
  columns,
  data,
  total,
  page,
  pages,
  onPageChange,
  searchable,
  onSearch,
}: {
  columns: Column[]
  data: any[]
  total: number
  page: number
  pages: number
  onPageChange: (page: number) => void
  searchable?: boolean
  onSearch?: (query: string) => void
}) {
  const [search, setSearch] = useState("")

  return (
    <div>
      {searchable && onSearch && (
        <div className="relative mb-3 max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); onSearch(e.target.value) }}
            placeholder="Search..."
            className="w-full rounded-lg border border-purple-200 bg-white/70 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-purple-400 dark:border-zinc-600 dark:bg-zinc-800/70 dark:text-zinc-200"
          />
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-purple-200/60 dark:border-zinc-700/60">
        <table className="w-full text-left text-xs">
          <thead className="bg-purple-50/70 dark:bg-zinc-800/70">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-3 py-2.5 font-semibold text-zinc-600 dark:text-zinc-400">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-100/60 dark:divide-zinc-700/50">
            {data.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-3 py-8 text-center text-zinc-400">No data found</td></tr>
            ) : (
              data.map((row, i) => (
                <tr key={row.id || i} className="hover:bg-purple-50/30 dark:hover:bg-zinc-800/30">
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-2.5 text-zinc-700 dark:text-zinc-300">
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[10px] text-zinc-400">{total} total</p>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="rounded-lg border border-purple-200 p-1.5 text-zinc-500 hover:bg-purple-50 disabled:opacity-30 dark:border-zinc-700"><ChevronLeft size={13} /></button>
            <span className="px-2 text-[10px] text-zinc-500">{page} / {pages}</span>
            <button disabled={page >= pages} onClick={() => onPageChange(page + 1)} className="rounded-lg border border-purple-200 p-1.5 text-zinc-500 hover:bg-purple-50 disabled:opacity-30 dark:border-zinc-700"><ChevronRight size={13} /></button>
          </div>
        </div>
      )}
    </div>
  )
}
