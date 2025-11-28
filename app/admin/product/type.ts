export interface Color { id: number; code: string; name: string, englishName?: string }
export interface Size { id: number; code: string; name: string }
export interface Category { id: number; name: string; slug: string; thumbnail?: string, parentId?: number | null }
export interface Brand { id: number; name: string; slug: string; logo_url?: string }
export interface Image { id: number; url: string }
export type ImageColors = Record<string | number, { url: string }>


export interface Variant {
    id: number;
    sku: string;
    price: string; // keep string to match API
    compare_at_price?: string; // keep string to match API
    quantity: number;
    color: Color;
    size: Size;
}


export interface Product {
    id: number;
    name: string;
    slug: string;
    description?: string;
    category: Category;
    brand?: Brand;
    is_published: boolean;
    created: string; // ISO string
    specs?: Record<string, unknown> | null;
    image_colors?: ImageColors;
    images?: Image[];
    variants: Variant[];
}




// Server response from NestJS list endpoint
export interface Paginated<T> {
    total: number;
    page: number; // 1-based
    limit: number;
    totalPages: number;
    data: T[];
}


export interface ListResponse<T> {
    statusCode: number;
    message: string;
    data: Paginated<T>;
}


export const fakeCategories: Category[] = [
    { id: 1, name: "Nam", slug: "nam", thumbnail: "/public/nam.jpg" },
    { id: 3, name: "Áo thun nam", slug: "ao-thun-nam", thumbnail: "/public/ao-thun-nam.jpg", parentId: 1 },
    { id: 6, name: "Áo Vest và Blazer", slug: "ao-vest-blazer", thumbnail: "/public/ao-vest-blazer.jpg", parentId: 1 },
    { id: 2, name: "Nữ", slug: "nu", thumbnail: "/public/nu.jpg" },
    
];