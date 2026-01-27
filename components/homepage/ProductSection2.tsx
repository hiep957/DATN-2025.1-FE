
import { ProductCard } from "@/app/(client)/products/components/ProductCard";
import { Product } from "@/app/admin/product/type";
import { transformProductToCard } from "@/lib/utils";
import { BASE_URL } from "@/lib/axios";

async function getAoKhoacNamProducts(): Promise<any> {
    const res = await fetch(`${BASE_URL}/products?category=ao-khoac-nam&limit=4`, {
        method: 'GET',
    });
    const json = await res.json();
    if (!res.ok) {
        throw new Error("Failed to fetch áo khoác nam products");
    }
    return json.data;
}


export default async function ProductSection2() {
    const data = await getAoKhoacNamProducts();

    const product: Product[] = data.data;
    const productCards = product.map((p) => transformProductToCard(p));
    console.log(productCards.length);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 md:mt-4">
            {productCards.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>


    )

}