import type { ReactNode } from "react";

type TableColumn = {
  key: string;
  title: ReactNode;
  align?: "left" | "center" | "right";
};

type TableRow = {
  key: string;
  cells: ReactNode[];
};

export function DataTable({
  columns,
  rows,
}: {
  columns: TableColumn[];
  rows: TableRow[];
}) {
  return (
    <div className="data-table-shell">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} data-align={column.align ?? "left"}>
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row) => (
              <tr key={row.key}>
                {row.cells.map((cell, index) => (
                  <td key={`${row.key}-${columns[index]?.key ?? index}`} data-align={columns[index]?.align ?? "left"}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="data-table-empty">
                Sin datos disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
