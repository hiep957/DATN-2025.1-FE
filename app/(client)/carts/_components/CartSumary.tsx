"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { CartItemProps } from "./CartArea"
import { useCartStore } from "@/store/useCartStore"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"
import { toast } from "sonner"

type CartSummaryProps = {
    selectedVariantIds: string[]
    total: number
    selectedCount: number
    allCount: number
}

export default function CartSummary({
    selectedVariantIds,
    total,
    selectedCount,
    allCount,
}: CartSummaryProps) {
    const router = useRouter();
    const {isAuthenticated} = useAuthStore();
    const handleCheckoutPage = () => {
        if (!isAuthenticated) {
            toast.error("Vui lòng đăng nhập để tiếp tục thanh toán.");
            return;
        }
        if (selectedVariantIds.length === 0) return;
        const params = new URLSearchParams();
        // 2. Thêm mảng ID vào (nối bằng dấu phẩy)
        params.append("ids", selectedVariantIds.join(','));
        console.log("đang điều hướng với IDs", selectedVariantIds);
        router.push(`/checkout?${params.toString()}&total=${total}`);
    }
    return (
        <div className="rounded-lg border p-4 space-y-4 h-fit sticky top-6">
            <div>
                <p className="text-sm text-muted-foreground">Tổng thanh toán</p>
                <p className="text-2xl font-bold">
                    {total.toLocaleString("vi-VN")}₫
                </p>
            </div>
            <p className="text-sm text-muted-foreground">
                Đã chọn {selectedCount}/{allCount} sản phẩm
            </p>
            <Button className="w-full" disabled={selectedCount === 0} onClick={handleCheckoutPage}>
                Thanh toán{selectedCount > 0 ? ` (${selectedCount})` : ""}
            </Button>
        </div>
    )
}
