'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, AlertTriangle, Copy } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


import { Separator } from "@/components/ui/separator";
import { getCart } from '@/lib/api/cart';
import { useCartStore } from '@/store/useCartStore';

type VnpayReturn = Record<string, string | undefined>;

function formatAmount(v?: string) {
    if (!v) return '';
    const value = Number(v) / 100;
    return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
}

function formatPayDate(v?: string) {
    if (!v || v.length !== 14) return v ?? '';
    const y = v.slice(0, 4), m = v.slice(4, 6), d = v.slice(6, 8);
    const hh = v.slice(8, 10), mm = v.slice(10, 12), ss = v.slice(12, 14);
    return `${d}/${m}/${y} ${hh}:${mm}:${ss}`;
}

export default function VnpayReturnPage() {
    const sp = useSearchParams();
    console.log('Search Params:', sp.toString());



    useEffect(() => {
        const updateCart = async () => {
            const cart = await getCart();
            useCartStore.getState().setCart(cart.data.items);
        }
        updateCart();
    }, []);




    return (
        <main className="mx-auto max-w-2xl p-6">
            <div className="flex-1">
                <h1 className="text-xl font-semibold">
                    Thanh toán thành công
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">

                </div>
            </div>
        </main>
    );
}
