"use client";

import { Category, Color, Product, Size } from "@/app/admin/product/type";
import api from "@/lib/axios";
import axios from "axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CategoryFilter from "./components/CategoryFilter";
import FilterSheet from "./components/SheetFilter";
import { ProductList } from "./components/ProductList";
import { Separator } from "@/components/ui/separator";
import PaginationFilter from "./components/PaginationFilter";

export interface ProductDataResponse {
    data: Product[];
    limit: number;
    page: number;
    total: number;
    totalPages: number; 
}

export interface ProductListProps {
    data: Product[];
}


export function buildQs(obj: Record<string, any>) {
    const usp = new URLSearchParams();
    Object.entries(obj).forEach(([k, v]) => {
        if (v == null || v === "" || (Array.isArray(v) && v.length === 0)) return;
        if (Array.isArray(v)) v.forEach((val) => usp.append(k, String(val)));
        else usp.set(k, String(v));
    });
    return usp.toString();
}

export default function ProductClient({ categories, sizes, colors }: { categories: Category, sizes: Size, colors: Color }) {
    const router = useRouter();
    const pathname = usePathname();
    const sp = useSearchParams();
    const [productData, setProductData] = useState<Product[] | null>(null);
    // console.log("Categories, Sizes, Colors in ProductClient:", { categories, sizes, colors });
    const sizesArray = Array.isArray(sizes) ? sizes : Object.values(sizes);
    const colorsArray = Array.isArray(colors) ? colors : Object.values(colors);
    const params = useMemo(() => {
        const p: Record<string, any> = Object.fromEntries(sp.entries());
        if (!p.limit) p.limit = 12;
        if (!p.page) p.page = 1;
        console.log("Current params:", p);
        return p;
    }, [sp])

    const replaceParams = useCallback((patch: Record<string, any>) => {
        const base = Object.fromEntries(sp.entries());
        console.log("Current search params:", base);
        const merged = { ...base, ...patch };
        console.log("Merged search params:", merged);
        // nếu đổi bất kỳ filter nào khác page → reset page = 1
        if (Object.keys(patch).some((k) => k !== "page")) merged.page = 1;
        const qs = buildQs(merged);
        router.replace(`${pathname}?${qs}`, { scroll: false });
    }, [router, pathname, sp]);

    const [data, setData] = useState<ProductDataResponse| null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);


    const inflight = useRef<AbortController | null>(null);
    const fetchList = useCallback(async () => {
        if (inflight.current) inflight.current.abort();
        const controller = new AbortController();
        inflight.current = controller;
        setLoading(true);
        setErr(null);
        try {
            const qs = buildQs(params);
            const res = await api.get<any>(`/products?${qs}`, { signal: controller.signal });
            console.log("Fetched products:", res);
            setData(res.data.data || []);
        } catch (e: any) {
            if (!axios.isCancel(e)) setErr(e?.message ?? "Fetch failed");
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => { fetchList(); }, [fetchList]);
    if(!data) {
        return <div>Loading...</div>;
    }
    return (
        <div>
            <CategoryFilter
                categories={categories}
                value={sp.get("category") ?? ""}
                onChange={(category) => replaceParams({ category: category || undefined })}
            />

            <FilterSheet sizes={sizesArray} colors={colorsArray} />

            <Separator className="my-4" />
            <p className="font-medium ">Có {data.total} sản phẩm được tìm thấy</p>
            <ProductList data={data.data} />
            <PaginationFilter
                currentPage={data.page}
                totalPages={data.totalPages}
                onPageChange={(page) => replaceParams({ page })}
            />
        </div>
    )
}