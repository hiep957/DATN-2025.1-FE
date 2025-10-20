"use client"
import ProductForm from "@/components/form/ProductForm";
import { fetchProductById } from "@/lib/api/auth";
import { Product } from "@/lib/types/create-product";
import { ca } from "date-fns/locale";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import z from "zod";



export default function EditProductPage() {
    const params = useParams();
    const productId = params?.id as string;
  
    const [data, setData] = useState<Product | null>(null)
    useEffect(() => {
  
        if (!productId) return
        const getData = async () => {
            const res = await fetchProductById(productId)
            setData(res.data.data)
            console.log("Fetched product data:", res.data.data);
        }
        getData()
    }, [productId])
   
    if (!data) return <div>Đang tải...</div>
    return (
        <div>
            {productId && <ProductForm initialData={data} productId={productId} />}
        </div>
    )
}