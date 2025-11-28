
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


export type Product = {
    id: number;
    name: string;
    slug: string;
    description?: string;
    category: {
        id: number;
        name: string;
        slug: string;
        thumbnail: string;
    };
    brand?: {
        id: number;
        name: string;
        slug: string;
        logo_url: string;
    },
    is_published: boolean;
    sold: number;
    created: string;
    specs?: Record<string, any>;
    image_colors?: Record<string, any>;
    images: { id: number; url: string }[];
    variants: {
        id: number;
        sku: string;
        price: string;
        compare_at_price?: string;
        quantity: number;
        color: { id: number; code: string; name: string, englishName?: string };
        size: { id: number; code: string; name: string };
    }[]
}