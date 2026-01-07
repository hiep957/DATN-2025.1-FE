"use client";

import * as React from "react";
import { ProductCardProps } from "./ProductList";
import { useRouter } from "next/navigation";
// Nếu bạn dùng shadcn card:
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import Image from "next/image";


export function ProductCard({ product }: { product: ProductCardProps }) {
    const router = useRouter();
    const [selectedColorId, setSelectedColorId] = React.useState<number | null>(
        null
    );

    const defaultUrl = product.imageUrl?.[0] ?? "";
    const currentUrl = React.useMemo(() => {
        if (selectedColorId == null) return defaultUrl;
        const hit = product.imageColor.find((c) => c.id === selectedColorId);
        return hit?.url || defaultUrl;
    }, [selectedColorId, product.imageColor, defaultUrl]);

    const handlePickColor = (id: number) => {
        setSelectedColorId((prev) => (prev === id ? null : id));
    };

    const onClick = (id: number) => {
        router.push(`${id}`);
    }

    return (
        <div className="group overflow-hidden rounded-2xl border bg-background">
            {/* Ảnh chính */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
                {/* Nếu bạn dùng Next/Image thì thay <img> bằng Image fill */}
                {/* <Image src={currentUrl} alt={product.name} fill className="object-cover" /> */}
                {currentUrl ? (
                    <img
                        src={currentUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                        No image
                    </div>
                )}
            </div>

            {/* Thông tin */}
            <div className="p-3">
                <div
                    className="mt-0.5 text-sm font-medium leading-5 line-clamp-2 min-h-[40px] cursor-pointer"
                    onClick={() => onClick(product.id ?? 0)}
                >
                    {product.name}
                </div>
                <div className="mt-1 text-base font-semibold">
                    {product.price.toLocaleString("vi-VN")}₫
                </div>

                {/* Swatches màu */}
                <div className="mt-3 flex flex-wrap gap-2">
                    {product.imageColor.map((c) => {
                        const isActive = selectedColorId === c.id;
                        return (
                            <button
                                key={c.id}
                                onClick={() => handlePickColor(c.id)}
                                aria-pressed={isActive}
                                title={c.code}
                                className={[
                                    "h-7 w-7 shrink-0 rounded-full border",
                                    // viền cho màu trắng dễ nhìn
                                    c.code?.toLowerCase() === "#ffffff" ? "border-gray-300" : "border-transparent",
                                    "transition",
                                    isActive
                                        ? "ring-2 ring-offset-2 ring-black/80"
                                        : "hover:ring-2 hover:ring-offset-2 hover:ring-black/40",
                                ].join(" ")}
                                style={{ backgroundColor: c.code }}
                            />
                        );
                    })}
                    {/* Nút 'Bỏ chọn' (quay lại ảnh mặc định) */}
                    {selectedColorId !== null ? (
                        <button
                            onClick={() => setSelectedColorId(null)}
                            className="ml-1 rounded-full border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                            title="Hiện ảnh mặc định"
                        >
                            Bỏ chọn
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
