import axios from "axios";
import api from "../axios";


type OrderItem = {
    productVariantId: number;
    quantity: number;
    unit_price: number;
    productName: string;
    productId: number;
    link_image: string;
}

export type CreateOrderPayload = {
    userId: number;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    shipping_address: string;
    note?: string;
    order_status: string;
    payment_method: string;
    payment_status: string;
    transaction_code?: string;
    subtotal: number;
    shipping_fee: number;
    discount_amount: number;
    grand_total: number;
    orderItems: OrderItem[];
}

export const createOrder = async (payload: CreateOrderPayload) => {
    const response = await api.post("/payment/create-order", payload)
    return response.data;
}

export const getUserOrders = async () => {
    const response = await api.post("/payment/user-orders", {}, { withCredentials: true });
    return response.data;
}
export const createPaymentLink = async (orderId: string, amount: number) => {
    const response = await api.post("/payment/create-payment-link", {
        orderId,
        amount
    });
    return response.data;
}

export const createPayment = async (type:'SEPAY' | 'VNPAY', orderId: string, amount: number) => {
    const response = await api.post("/payment/create-payment", {
        type,
        orderId,
        amount
    });
    return response.data;
}

export const createSepayPaymentLink = async (orderId: string, amount: number) => {
    const response = await api.post("/payment/create-sepay-payment-link", {
        orderId,    
        amount
    });
    return response.data;
}



export const processCod = async (orderId: string, userId: string) => {
  try {
    const response = await api.post("/payment/process-cod", { orderId, userId });
    return response.data;
  } catch (err) {
    // Chuẩn hoá message để UI toast được đúng
    if (axios.isAxiosError(err)) {
      const msg =
        (err.response?.data as any)?.message || // NestJS hay trả message
        (err.response?.data as any)?.error ||   // vài case khác
        err.message ||
        "Xảy ra lỗi khi xử lý COD";
      throw new Error(msg);
    }
    throw new Error("Xảy ra lỗi khi xử lý COD");
  }
};



export const updateOrderStatus = async (orderId: string, status: string) => {
    const response = await api.patch(`/payment/update-order-status/${orderId}`, { status });
    return response.data;
}

export const updatePaymentStatus = async (orderId: string, status: string) => {
    const response = await api.patch(`/order/update-payment-status/${orderId}`, { status });
    return response.data;
}