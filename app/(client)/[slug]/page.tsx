import { getProductbyId } from "@/lib/api/get-product";
import ImageGallery from "./components/image-gallery";
import ProductInformation from "./components/product-information";
import { Product } from "@/lib/types/create-product";
import ReviewProduct from "./components/review-product";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";




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
            <div className="grid grid-cols-1 md:grid-cols-2     ">

                {/* Hình ảnh sản phẩm */}
                <div>
                    <ImageGallery mainImages={product.images}></ImageGallery>
                </div>


                {/* Thông tin sản phẩm */}
                <div className="">
                    {product && <ProductInformation product={product}></ProductInformation>}
                </div>
            </div>

            <div >
                <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                >
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="w-full py-4 text-left font-medium border-b">
                            Mô tả sản phẩm
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4 text-sm text-gray-700 whitespace-pre-line">
                            {product.description || 'Không có mô tả cho sản phẩm này.'}
                        </AccordionContent>
                    </AccordionItem>

                </Accordion>
            </div>

            <div className="mt-8 border-b">
                <div className="sm:text-sm md:text-md font-medium">
                    Một số sản phẩm bạn có thể thích
                </div>
            </div>
            <div className="mt-12">
                <div className="sm:text-sm md:text-md font-medium border-b ">Đánh giá của người dùng</div>
                <div>
                    <ReviewProduct productId={product.id} />
                </div>
            </div>
        </div>
    );
}