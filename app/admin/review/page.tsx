"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ListResponse, Paginated } from "../product/type";
import { Review } from "@/app/(client)/[slug]/components/type";

import Toolbar from "./_component/toolbar";
import ListReview from "./_component/list-review";

import api from "@/lib/axios";

function buildQS(sp: Record<string, unknown>) {
  const qs = new URLSearchParams();
  Object.entries(sp).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.set(k, String(v));
  });
  return qs.toString();
}

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const spString = searchParams.toString(); // ✅ stable dep

  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 10);

  const query = useMemo(() => {
    return buildQS({
      page,
      limit,
      q: searchParams.get("q"),
      rating: searchParams.get("rating"),
      status: searchParams.get("status"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, spString]);

  const [paged, setPaged] = useState<Paginated<Review> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function fetchReviews() {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get<ListResponse<Review>>(
          `/review/get-reviews?${query}`
        );

        if (!alive) return;
        setPaged(res.data.data as Paginated<Review>);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.response?.data?.message ?? e?.message ?? "Fetch failed");
        setPaged(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    fetchReviews();
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
      <ListReview reviews={paged.data} page={page} totalPages={paged.totalPages} />
    </div>
  );
}
