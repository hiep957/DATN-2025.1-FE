"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import Toolbar from "./_component/toolbar";
import DataTable from "./_component/data-table";
import { Order } from "./type";
import { ListResponse, Paginated } from "../product/type";
import api, { BASE_URL } from "@/lib/axios";

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

    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 10);

    const [data, setData] = useState<Paginated<Order> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const query = buildQS({
            page,
            limit,
            q: searchParams.get("q"),
            order_status: searchParams.get("order_status"),
            payment_status: searchParams.get("payment_status"),
            payment_method: searchParams.get("payment_method"),
            sortBy: searchParams.get("sortBy"),
            sortOrder: searchParams.get("sortOrder"),
        });

        async function fetchOrders() {
            setLoading(true);
            const res = await api.get(`${BASE_URL}/payment/orders?${query}`);
            const json: ListResponse<Order> = res.data;
            setData(json.data as Paginated<Order>);
            setLoading(false);
        }

        fetchOrders();
    }, [page, limit, searchParams]);

    if (loading) return <div>Loading...</div>;
    if (!data) return <div>No data</div>;

    return (
        <div>
            <Toolbar total={data.total} />
            <DataTable
                data={data.data}
                limit={limit}
                total={data.total}
                page={page}
                totalPages={data.totalPages}
            />
        </div>
    );
}
