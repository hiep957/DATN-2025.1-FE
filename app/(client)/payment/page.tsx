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
    const [verified, setVerified] = useState<boolean | null>(null); // chữ ký HMAC
    const [verifyErr, setVerifyErr] = useState<string | null>(null);

    const data: VnpayReturn = useMemo(() => {
        const obj: VnpayReturn = {};
        for (const key of sp.keys()) obj[key] = sp.get(key) ?? undefined;
        return obj;
    }, [sp]);

    // business flags
    const isSuccess = data.vnp_ResponseCode === '00' && data.vnp_TransactionStatus === '00';
    //   const amount = formatAmount(data.vnp_Amount);
    //   const payDate = formatPayDate(data.vnp_PayDate);
    //   const orderInfo = data.vnp_OrderInfo ? decodeURIComponent(data.vnp_OrderInfo) : '';
    //   const failReason = !isSuccess
    //     ? `ResponseCode=${data.vnp_ResponseCode ?? 'N/A'}, TransactionStatus=${data.vnp_TransactionStatus ?? 'N/A'}`
    //     : '';

    // (tuỳ chọn) xác minh chữ ký server để chống sửa URL

    useEffect(() => {
        const updateCart = async () => {
            const cart = await getCart();
            useCartStore.getState().setCart(cart.data.items);
        }
        if (isSuccess) {
            updateCart();
        }
    }, [data]);

    const StatusIcon = isSuccess ? CheckCircle2 : XCircle;
    const statusColor = isSuccess ? 'text-green-600' : 'text-red-600';
    const badgeVariant = isSuccess ? 'bg-green-600' : 'bg-red-600';

   
    return (
        <main className="mx-auto max-w-2xl p-6">
            <div className="flex-1">
                <h1 className="text-xl font-semibold">
                    {isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại / không hợp lệ'}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                    {data.vnp_TxnRef && (
                        <Badge variant="secondary" className="rounded-full">
                            Mã tham chiếu: {data.vnp_TxnRef}
                        </Badge>
                    )}
                    {data.vnp_TransactionNo && (
                        <Badge className={`rounded-full ${badgeVariant} text-white`}>
                            Mã giao dịch cổng: {data.vnp_TransactionNo}
                        </Badge>
                    )}
                </div>
            </div>
        </main>
    );
}
