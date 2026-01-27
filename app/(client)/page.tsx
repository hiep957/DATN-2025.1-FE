
import ChatWidget from "@/components/chat";
import ProductSection1 from "@/components/homepage/ProductSection1";
import ProductSection2 from "@/components/homepage/ProductSection2";
import ProductSection3 from "@/components/homepage/ProductSection3";
import { HeroSlider } from "@/components/layout/HeroSection";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/axios";
import Link from "next/link";


const HomePage = async () => {
    return (
        <div>
            <HeroSlider />
            <Separator className="mt-2" />
            <div className="w-full mt-4 ">
                <Link href="/products?category=ao-khoac-nam">
                    <p className="flex justify-center font-medium">Áo khoác nam</p>
                </Link>
                <ProductSection2 />
            </div>
            <Separator className="mt-2" />

            <div className="w-full mt-4 ">
                <Link href="/products?category=ao-thun-nam">
                    <p className="flex justify-center font-medium">Áo thun nam</p>
                </Link>
                <ProductSection1 />

            </div>

            <Separator className="mt-2" />

            <div className="w-full mt-4 ">
                <Link href="/products?category=ao-khoac-nu">
                    <p className="flex justify-center font-medium">Áo khoác nữ</p>
                </Link>
                <ProductSection3 />

            </div>

        </div>
    )
}

export default HomePage;