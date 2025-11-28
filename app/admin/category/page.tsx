"use client";
import { User } from "@/store/useAuthStore";
import React, { useEffect } from "react";
import { Category } from "../product/type";
import api from "@/lib/axios";
import DataTable from "./_component/data-table";

import { Button } from "@/components/ui/button";
import { AddCategoryDialog } from "./_component/add-category";


const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"; // change to your Nest host


async function fetchCategories(): Promise<Category[]> {
    const res = await api.get("/category");
    if (!res) throw new Error("Failed to fetch");
    return res.data.data.data;
}
export default function OrderPage() {

    const [categories, setCategories] = React.useState<Category[] | null>(null);
    const [loading, setLoading] = React.useState(false);

    // categories
    const loadData = async () => {
        setLoading(true);
        try {
            const categories = await fetchCategories();
            setCategories(categories);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadData();
    }, []);
    if (loading) return <div>Loading...</div>;
    if (!categories) return <div>No data</div>;
    console.log("Categories:", categories);

    return (
        <div>
            <div className="flex justify-between">
                <p className="text-lg font-semibold">Quản lý danh mục</p>
                <AddCategoryDialog categories={categories} onSuccess={loadData} />
            </div>
            {/* <Toolbar total={paged.total}/> */}
            <DataTable categories={categories} onSuccess={loadData} />
        </div>
    )
}