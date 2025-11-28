import { Product } from "@/app/admin/product/type";
import { User } from "@/app/admin/user/type";


export interface Review {
    id: number;
    rating: number
    comment: string
    image_urls?: string[] | undefined
    user: User
    product: {
        id: number;
        name: string;
        slug: string;
        description: string;
        is_published: boolean;
        created: string;
        updated: string;
        image_colors?: Record<string | number, { url: string }>;
    }
    createdAt: string;
    updatedAt: string;
    shopReply?: string;
    shopRepliedAt?: string;
    status: string;
}