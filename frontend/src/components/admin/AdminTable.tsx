export function AdminTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-grey-200 bg-white">
      <table className="w-full min-w-[640px] text-sm">{children}</table>
    </div>
  );
}

export function AdminTableHead({ columns }: { columns: string[] }) {
  return (
    <thead>
      <tr className="border-b border-grey-200 bg-grey-50 text-left text-xs font-semibold uppercase tracking-wide text-grey-500">
        {columns.map((col) => (
          <th key={col} className="px-4 py-3">
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function AdminEmptyRow({ colSpan, message = '暂无数据' }: { colSpan: number; message?: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-grey-500">
        {message}
      </td>
    </tr>
  );
}
