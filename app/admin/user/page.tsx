"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { User } from "@/store/useAuthStore";
import { ListResponse, Paginated } from "../product/type";

import Toolbar from "./_component/toolbar";
import DataTable from "./_component/data-table";
import { columns } from "./_component/columns";

import api from "@/lib/axios"; // khuyến nghị dùng axios instance

function buildQS(sp: Record<string, unknown>) {
  const qs = new URLSearchParams();
  Object.entries(sp).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.set(k, String(v));
  });
  return qs.toString();
}

export default function OrderPage() {
  const searchParams = useSearchParams();
  const spString = searchParams.toString(); // ✅ stable dep

  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 10);

  const query = useMemo(() => {
    return buildQS({
      page,
      limit,
      q: searchParams.get("q"),
      order_status: searchParams.get("order_status"),
      payment_status: searchParams.get("payment_status"),
      payment_method: searchParams.get("payment_method"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, spString]);

  const [paged, setPaged] = useState<Paginated<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function fetchUsers() {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get<ListResponse<User>>(`/user/get-users?${query}`);
        if (!alive) return;

        setPaged(res.data.data as Paginated<User>);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.response?.data?.message ?? e?.message ?? "Fetch failed");
        setPaged(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    fetchUsers();
    return () => {
      alive = false;
    };
  }, [query]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!paged) return <div>No data</div>;

  return (
    <div>
      <Toolbar total={paged.total} />
      <DataTable
        columns={columns}
        data={paged.data}
        limit={limit}
        total={paged.total}
        page={page}
        totalPages={paged.totalPages}
      />
    </div>
  );
}
