import { columns } from "./columns"; // ✅ make sure this matches the file name
import { ProductDataTable } from "./data-table";
import type { ListResponse, Paginated, Product, Category, Brand } from "./type";


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

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  // 👇 await the async searchParams
  const sp = await searchParams;

  console.log("Search params:", sp);

  const page = Number(sp.page ?? 1);
  const limit = Number(sp.limit ?? 10);

  console.log('render lại')
  // Map Next URL -> NestJS query
  const query = buildQS({
    page,
    limit,
    q: sp.q,
    category: sp.category,
    brand: sp.brand,
    is_published: sp.is_published,
    price_min: sp.price_min,
    price_max: sp.price_max,
    created_from: sp.created_from,
    created_to: sp.created_to,
    sortOrder: sp.sortOrder,
  });


  async function fetchJSON<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed ${path}: ${res.status}`);
    return res.json();
  }


  // products
  const prodRes = await fetchJSON<ListResponse<Product>>(`/products?${query}`);
  console.log(prodRes)
  const paged = prodRes.data as Paginated<Product>;
 


  // categories + brands (adjust the endpoints to your NestJS routes)
  const [cats, brands] = await Promise.all([
    fetchJSON<ListResponse<Category>>(`/categories?limit=999&page=1`).catch(() => ({ data: { data: [] } } as any)),
    fetchJSON<ListResponse<{ id: number; name: string }>>(`/brands?limit=999&page=1`).catch(() => ({ data: { data: [] } } as any)),
  ]);


  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Danh sách sản phẩm</h1>
      <ProductDataTable
        columns={columns}
        data={paged.data}
        pageCount={paged.totalPages}
      />
    </div>
  );
}