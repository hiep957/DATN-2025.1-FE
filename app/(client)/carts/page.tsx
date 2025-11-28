"use client";
import { useCartStore } from "@/store/useCartStore";
import CartArea, { CartItemProps } from "./_components/CartArea";
import { useMemo, useState } from "react";
import CartSummary from "./_components/CartSumary";
import { set } from "date-fns";

export default function CartPage() {
    const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([])
  
    const items = useCartStore(state => state.items);


    const total = useMemo(() => {
        return items.filter((item) => selectedVariantIds.includes(item.variant.id.toString()))
            .reduce((acc, item) => acc + item.quantity * parseFloat(item.variant.price), 0);
    }, [selectedVariantIds, items])
    console.log("Selected Variant IDs:", selectedVariantIds);
    console.log("Total Price of Selected Items:", total);

    // console.log("Cart Page Items:", items);
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] lg:min-h-[70vh]">
                <h2 className="text-2xl font-semibold mb-4">Giỏ hàng của bạn đang trống</h2>
                <p className="text-muted-foreground mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm.</p>
            </div>
        )
    }

    
    return (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_420px] gap-2 lg:gap-4">
            <div className="">
                <CartArea items={items} selectedIds={selectedVariantIds} setSelectedIds={setSelectedVariantIds} />
            </div>
            <div>
                <CartSummary
                    selectedVariantIds={selectedVariantIds}
                    total={total}
                    selectedCount={selectedVariantIds.length}
                    allCount={items.length}
                />
            </div>
        </div>
    )
}