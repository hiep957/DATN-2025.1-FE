
import ChatWidget from "@/components/chat";
import ProductSection1 from "@/components/homepage/ProductSection1";
import { HeroSlider } from "@/components/layout/HeroSection";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/axios";


const HomePage = async () => {

    

    return (
        <div>
            <HeroSlider />
            <Separator className="mt-2" />
            <div className="w-full mt-4 ">
                <p className="flex justify-center font-medium">Áo thun nam</p>
                <ProductSection1/>
            </div>
           
        </div>
    )
}

export default HomePage;