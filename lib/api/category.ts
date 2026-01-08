import { Category } from "@/app/admin/product/type";
import api from "../axios";

export type CreateCategoryPayload = {
    name: string;
    slug: string;
    thumbnail?: string | null;
    parentId?: number | null;
}

export const createCategory = async (categoryData: CreateCategoryPayload) => {
    const response = await api.post("/category/create", categoryData);
    return response.data;
}

export const updateCategory = async (id: number, categoryData: CreateCategoryPayload) => {
    const response = await api.patch(`/category/${id}`, categoryData);
    return response.data;
}

export const getCategory = async () => {
    const response = await api.get("/category");
    return response.data;
}


export const getColors = async () => {
    const response = await api.get("/products/colors");
    return response.data;
}
export const getSizes = async () => {
    const response = await api.get("/products/sizes");
    return response.data;
}

export const createSize = async (code: string, name: string) => {
    const response = await api.post("/category/create-size", { code, name });
    return response.data;
}

export const createColor = async (code: string, name: string, englishName: string) => {
    const response = await api.post("/category/create-color", { code, name, englishName });
    return response.data;
}

export async function fetchCategories(): Promise<Category[]> {
    const res = await api.get("/category");
    if (!res) throw new Error("Failed to fetch");
    return res.data.data.data;
}