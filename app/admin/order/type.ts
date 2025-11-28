import { User } from "@/store/useAuthStore";

// 🔹 Phương thức thanh toán
export const paymentMethods = [
    {
        value: 'cod',
        label: 'Thanh toán khi nhận hàng',
        color: '#facc15', // vàng
    },
    {
        value: 'vnpay',
        label: 'Thanh toán qua VNPay',
        color: '#3b82f6', // xanh dương
    },
];

// 🔹 Trạng thái đơn hàng
export const orderStatuses = [
    {
        value: 'pending',
        label: 'Chờ xác nhận',
        color: '#f59e0b', // cam
    },
    {
        value: 'confirmed',
        label: 'Đã xác nhận',
        color: '#3b82f6', // xanh
    },
    {
        value: 'delivering',
        label: 'Đang giao hàng',
        color: '#06b6d4', // xanh ngọc
    },
    {
        value: 'completed',
        label: 'Đã hoàn thành',
        color: '#10b981', // xanh lá
    },
    {
        value: 'cancelled',
        label: 'Đã hủy',
        color: '#ef4444', // đỏ
    },
];

// 🔹 Trạng thái thanh toán
export const paymentStatuses = [
    {
        value: 'pending',
        label: 'Chờ thanh toán',
        color: '#f59e0b', // cam
    },
    {
        value: 'paid',
        label: 'Đã thanh toán',
        color: '#10b981', // xanh lá
    },
    {
        value: 'failed',
        label: 'Thanh toán thất bại',
        color: '#ef4444', // đỏ
    },
    {
        value: 'refunded',
        label: 'Đã hoàn tiền',
        color: '#3b82f6', // xanh dương
    },
];

export const sortOptions = [
    { value: "grand_total", label: "Giá tiền" },
    { value: "updated_at", label: "Thời gian chỉnh sửa" },
    { value: "created_at", label: "Thời gian tạo" },
]



export interface Order {
    id: number;
    user: User;
    customer_name: string;
    customer_email?: string;
    customer_phone: string;
    shipping_address: string;
    note?: string;
    payment_method: string;
    order_status: string;
    payment_status: string;
    transaction_code?: string;
    subtotal: string;
    shipping_fee: string;
    discount_amount: string;
    grand_total: string;
    created_at: string;
    updated_at: string;
    orderItems: {
        id: number;
        productVariantId: number;
        quantity: number;
        unit_price: string;
        productName: string;
        productId?: number;
        link_image: string;
    }[]
}