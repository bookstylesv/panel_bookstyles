"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

export function BarberTenantsSearch({ initialSearch }: { initialSearch: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSearch(value: string) {
    const params = new URLSearchParams();
    if (value.trim()) params.set("search", value.trim());
    // Preservar limit, resetear page a 1
    const limit = searchParams.get("limit");
    if (limit) params.set("limit", limit);
    router.push(`/barber/tenants?${params.toString()}`);
  }

  return (
    <Input.Search
      placeholder="Buscar barberia por nombre o slug..."
      defaultValue={initialSearch}
      allowClear
      onSearch={handleSearch}
      style={{ maxWidth: 420 }}
      prefix={<SearchOutlined />}
    />
  );
}
