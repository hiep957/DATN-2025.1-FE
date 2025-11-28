
import { ProductCard } from "@/app/(client)/products/components/ProductCard";
import { Product } from "@/app/admin/product/type";
import { transformProductToCard } from "@/lib/utils";


async function getAoThunNamProducts(): Promise<any> {
    const res = await fetch("http://localhost:3000/products?category=ao-thun-nam&limit=4", {
        method: 'GET',
    });
    const json = await res.json();
    if (!res.ok) {
        throw new Error("Failed to fetch áo thun nam products");
    }
    return json.data;
}


export default async function ProductSection1() {
    const data = await getAoThunNamProducts();

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