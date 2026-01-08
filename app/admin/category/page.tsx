"use client";
import React, { useEffect } from "react";
import { Category } from "../product/type";
import api from "@/lib/axios";
import DataTable from "./_component/data-table";
import { AddCategoryDialog } from "./_component/add-category";
import { fetchCategories } from "@/lib/api/category";



export default function CategoryPage() {

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