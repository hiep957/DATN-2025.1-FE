"use client";

import Image from "next/image";
import { Package, CalendarDays, Truck, CheckCircle2 } from "lucide-react";
import { orderStatuses } from "@/app/admin/order/type";
// Shadcn UI Imports
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useMobile";
import { Order } from "@/app/admin/order/type";
import { getUserOrders } from "@/lib/api/payment";
import api from "@/lib/axios";
import { getOrderStatus } from "@/app/admin/order/_component/columns";
// --- 1. Mock Data & Types ---


// --- 2. Helper Functions ---
const formatCurrency = (value: string) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value));

// const getStatusBadge = (orderStatus: orderStatuses) => {
//     switch (orderStatus.) {
//         case "pending": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Chờ xác nhận</Badge>;
//         case "shipping": return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200"><Truck className="w-3 h-3 mr-1" /> Đang giao hàng</Badge>;
//         case "delivered": return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Giao thành công</Badge>;
//         case "cancelled": return <Badge variant="destructive">Đã hủy</Badge>;
//         default: return <Badge variant="outline">Không rõ</Badge>;
//     }
// };

// --- 3. Main Component ---
const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[] | null>([]);
    useEffect(() => {
        const res = getUserOrders();
        res.then((data) => {
            console.log("Data orders", data);
            setOrders(Object.values(data.data));
        })

    }, []);
    console.log("Order", orders);
    if (!orders) {
        return null;
    }
    const isMobile = useIsMobile();
    return (
        <Card className={cn(
            // Base class
            "transition-all duration-200",
            // Logic điều kiện:
            isMobile
                ? "border-none shadow-none bg-transparent" // Mobile: Không viền, không bóng, nền trong suốt
                : "bg-white border border-gray-200 shadow-sm rounded-xl" // Desktop: Viền xám rõ (300), bóng nhẹ, bo góc
        )}>
            <CardHeader className="">
                <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    <Package className="w-6 h-6 text-primary" />
                    Thông tin đơn hàng
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:px-6 mt-4 sm:mt-0 space-y-6">
                {orders.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        Bạn chưa có đơn hàng nào.
                    </div>
                ) : (
                    orders.map((order) => (
                        <div
                            key={order.id}
                            className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            <div className="p-3 text-sm">
                                <span className="flex flex-row">
                                    <p>Trạng thái đơn hàng:</p>
                                    <span className="gap-2">
                                        <span
                                            className="rounded-full px-2 py-1 text-white text-xs ml-1"
                                            style={{ backgroundColor: getOrderStatus(order?.order_status || "")?.color }}
                                        >{getOrderStatus(order?.order_status || "")?.label}
                                        </span>
                                    </span>
                                </span>
                            </div>

                            {/* --- DANH SÁCH SẢN PHẨM TRONG ĐƠN (Đã sửa) --- */}
                            <div className="p-3 sm:p-4 bg-white">
                                {order.orderItems.map((item, index) => (
                                    <div key={item.id}>
                                        <div className="flex gap-3 sm:gap-4 py-2">
                                            {/* Ảnh sản phẩm */}
                                            <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 rounded-md border overflow-hidden bg-gray-50">
                                                <img
                                                    src={item.link_image}
                                                    alt={item.productName}
                                                    className="object-cover"
                                                />
                                            </div>

                                            {/* Thông tin chi tiết sản phẩm */}
                                            <div className="flex flex-1 flex-col justify-between">

                                                <h3 className="font-medium text-sm sm:text-base line-clamp-2 text-gray-900">
                                                    {item.productName}
                                                </h3>
                                                <div className="flex flex-col md:flex-row md:justify-between text-xs sm:text-sm text-muted-foreground">
                                                    <span className="text-muted-foreground flex items-center">
                                                        <p>Ngày đặt hàng:  </p>
                                                        <span className="ml-1"> {formatDateTime(order.created_at)}</span>
                                                    </span>

                                                </div>


                                                <div className="flex justify-between items-center">
                                                    <p className="text-sm text-muted-foreground">Số lượng:{item.quantity}</p>
                                                    <span className="text-sm sm:text-base font-medium text-gray-900">
                                                        {formatCurrency(item.unit_price)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dòng kẻ phân cách giữa các sản phẩm (Chỉ hiện nếu không phải sp cuối) */}
                                        {index < order.orderItems.length - 1 && (
                                            <Separator className="my-2" />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* --- FOOTER CỦA ĐƠN HÀNG --- */}
                            <div className="border-t p-3 sm:p-4 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="w-full sm:w-auto flex justify-between sm:justify-start items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Tổng tiền ({order.orderItems.length} sản phẩm):</span>
                                    <span className="text-lg font-bold text-red-600">
                                        {formatCurrency(order.grand_total.toString())}
                                    </span>
                                </div>

                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button variant="outline" size="sm" className="w-full sm:w-auto border-gray-300 hover:bg-white">
                                        Xem chi tiết
                                    </Button>
                                    {order.order_status === 'completed' ? (
                                        <Button size="sm" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                                            Mua lại
                                        </Button>
                                    ) : order.order_status === 'completed' ? (
                                        <Button size="sm" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                                            Đã nhận hàng
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}