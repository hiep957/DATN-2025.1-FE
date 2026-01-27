
import { Suspense } from "react";

import { BASE_URL } from "@/lib/axios";
import ProductClient from "./product-client";
const fetchSizes = async () => {
    const res = await fetch(`${BASE_URL}/products/sizes`, {
        method: 'GET',
        headers:{"ngrok-skip-browser-warning": "true",
        }
    });
    const json = await res.json();
    return json.data;
}

const fetchColors = async () => {
    const res = await fetch(`${BASE_URL}/products/colors`, {
        method: 'GET',
        headers:{"ngrok-skip-browser-warning": "true",
        }
    });
    const json = await res.json();
    return json.data;
}

export default async function ProductsPage() {

    const [sizes, colors] = await Promise.all([
        fetchSizes(),
        fetchColors(),
    ]);
    return (
        <div className="">
            <Suspense fallback={<div className="p-6">Đang tải sản phẩm...</div>}>
                <ProductClient sizes={sizes} colors={colors} />
            </Suspense>
        </div>

    )
}