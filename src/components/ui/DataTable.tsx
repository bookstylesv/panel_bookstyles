import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
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
  caption,
  emptyState = "Sin datos disponibles",
}: {
  columns: TableColumn[];
  rows: TableRow[];
  caption?: ReactNode;
  emptyState?: ReactNode;
}) {
  const antdColumns: ColumnsType<TableRow> = columns.map((col, colIndex) => ({
    key: col.key,
    dataIndex: col.key,
    title: col.title,
    align: col.align,
    render: (_: unknown, row: TableRow) => row.cells[colIndex],
  }));

  return (
    <div>
      {caption ? (
        <div className="data-table__caption">{caption}</div>
      ) : null}
      <Table
        size="small"
        columns={antdColumns}
        dataSource={rows}
        rowKey="key"
        pagination={false}
        locale={{ emptyText: emptyState }}
      />
    </div>
  );
}
