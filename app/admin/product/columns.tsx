"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Product } from "./type";
import { useRouter } from "next/navigation";



const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);


const getProductSummary = (variants: Product["variants"]) => {
    if (!variants?.length) return { priceRange: "N/A", totalStock: 0, totalSold: 0 };
    const prices = variants.map((v) => parseFloat(v.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = minPrice === maxPrice
        ? formatCurrency(minPrice)
        : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
    const totalStock = variants.reduce((s, v) => s + v.quantity, 0);
    const totalSold = variants.reduce((s, v) => s + (v.sold || 0), 0);
    return { priceRange, totalStock, totalSold };
};


export const columns: ColumnDef<Product>[] = [
    {
        id: "expander",
        header: () => null,
        cell: ({ row }) => (
            <Button variant="ghost" size="icon" onClick={row.getToggleExpandedHandler()} disabled={!row.getCanExpand()}>
                <ChevronRight className={`h-4 w-4 transition-transform ${row.getIsExpanded() ? "rotate-90" : ""}`} />
            </Button>
        ),
    },
    {
        accessorKey: "name",
        header: "Sản phẩm",
        cell: ({ row }) => {
            const p = row.original;
            const imageUrl = p.images?.[0]?.url;
            return (
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={imageUrl} alt={p.name} className="object-cover" />
                        <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate  max-w-[300px] font-medium" title={p.name}>{p.name}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "category",
        header: "Danh mục",
        cell: ({ row }) => <span>{row.original.category?.name}</span>,
    },
    {
        id: "price",
        header: "Giá",
        cell: ({ row }) => <div className="font-medium">{getProductSummary(row.original.variants).priceRange}</div>,
    },
    {
        id: "totalStock",
        header: "Tổng tồn",
        cell: ({ row }) => <div>{getProductSummary(row.original.variants).totalStock}</div>,
    },
    {
        id: "totalSold",
        header: "Tổng đã bán",
        cell: ({ row }) => <div>{getProductSummary(row.original.variants).totalSold}</div>,
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const p = row.original;
            const router = useRouter();
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(p.id.toString())}>Copy Product ID</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push(`/admin/product/${p.id}/edit`)}>Chỉnh sửa</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500">Xóa</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];