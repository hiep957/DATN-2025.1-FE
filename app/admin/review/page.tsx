
import { ListResponse, Paginated } from "../product/type";
import { Review } from "@/app/(client)/[slug]/components/type";

import Toolbar from "./_component/toolbar";
import ListReview from "./_component/list-review";





import { BASE_URL } from "@/lib/axios";

export function buildQS(sp: Record<string, unknown>) {
    const qs = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        qs.set(k, String(v));
    });
    return qs.toString();
}

export const dynamic = "force-dynamic"; // always SSR fresh

export default async function ReviewPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {

    const sp = await searchParams;
   
    console.log("Search params:", sp);

    const page = Number(sp.page ?? 1);
    const limit = Number(sp.limit ?? 10);

    const query = buildQS({
        page,
        limit,
        q: sp.q,
        rating: sp.rating,
        status: sp.status,
        sortBy: sp.sortBy,
        sortOrder: sp.sortOrder,
    });
    async function fetchJSON<T>(path: string): Promise<T> {
        console.log("Path sang backend", `${BASE_URL}${path}`)
        const res = await fetch(`${BASE_URL}${path}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed ${path}: ${res.status}`);
        return res.json();
    }
    // products
    const orderRes = await fetchJSON<ListResponse<Review>>(`/review/get-reviews?${query}`);
    console.log(orderRes)
    const paged = orderRes.data as Paginated<Review>;
    console.log("Paged orders:", paged);
    return (
        <div>

            <Toolbar total={paged.total} />
            <ListReview reviews={paged.data} page={page} totalPages={paged.totalPages} />
            
        </div>
    )
}