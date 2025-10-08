
export type CreateProductInput = {
    name: string;
    slug: string;
    description?: string;
    categoryId: number;
    brandId?: number;
    specs?: Record<string, any>;
    image_colors?: Record<string, any>;
    images: { url: string }[];
    variants: {
        sku: string;
        price: number;
        compare_at_price?: number;
        quantity: number;
        colorId: number;
        sizeId: number;
    }[];
}