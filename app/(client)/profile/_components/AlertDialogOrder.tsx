"use client";

import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import axios from "axios";
import { toast } from "sonner";

type CancelOrderDialogProps = {
    orderId: number;
    onCancelled?: () => void | Promise<void>; // gọi để refresh orders
};

const cancelOrder = async (orderId: number) => {
    // ✅ Gọi API huỷ đơn hàng
    try {
        const res = await api.post(`/order/cancel-order/${orderId}`);
        return res.data;
    }
    catch (err) {
        // Chuẩn hoá message để UI toast được đúng
        if (axios.isAxiosError(err)) {
            const msg =
                (err.response?.data as any)?.message || // NestJS hay trả message
                (err.response?.data as any)?.error ||   // vài case khác
                err.message ||
                "Xảy ra lỗi khi xử lý đơn hàng COD";
            throw new Error(msg);
        }
        throw new Error("Xảy ra lỗi khi xử lý COD");
    }
}

export function CancelOrderDialog({ orderId, onCancelled }: CancelOrderDialogProps) {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleCancelOrder = async () => {
        try {
            setSubmitting(true);

            // ✅ Gọi API cancel order (đổi endpoint đúng của bạn)
            await cancelOrder(orderId);

            // ✅ Đóng dialog
            setOpen(false);
            toast.success("Huỷ đơn hàng thành công");
            // ✅ Refresh lại danh sách orders
            await onCancelled?.();
        } catch (err: any) {
            console.error("Cancel order error:", err);
            toast.error(err?.message || "Huỷ đơn hàng thất bại");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button size="sm" className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
                    Huỷ đơn hàng
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Bạn có chắc chắn muốn huỷ đơn hàng này?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Hành động này không thể hoàn tác. Đơn hàng sẽ bị huỷ và không thể khôi phục.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={submitting}>Thôi</AlertDialogCancel>

                    {/* ✅ Nút “Tiếp tục” gọi API */}
                    <AlertDialogAction onClick={handleCancelOrder} disabled={submitting}>
                        {submitting ? "Đang huỷ..." : "Tiếp tục"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
