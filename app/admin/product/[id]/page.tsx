"use client"
import { fetchProductById } from "@/lib/api/auth";
import { Product } from "@/lib/types/create-product";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";



export default function TestEdit() {
    const params = useParams();
    const productId = params?.id as string;
    const [data, setData] = useState<Product | null>(null)
    useEffect(() => {
        if (!productId) return
        const getData = async () => {
            const res = await fetchProductById(productId)
            setData(res.data.data)
        }
        getData()
    }, [productId])
    if (!data) return <div>Đang tải...</div>
    return (
        <div>
            <h1>Sửa sản phẩm: {data.name}</h1>
            <p>ID: {productId}</p>
        </div>
    )
}