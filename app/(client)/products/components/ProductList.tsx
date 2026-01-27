"use client";

import { Product } from "@/app/admin/product/type";
import { ProductListProps } from "../product-client";
import { useMemo } from "react";
import { ProductCard } from "./ProductCard";
import { transformProductToCard } from "@/lib/utils";


export type ProductCardProps = {
    name: string;
    price: number;
    imageColor: { id: number; code: string; url: string }[];
    imageUrl: string[];
    slug?: string;
    id?: number;
    brandName?: string;
    totalSold: number;
};

export const ProductList = ({ data }: ProductListProps) => {
    const transformedData = useMemo<ProductCardProps[]>(() => {
        if (!data || !Array.isArray(data)) return [];
        return data.map(transformProductToCard);
    }, [data]);
    console.log("Transformed Product Data:", transformedData);

    // Ví dụ render đơn giản
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {transformedData.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
};


