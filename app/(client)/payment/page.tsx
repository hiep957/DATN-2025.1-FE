"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getCart } from "@/lib/api/cart";
import { useCartStore } from "@/store/useCartStore";

function PaymentInner() {
  const sp = useSearchParams(); // ✅ nằm trong component được Suspense bọc
  console.log("Search Params:", sp.toString());

  useEffect(() => {
    const updateCart = async () => {
      const cart = await getCart();
      useCartStore.getState().setCart(cart.data.items);
    };
    updateCart();
  }, []);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="flex-1">
        <h1 className="text-xl font-semibold">Thanh toán thành công</h1>
      </div>
    </main>
  );
}

export default function VnpayReturnPage() {
  return (
    <Suspense fallback={<div className="p-6">Đang tải thanh toán...</div>}>
      <PaymentInner />
    </Suspense>
  );
}
