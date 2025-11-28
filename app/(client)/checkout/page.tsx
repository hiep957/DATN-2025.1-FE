"use client";

import { useCartStore } from "@/store/useCartStore";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CartItemProps } from "../carts/_components/CartArea";
import z from "zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrder, CreateOrderPayload, createPaymentLink, processCod } from "@/lib/api/payment";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { getCart } from "@/lib/api/cart";

const formCheckouSchema = z.object({
    customer_name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    customer_phone: z.string().min(10, "Số điện thoại không hợp lệ"),
    customer_address: z.string().min(5, "Địa chỉ không hợp lệ"),
    customer_email: z.string().email("Email không hợp lệ"), // ← sửa
    note: z.string().optional(),
    payment_method: z.enum(["cod", "vnpay"]),
})

type FormCheckoutValues = z.infer<typeof formCheckouSchema>;

export default function CheckoutPage() {
    const [loading, setLoading] = useState<boolean>(false);
    const user = useAuthStore(state => state.user);
    const form = useForm<FormCheckoutValues>({
        resolver: zodResolver(formCheckouSchema),
        defaultValues: {
            customer_name: "",
            customer_phone: "",
            customer_address: "",
            customer_email: "",
            note: "",
            payment_method: "cod",
        }
    })


    const searchParams = useSearchParams();
    const allItems = useCartStore(state => state.items);
    const [checkoutItems, setCheckoutItems] = useState<CartItemProps[]>([]);
    const [totalAmount, setTotalAmount] = useState<number>(0);

    useEffect(() => {
        // 1. Lấy chuỗi ID từ URL
        const idsParam = searchParams.get('ids');
        const totalParam = searchParams.get('total');
        if (totalParam) {
            setTotalAmount(parseFloat(totalParam));
        }
        if (idsParam) {
            // 2. Tách chuỗi thành mảng ID
            const selectedIds = idsParam.split(',');

            // 3. Lọc các sản phẩm từ store dựa trên ID
            const items = allItems.filter(item =>
                selectedIds.includes(item.variant.id.toString())
            );
            setCheckoutItems(items);
        }
    }, [searchParams, allItems]);

    const onSubmit = async (data: FormCheckoutValues) => {
        setLoading(true);
        if (!user) {
            toast.error("Bạn cần đăng nhập để có thể thanh toán")
        }
        // Quá trình thanh toán bắt đầu
        console.log("Dữ liệu thanh toán:", data);
        console.log("Sản phẩm thanh toán:", checkoutItems.map(item => ({
            productVariantId: item.variant.id,
            quantity: item.quantity,
            unit_price: item.variant.price,
            productName: item.productName,
            productId: item.productId,
            link_image: item.productImage,
        })));
        const payload: CreateOrderPayload = {
            userId: Number(user?.id),
            customer_name: data.customer_name,
            customer_phone: data.customer_phone,
            customer_email: data.customer_email,
            shipping_address: data.customer_address,
            note: data.note,
            order_status: "pending",
            payment_method: data.payment_method,
            payment_status: "unpaid",
            subtotal: totalAmount,
            shipping_fee: 0,
            discount_amount: 0,
            grand_total: Number(totalAmount),
            orderItems: checkoutItems.map(item => ({
                productVariantId: item.variant.id,
                quantity: item.quantity,
                unit_price: Number(item.variant.price),
                productName: item.productName,
                productId: item.productId,
                link_image: item.productImage,
            }))
        }
        const res = await createOrder(payload)
        console.log("Kết quả tạo đơn hàng:", res);
        if (res.statusCode === 201) {
            //Gọi đến tạo link thanh toán VNPay
            if (data.payment_method == "vnpay") {
                const paymentLinkRes = await createPaymentLink(res.data.id, Number(totalAmount));
                if (paymentLinkRes.statusCode === 201) {
                    // Chuyển hướng người dùng đến link thanh toán VNPay
                    window.location.href = paymentLinkRes.data.paymentUrl;
                    setLoading(false);
                }
                else {
                    setLoading(false);
                    toast.error(paymentLinkRes.message || "Tạo liên kết thanh toán thất bại")
                }
            }
            if (data.payment_method == "cod") {
                const paymentCodProcess = await processCod(res.data.id, String(user?.id));
                if (paymentCodProcess.statusCode === 201) {
                    toast.success("Đặt hàng thành công! Vui lòng chờ nhân viên liên hệ để xác nhận đơn hàng.")
                    const cart = await getCart();
                    useCartStore.getState().setCart(cart.data.items);
                    setLoading(false);
                }
                else {
                    setLoading(false);
                    toast.error(paymentCodProcess.message || "Xử lý COD thất bại")
                }
            }
        }
        else {
            setLoading(false);
            toast.error(res.message || "Tạo đơn hàng thất bại")
        }

    }





    return (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="font-bold">Thông tin cá nhân</div>


                        <div className="grid grid-cols md:grid-cols-2 space-x-2 space-y-2">
                            <FormField
                                control={form.control}
                                name="customer_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tên</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nhập tên của bạn" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="customer_phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Số điện thoại</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nhập tên của bạn" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="customer_email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nhập email của bạn" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="customer_address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Địa chỉ</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nhập địa chỉ của bạn" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="note"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ghi chú</FormLabel>
                                        <FormControl>
                                            <Textarea {...field}
                                                placeholder="Ghi chú cho đơn hàng"
                                                className="min-h-[100px]"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="payment_method"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phương thức thanh toán</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                className="flex flex-col space-y-2"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="vnpay" id="payment‑vnpay" />
                                                    <Label htmlFor="payment‑vnpay">VNPay (thanh toán online)</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="cod" id="payment‑cod" />
                                                    <Label htmlFor="payment‑cod">Thanh toán khi nhận (COD)</Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? "Đang xử lý..." : "Thanh toán"}
                        </Button>
                    </form>
                </Form>

            </div>
            <div>
                <h2 className="text-2xl font-bold mb-4">Đơn hàng của bạn</h2>
                <div className="rounded-lg border p-4 space-y-4 h-fit sticky top-6">
                    <div>
                        <p className="text-sm text-muted-foreground">Tổng thanh toán</p>
                        <p className="text-2xl font-bold">
                            {totalAmount.toLocaleString("vi-VN")}₫
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Đã chọn 1 sản phẩm
                    </p>

                </div>
            </div>
        </div>
    )
}