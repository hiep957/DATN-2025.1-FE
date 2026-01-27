"use client";
import { Card, CardContent } from "@/components/ui/card";

import { ExternalLink } from "lucide-react";
import { Product } from "./type";

type ProductDemo = {
    id: number;
    name: string;
    min_price: number;
    max_price: number;
    img_url: string
}

export interface ProductCarouselProps {
    products: ProductDemo[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
    if (!products || products.length === 0) return null;
    console.log("Rendering ProductCarousel with products:", products);
    return (
        <div className="flex gap-3 overflow-x-auto py-2 px-1 scrollbar-thin scrollbar-thumb-slate-200 pb-4">
            {products.map((product) => (
                <Card key={product.id} className="min-w-[160px] max-w-[160px] flex-shrink-0 text-xs shadow-sm border-slate-200 hover:shadow-md transition-shadow bg-white">
                    <CardContent className="px-3 space-y-2">
                        {/* Giả lập ảnh product */}
                        <div className="w-full h-32 bg-slate-100 rounded-md flex items-center justify-center text-slate-400">
                            <img src={product.img_url} alt={product.name} className="w-full h-full object-cover rounded-md" />
                        </div>

                        <div className="font-semibold line-clamp-2 h-8 leading-4">
                            {product.name}
                        </div>

                        <div className="text-red-600 font-bold">
                            {/* {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.min_price)} */}
                            {product.min_price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                            {product.min_price !== product.max_price && ` - ${product.max_price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`}
                        </div>

                        <a
                            href={`https://datn-2025-1-fe.vercel.app/${product.id}`}
                            target="_blank"
                            className="flex items-center justify-center w-full py-1.5 bg-slate-900 text-white rounded text-[10px] hover:bg-slate-800"
                        >
                            Xem chi tiết <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}