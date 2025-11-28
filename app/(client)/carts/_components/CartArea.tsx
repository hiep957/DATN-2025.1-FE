"use client";
import { Variant } from "@/app/admin/product/type";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { addItemToCart, decreaseItem } from "@/lib/api/cart";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { toast } from "sonner";

export type CartItemProps = {
    variant: Variant;
    quantity: number;
    productName: string;
    productId: number;
    productImage: string;
}

type CartAreaProps = {
    items: CartItemProps[];
    selectedIds: string[]
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
}

export default function CartArea({ items, selectedIds, setSelectedIds }: CartAreaProps) {

    console.log("Cart Area Items:", items);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const { addItemGuest } = useCartStore();
    const handleAddtoCart = async (item: CartItemProps) => {
        if (isAuthenticated) {
            console.log("Thêm vào giỏ hàng cho người dùng đã đăng nhập:", item.variant.id, item.productId, item.productName, item.productImage);
            const response = await addItemToCart({
                variantId: item.variant.id,
                quantity: 1,
                productId: item.productId,
                productName: item.productName,
                productImage: item.productImage,
            })
            console.log("Phản hồi sau khi thêm vào giỏ hàng:", response);
            if (response) {
                toast.success("Đã thêm vào giỏ hàng!");
                useCartStore.getState().setCart(response.data.items);
            } else {
                toast.error("Thêm vào giỏ hàng thất bại.");
            }

        } else {
            addItemGuest({
                variant: item.variant,
                quantity: 1,
                productId: item.productId,
                productName: item.productName,
                productImage: item.productImage,
            });
            toast.success("Đã thêm vào giỏ hàng!");
        }

    }

    const handleDecreaseQuantity = async (variantId: number) => {
        if (isAuthenticated) {
            const response = await decreaseItem(variantId);
            if (response) {
                toast.success("Đã giảm số lượng!");
                useCartStore.getState().setCart(response.data.items);
            } else {
                toast.error(response?.message || "Giảm số lượng thất bại.");
            }
        } else {
            useCartStore.getState().decreaseItemQuantity(variantId);
            toast.success("Đã giảm số lượng!");
        }
    }


    const toggleSelect = (variantId: string, checked: boolean | "indeterminate") => {
        const isChecked = checked === true;
        setSelectedIds((prev) => {
            if (isChecked) {
                return [...prev, variantId];
            } else {
                return prev.filter(id => id !== variantId);
            }
        })
    }

    return (
        <div>
            <Card className="min-h-[60vh] lg:min-h-[70vh] p-0 w-full">

                <div className="min-h-0">
                    <ScrollArea className="h-[60vh] lg:h-[70vh] px-2 sm:px-6 py-4">
                        <ul className="space-y-4">
                            {items.map(item => (
                                <li key={item.variant.id}>
                                    <div className="flex flex-row gap-4 border p-2 md:p-4 rounded-lg h-[15vh] md:h-[20vh]">
                                        <div className={cn("flex items-center justify-center")}>
                                            <Checkbox
                                                className={cn("w-6 h-6 md:w-8 md:h-8", selectedIds.includes(item.variant.id.toString()) && "bg-green-50 border-green-400")}
                                                checked={selectedIds.includes(item.variant.id.toString())}
                                                onCheckedChange={(checked) => toggleSelect(item.variant.id.toString(), checked)}
                                                id={`item-${item.variant.id}`}
                                            />
                                        </div>
                                        <div className="flex-6 flex flex-row space-x-0.5 md:space-x-4">
                                            <div className="h-full aspect-[2/3] md:aspect-[3/4] border">
                                                <img
                                                    src={item.productImage}
                                                    className="object-cover h-full w-full"
                                                >
                                                </img>
                                            </div>
                                            <div className="flex flex-col justify-between">
                                                <div className="font-medium text-sm md:text-base">
                                                    {item.productName}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {item.variant.color.name} - {item.variant.size.name}
                                                </div>
                                                <div className="text-sm md:text-base">
                                                    Giá: {parseFloat(item.variant.price).toLocaleString("vi-VN")}đ
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-2 flex flex-col justify-center items-center">
                                            <div className="text-sm text-muted-foreground">Số lượng</div>
                                            <div className="flex flex-row gap-2 border px-4 py-2 rounded w-full md:w-1/2 justify-between items-center">
                                                <div className="cursor-pointer" onClick={() => handleDecreaseQuantity(item.variant.id)}>
                                                    -
                                                </div>
                                                <div>{item.quantity}</div>
                                                <div className="cursor-pointer" onClick={() => handleAddtoCart(item)}>
                                                    +
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}

                        </ul>
                    </ScrollArea>
                </div>
            </Card>
        </div>
    )
}