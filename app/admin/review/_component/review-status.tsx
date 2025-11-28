// components/orders/order-status-select.tsx
"use client";
import { toast } from "sonner";
import { useState } from "react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { updateOrderStatus } from "@/lib/api/payment";
import { useEffect } from "react";
import { reviewStatuses } from "./type";
import { updateReviewStatus } from "@/lib/api/get-product";
type Props = {
    reviewId: number;
    initialStatus: string;
    //   onUpdated?: () => void; // nếu muốn refetch bảng thì truyền callback vào
};
export function getReviewStatus(status: string | undefined) {
    return reviewStatuses.find((s) => s.value === status);
}


export function ReviewStatus({ reviewId, initialStatus }: Props) {

    const [status, setStatus] = useState<string>(initialStatus);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setStatus(initialStatus);
    }, [initialStatus]);
    const current = getReviewStatus(status);
    console.log('Current status:', current, 'for reviewId:', reviewId, initialStatus);

    const handleChange = async (value: string) => {
        const next = value
        const prev = status;

        // đổi UI trước (optimistic)
        setStatus(next);
        setLoading(true);

        try {
            const res = await updateReviewStatus(reviewId, next);
            if (res.data.statusCode === 201) {
                toast.success("Cập nhật trạng thái thành công");
            }
        } catch (err: any) {
            toast.error(err?.message || "Cập nhật trạng thái thất bại");
            // rollback nếu lỗi
            setStatus(prev);

        } finally {
            setLoading(false);
        }
    };

    return (
        <Select
            value={status}
            onValueChange={handleChange}
            disabled={loading}
        >
            <SelectTrigger className="justify-start gap-2 px-2 text-xs border-none  shadow-none">
                {loading ? (
                    <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Đang lưu...</span>
                    </span>
                ) : current ? (
                    <span className="flex items-center gap-2">
                        <span
                            className="rounded-full px-2 py-1 text-white text-xs"
                            style={{ backgroundColor: current.color }}
                        >{current.label_vi}</span>

                    </span>
                ) : (
                    <SelectValue placeholder="Chọn trạng thái" />
                )}
            </SelectTrigger>

            <SelectContent>
                {reviewStatuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                        <span className="flex items-center gap-2">
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: s.color }}
                            />
                            <span>{s.label_vi}</span>
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
