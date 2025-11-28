import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Order } from "../type"
import { Button } from "@/components/ui/button"
import { getOrderStatus, getPaymentMethod, getPaymentStatus } from "./columns"


import { useEffect, useState } from "react"
import { Variant } from "../../product/type"
import api from "@/lib/axios"
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"


type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    order?: Order | null
    loading?: boolean
}
export default function OrderDetail({ open, onOpenChange, order, loading }: Props) {
    console.log("Order detail:", order, loading);
    const [orderItems, setOrderItems] = useState<Variant[] | null>(null);
    useEffect(() => {
        const getVariantDetails = async () => {
            if (!order) return;
            try {
                const variants = await Promise.all(
                    order.orderItems.map(async (item) => {
                        const res = await api.get(`/products/variants/${item.productVariantId}`);
                        return res.data.data; // <<--- phải return ở đây
                    })
                );

                setOrderItems(variants);
            } catch (err) {
                console.error('Failed to fetch variants', err);
                setOrderItems([]); // hoặc null tùy UX bạn muốn
            }
        }
        getVariantDetails();
    }, [order]);
    console.log("Fetched order items:", orderItems);

    function getItemVariantDetails(variantId: number): Variant | undefined {
        return orderItems?.find(v => v.id === variantId);
    }
    const formatDateTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    // → "07:02 14/11/2025" (tự động theo múi giờ VN)


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {loading ? "Đang tải..." : order ? `Chi tiết đơn hàng #${order.id}` : "Chi tiết đơn hàng"}
                    </DialogTitle>
                    <DialogDescription>
                        {loading ? "Vui lòng chờ" : order ? "Thông tin chi tiết đơn hàng" : "Không có đơn hàng để hiển thị"}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col w-full gap-4 ">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="font-bold text-sm">
                                Tên khách hàng
                            </div>
                            <div className="text-muted-foreground text-sm">
                                {order?.customer_name}
                            </div>
                        </div>
                        <div>
                            <div className="font-bold text-sm">
                                Số điện thoại
                            </div>
                            <div className="text-muted-foreground text-sm">
                                {order?.customer_phone}
                            </div>
                        </div>
                        <div>
                            <div className="font-bold text-sm">
                                Địa chỉ
                            </div>
                            <div className="text-muted-foreground text-sm">
                                {order?.shipping_address}
                            </div>
                        </div>

                        <div>
                            <div className="font-bold text-sm">
                                Email
                            </div>
                            <div className="text-muted-foreground text-sm">
                                {order?.customer_email ?? "N/A"}
                            </div>
                        </div>
                        <div>
                            <div className="font-bold text-sm">
                                Phương thức thanh toán
                            </div>
                            <div className="text-muted-foreground text-sm">
                                {getPaymentMethod(order?.payment_method || "")?.label || "N/A"}
                            </div>
                        </div>
                        <div>
                            <div className="font-bold text-sm">
                                Trạng thái đơn hàng
                            </div>
                            <div className="text-muted-foreground text-sm">
                                {getOrderStatus(order?.order_status || "")?.label || "N/A"}
                            </div>
                        </div>
                        <div>
                            <div className="font-bold text-sm">
                                Trạng thái thanh toán
                            </div>
                            <div className="text-muted-foreground text-sm">
                                {getPaymentStatus(order?.payment_status || "")?.label || "N/A"}
                            </div>

                        </div>
                        <div>
                            <div className="font-bold text-sm">
                                Tổng tiền
                            </div>
                            <div className="text-muted-foreground text-sm">
                                {order?.grand_total || "N/A"}
                            </div>
                        </div>
                    </div>
                    {/**Hiển thị sản phẩm */}
                    <div>
                        <div className="font-bold text-sm">Chi tiết sản phẩm</div>
                        <ScrollArea className="h-[150px] border rounded-md">
                            <div className="space-y-2 p-2">
                                {order?.orderItems.map((item) => {
                                    return (
                                        <div className="flex items-center gap-3" key={item.id}>
                                            <div className="relative w-[100px] h-[100px] rounded-md overflow-hidden">
                                                <Image
                                                    src={item.link_image}
                                                    alt={item.productName}
                                                    fill
                                                    className="object-cover"
                                                    sizes="100px"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-medium">{item.productName}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Số lượng: {item.quantity}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    Size : {getItemVariantDetails(item.productVariantId)?.size.name || "N/A"}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    Màu sắc : {getItemVariantDetails(item.productVariantId)?.color.name || "N/A"}
                                                </div>

                                            </div>

                                        </div>
                                    )
                                })}
                            </div>


                        </ScrollArea>

                    </div>

                    <div className="grid grid-cols-2 gap-4  ">
                        <div>
                            <div className="font-bold text-sm">
                                Ngày tạo đơn hàng
                            </div>
                            <div className="text-muted-foreground text-sm">
                                {order?.created_at ? formatDateTime(order.created_at) : "N/A"}
                            </div>
                        </div>
                        <div>
                            <div className="font-bold text-sm">
                                Ngày cập nhật gần nhất
                            </div>
                            <div className="text-muted-foreground text-sm">
                                {order?.updated_at ? formatDateTime(order.updated_at) : "N/A"}
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}