import { getProductbyId } from "@/lib/api/get-product";
import ImageGallery from "./components/image-gallery";
import ProductInformation from "./components/product-information";
import { Product } from "@/lib/types/create-product";
import ReviewProduct from "./components/review-product";




export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
    const { slug } = params;
    console.log("Fetching product detail for slug:", slug);
    const data = await getProductbyId(slug);
    console.log("Product Detail Data:", data);
    const product: Product = data.data;
    if (!product) {
        return <div>Product not found</div>;
    }
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-12">

                {/* Hình ảnh sản phẩm */}
                <div>
                    <ImageGallery mainImages={product.images}></ImageGallery>
                </div>


                {/* Thông tin sản phẩm */}
                <div className="">
                    {product && <ProductInformation product={product}></ProductInformation>}
                </div>


            </div>

            <div className="max-w-5xl mx-auto mt-8 text-center border-t">
                <div className="sm:text-sm md:text-md font-medium">
                    Một số sản phẩm bạn có thể thích
                </div>
            </div>
            <div className="max-w-5xl mx-auto mt-12 text-center border-t">
                <div className="sm:text-sm md:text-md font-medium ">Đánh giá của người dùng</div>
                <div>
                    <ReviewProduct productId={product.id} />
                </div>
            </div>
        </div>
    );
}