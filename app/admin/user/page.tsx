import { User } from "@/store/useAuthStore";
import { ListResponse, Paginated } from "../product/type";
import Toolbar from "./_component/toolbar";

import DataTable from "./_component/data-table";
import { columns } from "./_component/columns";




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

export default async function OrderPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {

    const sp = await searchParams;

    console.log("Search params:", sp);

    const page = Number(sp.page ?? 1);
    const limit = Number(sp.limit ?? 10);

    const query = buildQS({
        page,
        limit,
        q: sp.q,
        order_status: sp.order_status,
        payment_status: sp.payment_status,
        payment_method: sp.payment_method,
        sortBy: sp.sortBy,
        sortOrder: sp.sortOrder,
    });
    async function fetchJSON<T>(path: string): Promise<T> {
        const res = await fetch(`${BASE_URL}${path}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed ${path}: ${res.status}`);
        return res.json();
    }
    // products
    const orderRes = await fetchJSON<ListResponse<User>>(`/user/get-users?${query}`);
    console.log(orderRes)
    const paged = orderRes.data as Paginated<User>;
    console.log("Paged orders:", paged);
    return (
        <div>

            <Toolbar total={paged.total}/>
            <DataTable columns={columns} data={paged.data} limit={limit} total={paged.total} page={page} totalPages={paged.totalPages} />
        </div>
    )
}