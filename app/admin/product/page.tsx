"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { columns } from "./columns";
import { ProductDataTable } from "./data-table";
import type { ListResponse, Paginated, Product, Category } from "./type";

import api from "@/lib/axios"; // khuyến nghị dùng axios instance (baseURL sẵn)

function buildQS(sp: Record<string, unknown>) {
  const qs = new URLSearchParams();
  Object.entries(sp).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.set(k, String(v));
  });
  return qs.toString();
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const spString = searchParams.toString(); // ✅ stable dependency

  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 10);

  const query = useMemo(() => {
    return buildQS({
      page,
      limit,
      q: searchParams.get("q"),
      category: searchParams.get("category"),
      brand: searchParams.get("brand"),
      is_published: searchParams.get("is_published"),
      price_min: searchParams.get("price_min"),
      price_max: searchParams.get("price_max"),
      created_from: searchParams.get("created_from"),
      created_to: searchParams.get("created_to"),
      sortOrder: searchParams.get("sortOrder"),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, spString]);

  const [paged, setPaged] = useState<Paginated<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [prodRes] = await Promise.all([
          api.get<ListResponse<Product>>(`/products?${query}`),

        ]);

        if (!alive) return;

        setPaged(prodRes.data.data as Paginated<Product>);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.response?.data?.message ?? e?.message ?? "Fetch failed");
        setPaged(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [query]);

  if (loading) return <div className="container mx-auto">Loading...</div>;
  if (error) return <div className="container mx-auto text-red-500">{error}</div>;
  if (!paged) return <div className="container mx-auto">No data</div>;

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Danh sách sản phẩm</h1>

      {/* nếu ProductDataTable có filter UI, bạn có thể truyền cats/brands vào */}
      {/* <ProductDataTable categories={cats} brands={brands} ... /> */}

      <ProductDataTable columns={columns} data={paged.data} pageCount={paged.totalPages} />
    </div>
  );
}
