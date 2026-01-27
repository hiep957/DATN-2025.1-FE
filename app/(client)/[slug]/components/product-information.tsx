"use client";
import { Accordion, AccordionContent, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { addItemToCart } from "@/lib/api/cart";

import { Product } from "@/lib/types/create-product";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { AccordionItem } from "@radix-ui/react-accordion";
import { add } from "date-fns";
import React, { use } from "react";
import { toast } from "sonner";
import { SizeGuidePopup } from "./size-guide-popup";

export type VariantProps = {
    id: number;
    sku: string;
    price: string;
    compare_at_price?: string;
    quantity: number;
    color: { id: number; code: string; name: string, englishName?: string };
    size: { id: number; code: string; name: string };
}

// Tách type ra cho dễ quản lý
type Color = VariantProps['color'];
type Size = VariantProps['size'];

export default function ProductInformation({ product }: { product: Product }) {
    console.log("Product Information Props:", product);
    const { isAuthenticated } = useAuthStore();
    const { addItemGuest } = useCartStore();
    const [sold, setSold] = React.useState<number>(0);

    React.useEffect(() => {
        if (product.variants && product.variants.length > 0) {
            const totalSold = product.variants.reduce((acc, variant) => acc + (variant.sold || 0), 0);
            setSold(totalSold);
        }
    }, [product.variants]);

    // 1. Lấy biến thể mặc định
    const initialVariant = product.variants.length > 0 ? product.variants[0] : null;

    // 2. State: Chỉ cần lưu màu và size đang được chọn
    const [selectedColor, setSelectedColor] = React.useState<Color | undefined>(initialVariant?.color);
    const [selectedSize, setSelectedSize] = React.useState<Size | undefined>(initialVariant?.size);

    // 3. Dữ liệu suy ra (Derived Data) dùng useMemo để tối ưu

    // Lấy danh sách màu sắc duy nhất để render
    const uniqueColors = React.useMemo(() => {
        const colorsMap = new Map<number, Color>();
        product.variants.forEach(variant => {
            if (!colorsMap.has(variant.color.id)) {
                colorsMap.set(variant.color.id, variant.color);
            }
        });
        return Array.from(colorsMap.values());
    }, [product.variants]);

    // Lấy danh sách size khả dụng dựa trên màu đã chọn
    const availableSizes = React.useMemo(() => {
        if (!selectedColor) return [];
        return product.variants
            .filter(variant => variant.color.id === selectedColor.id)
            .map(variant => variant.size);
    }, [selectedColor, product.variants]);

    // Tìm biến thể (variant) đầy đủ dựa trên màu và size đã chọn
    const selectedVariant = React.useMemo(() => {
        if (!selectedColor || !selectedSize) return initialVariant;

        return product.variants.find(
            v => v.color.id === selectedColor.id && v.size.id === selectedSize.id
        ) ?? initialVariant; // Fallback về variant ban đầu nếu không tìm thấy
    }, [selectedColor, selectedSize, product.variants, initialVariant]);

    console.log("Selected Variant:", selectedVariant);


    // 4. Event Handlers

    // Khi người dùng chọn màu mới
    const handleColorSelect = (color: Color) => {
        setSelectedColor(color);
        // Tự động chọn size đầu tiên có sẵn cho màu mới này
        const firstAvailableSize = product.variants.find(v => v.color.id === color.id)?.size;
        if (firstAvailableSize) {
            setSelectedSize(firstAvailableSize);
        }
    };

    // Khi người dùng chọn size
    const handleSizeSelect = (size: Size) => {
        setSelectedSize(size);
    };

    // Helper để format tiền
    const formatPrice = (price: number) => {
        return price.toLocaleString('vi-VN') + '₫';
    }

    const handleAddtoCart = async () => {
        if (!selectedVariant) {
            toast.error("Vui lòng chọn biến thể sản phẩm hợp lệ.");
            return;
        }
        if (isAuthenticated) {
            console.log("Thêm vào giỏ hàng cho người dùng đã đăng nhập:", selectedVariant.id, product.id, product.name, product.images[0]?.url);
            const response = await addItemToCart({
                variantId: selectedVariant.id,
                quantity: 1,
                productId: product.id,
                productName: product.name,
                productImage: product.images[0]?.url || '',
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
                variant: selectedVariant!,
                quantity: 1,
                productId: product.id,
                productName: product.name,
                productImage: product.images && product.images.length > 0 ? product.images[0].url : '',
            });
            toast.success("Đã thêm vào giỏ hàng!");
        }

    }

    const handleDecreaseQuantity = () => {

    }

    return (
        <div className="flex flex-col">
            <p className="text-2xl font-bold">{product.name}</p>
            <p className="text-sm text-gray-500 mb-4">{product.slug}</p>
            <p className="text-sm text-gray-600 mb-4">Đã bán: {sold}</p>
            {/* Hiển thị giá */}
            <div className="mb-4">
                {selectedVariant?.compare_at_price && Number(selectedVariant.compare_at_price) > Number(selectedVariant.price) && (
                    <span className="line-through text-gray-500 mr-2">
                        {formatPrice(Number(selectedVariant.compare_at_price))}
                    </span>
                )}
                <span className="font-bold text-xl text-red-600">
                    {selectedVariant ? formatPrice(Number(selectedVariant.price)) : 'Hết hàng'}
                </span>
            </div>

            {/* Chọn màu sắc */}
            <div className="mt-4">
                <p className="font-medium">Màu sắc: <span className="font-normal">{selectedColor?.name}</span></p>
                <div className="flex flex-wrap gap-2 mt-2">
                    {uniqueColors.map((color) => (
                        <button
                            key={color.id}
                            title={color.name}
                            onClick={() => handleColorSelect(color)}
                            // Thêm style (viền) cho màu đang được chọn
                            className={`h-8 w-8 md:h-10 md:w-10 rounded-full border-2 p-0.5 cursor-pointer
                                ${selectedColor?.id === color.id ? 'border-blue-500' : 'border-slate-300 hover:border-slate-500'}
                            `}
                        >
                            <div className="h-full w-full rounded-full" style={{ backgroundColor: color.code }} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Chọn Kích cỡ */}
            <div className="mt-4">
                <p className="font-medium">Kích cỡ: <span className="font-normal">{selectedSize?.name}</span></p>
                <div className="flex flex-wrap gap-2 mt-2">
                    {availableSizes.map((size) => (
                        <button
                            key={size.id}
                            onClick={() => handleSizeSelect(size)}
                            // Thêm style cho size đang được chọn
                            className={`px-4 py-2 border rounded cursor-pointer
                                ${selectedSize?.id === size.id ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-300 hover:border-slate-500'}
                            `}
                        >
                            {size.name}
                        </button>
                    ))}
                </div>
            </div>

            <Button className="flex items-center md:w-1/4 mt-4" onClick={handleAddtoCart}>Thêm vào giỏ hàng</Button>

            {/* Thông tin thêm (SKU, số lượng) */}
            <div className="mt-6 text-sm text-gray-600">
                <p>Số lượng còn lại: {selectedVariant?.quantity ?? 0}</p>
            </div>
            <div className="mt-4">
                <SizeGuidePopup />
            </div>



        </div>
    )
}