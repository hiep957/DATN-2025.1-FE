"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"





export default function ProductPage() {
    const router = useRouter()
    return (
        <div>
            <div>Product Page</div>
            <Button onClick={() => router.push("/admin/product/add-product")}>Thêm sản phẩm</Button>
        </div>
    )

}