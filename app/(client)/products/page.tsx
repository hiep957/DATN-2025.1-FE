
import ProductClient from "./product-client";
import { BASE_URL } from "@/lib/axios";
const fetchSizes = async () => {
    const res = await fetch(`${BASE_URL}/products/sizes`, {
        method: 'GET',
    });
    const json = await res.json();
    return json.data;
}
const fetchCategories = async () => {
    const res = await fetch(`${BASE_URL}/products/categories`, {
        method: 'GET',
    });
    const json = await res.json();
    return json.data;
}

const fetchColors = async () => {
    const res = await fetch(`${BASE_URL}/products/colors`, {
        method: 'GET',
    });
    const json = await res.json();
    return json.data;
}

export default async function ProductsPage() {

    const [categories, sizes, colors] = await Promise.all([
        fetchCategories(),
        fetchSizes(),
        fetchColors(),
    ]);

    // Chuyển sizes, colors sang mảng
   

    // console.log({ categories, sizes, colors });
    // console.log("Types of fetched data:", {
    //     categoriesType: typeof categories,
    //     sizesType: typeof sizes,
    //     colorsType: typeof colors,
    // });

    return (
        <div className="">
            <ProductClient categories={categories} sizes={sizes} colors={colors} />
        </div>

    )
}