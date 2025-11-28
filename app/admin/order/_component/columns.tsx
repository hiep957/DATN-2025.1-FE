"use client"
import { ColumnDef } from "@tanstack/react-table";
import { Order } from "../type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { orderStatuses, paymentStatuses, paymentMethods } from "../type";
import { OrderStatusSelect } from "./order-status";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function getPaymentStatus(status: string) {
    return paymentStatuses.find((s) => s.value === status);
}

export function getPaymentMethod(method: string) {
    return paymentMethods.find((m) => m.value === method);
}
export function getOrderStatus(status: string | undefined) {
    return orderStatuses.find((s) => s.value === status);
}

/**
 * Thay vì export const columns, export 1 hàm trả về columns
 * và nhận onOpenDetail làm param để cell có thể gọi được.
 */
export const getColumns = (onOpenDetail: (order: Order) => void): ColumnDef<Order>[] => [
    {
        id: "index",
        header: "STT",
        cell: ({ row }) => row.index + 1,
        size: 50,
    },
    {
        accessorKey: "orderItems",
        header: "Sản phẩm",
        cell: ({ row }) => {
            const order = row.original;
            const firstItem = order.orderItems[0];
            const productName = firstItem?.productName || "Sản phẩm không tồn tại";
            const productImage = firstItem?.link_image || "";
            const itemCount = order.orderItems.length;
            return (
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={productImage} alt={productName} />
                        <AvatarFallback>{productName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate  max-w-[300px] font-medium" title={productName}>{productName}</span>
                    {itemCount > 1 && <span className="text-sm text-gray-500">+ {itemCount - 1} sản phẩm khác</span>}
                </div>
            )
        }
    },
    {
        accessorKey: "customer_name",
        header: "Khách hàng",
        cell: ({ row }) => <span>{row.original.customer_name}</span>,
    },
    {
        accessorKey: "grand_total",
        header: "Tổng tiền",
        cell: ({ row }) => <div className="font-medium">{Number(row.original.grand_total).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>,
    },
    {
        accessorKey: "order_status",
        header: "Trạng thái đơn hàng",
        cell: ({ row }) => (
            <OrderStatusSelect orderId={row.original.id} initialStatus={row.original.order_status} />
        ),
    },
    {
        accessorKey: "payment_status",
        header: "Trạng thái thanh toán",
        cell: ({ row }) => {
            const status = getPaymentStatus(row.original.payment_status);
            if (!status) return null;

            return (
                <span
                    className="px-2 py-1 rounded-2xl text-white text-xs"
                    style={{
                        backgroundColor: status.color
                    }}
                >
                    {status.label}
                </span >
            );
        }
    },
    {
        accessorKey: "payment_method",
        header: "Phương thức thanh toán",
        cell: ({ row }) => {
            const method = getPaymentMethod(row.original.payment_method);
            if (!method) return null;
            return (
                <span
                    className="px-2 py-1 rounded-2xl text-white text-xs"
                    style={{
                        backgroundColor: method.color
                    }}
                >
                    {method.value}
                </span >
            );
        }
    },
    {
        id: "actions",
        header: "Hành động",
        cell: ({ row }) => {
            const order = row.original
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Xem chi tiết đơn ${order.id}`}
                                onClick={() => onOpenDetail(order)} // <-- dùng callback truyền vào
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>

                        <TooltipContent>
                            <p>Xem chi tiết</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        },
    }
];
