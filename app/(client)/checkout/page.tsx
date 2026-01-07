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
import { createOrder, CreateOrderPayload, createPayment, createPaymentLink, createSepayPaymentLink, processCod } from "@/lib/api/payment";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { getCart } from "@/lib/api/cart";
import { postToCheckoutUrl } from "@/lib/utils";
import { set } from "date-fns";
type Province = { code: number; name: string };
type Ward = { code: number; name: string };
const formCheckouSchema = z.object({
    customer_name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    customer_phone: z.string().min(10, "Số điện thoại không hợp lệ"),
    // customer_address: z.string().min(5, "Địa chỉ không hợp lệ"),
    street: z.string().min(5, "Số nhà/tên đường không hợp lệ"),
    ward: z.string().min(1, "Vui lòng chọn xã/phường"),
    province: z.string().min(1, "Vui lòng chọn tỉnh/thành phố"),
    customer_email: z.string().email("Email không hợp lệ"), // ← sửa
    note: z.string().optional(),
    payment_method: z.enum(["cod", "vnpay", 'sepay']),
})

type FormCheckoutValues = z.infer<typeof formCheckouSchema>;

export default function CheckoutPage() {
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);

    const [loading, setLoading] = useState<boolean>(false);
    const user = useAuthStore(state => state.user);
    const form = useForm<FormCheckoutValues>({
        resolver: zodResolver(formCheckouSchema),
        defaultValues: {
            customer_name: "",
            customer_phone: "",
            // customer_address: "",
            street: "",
            ward: "",
            province: "",
            customer_email: "",
            note: "",
            payment_method: "cod",
        }
    })
    const provinceValue = form.watch("province");

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

    useEffect(() => {
        const fetchProvinces = async () => {
            const res = await fetch("https://provinces.open-api.vn/api/v2/p/");
            const data = await res.json();
            setProvinces(data);
        };
        fetchProvinces();
    }, []);
    useEffect(() => {
        const fetchWards = async () => {
            if (!provinceValue) {
                setWards([]);
                form.setValue("ward", "");
                return;
            }

            const res = await fetch(
                `https://provinces.open-api.vn/api/v2/p/${provinceValue}?depth=2`
            );
            const data = await res.json();

            const wardList: Ward[] = data?.wards ?? [];
            wardList.sort((a, b) => a.name.localeCompare(b.name, "vi"));

            setWards(wardList);
            form.setValue("ward", ""); // reset ward mỗi khi đổi tỉnh
        };

        fetchWards();
    }, [provinceValue, form]);



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
        const provinceName = provinces.find(p => String(p.code) === data.province)?.name ?? "";
        const wardName = wards.find(w => String(w.code) === data.ward)?.name ?? "";
        const fullAddress = `${data.street}, ${wardName}, ${provinceName}`;

        const payload: CreateOrderPayload = {
            userId: Number(user?.id),
            customer_name: data.customer_name,
            customer_phone: data.customer_phone,
            customer_email: data.customer_email,
            shipping_address: fullAddress,
            note: data.note,
            order_status: "pending",
            payment_method: data.payment_method,
            payment_status: "unpaid",
            subtotal: totalAmount,
            shipping_fee: 0,
            discount_amount: 0,
            grand_total: 2000,
            // Number(totalAmount),
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
            const resPayment = await createPayment(payload.payment_method.toUpperCase() as 'COD' | 'VNPAY' | 'SEPAY', res.data.id, payload.grand_total);
            console.log("Kết quả tạo thanh toán:", resPayment);

            if (resPayment.statusCode === 201) {
                if (data.payment_method === "cod") {
                    toast.success("Đặt hàng thành công! Vui lòng chờ nhân viên liên hệ xác nhận.");
                    window.location.href = "/payment";
                    setLoading(false);

                }
                else if (data.payment_method === "sepay") {
                    postToCheckoutUrl(resPayment.data.checkoutUrl, resPayment.data.fields);
                    setLoading(false);
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
                                name="street"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Số nhà, tên đường</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ví dụ: 12 Nguyễn Trãi" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="province"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tỉnh / Thành phố</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Chọn tỉnh/thành phố" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {provinces.map((p) => (
                                                    <SelectItem key={p.code} value={String(p.code)}>
                                                        {p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="ward"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Xã / Phường</FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            disabled={!provinceValue || wards.length === 0}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder={!provinceValue ? "Chọn tỉnh trước" : "Chọn xã/phường"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {wards.map((w) => (
                                                    <SelectItem key={w.code} value={String(w.code)}>
                                                        {w.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

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
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="sepay" id="payment‑sepay" />
                                                    <Label htmlFor="payment‑sepay">Sepay (thanh toán online)</Label>
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