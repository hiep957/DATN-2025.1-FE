"use client" // Cần thiết vì component này có tương tác (state, ref)

import * as React from "react"
// Import plugin Autoplay
import Autoplay from "embla-carousel-autoplay"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel" // Đảm bảo đường dẫn chính xác
import { Button } from "@/components/ui/button"
import Image from "next/image" // Luôn dùng next/image để tối ưu
import { useIsMobile } from "@/hooks/use-mobile"

// Dữ liệu giả lập cho các slide
const heroSlides = [
  {
    imageMobile: "https://buggy.yodycdn.com/images/home-banner-mb/e3776774d28d3aa6b845e3749d2e9cc1.webp?width=750&height=1000",
    image: "https://res.cloudinary.com/dmlfolzmj/image/upload/v1761188722/nestjs_uploads/slide2_1761188721312.jpg", // Đường dẫn đến ảnh
    title: "Bộ Sưu Tập Mùa Hè 2025",
    description: "Giảm giá đặc biệt cho tất cả sản phẩm mới.",
    ctaText: "Mua Ngay",
    ctaLink: "/collections/summer",
  },
  {
    imageMobile: "https://buggy.yodycdn.com/images/home-banner-mb/0489afe22d77283077fa6c3419f4b06f.webp?width=750&height=1000",
    image: "https://res.cloudinary.com/dmlfolzmj/image/upload/v1761188723/nestjs_uploads/slide1_1761188721316.jpg",
    title: "Flash Sale 50%",
    description: "Chỉ diễn ra trong 24h. Đừng bỏ lỡ!",
    ctaText: "Xem Chi Tiết",
    ctaLink: "/sales/flash-sale",
  },
  {
    imageMobile:"https://buggy.yodycdn.com/images/home-banner-mb/97a87c878240fb910b585296e697d114.webp?width=750&height=1000",
    image: "https://res.cloudinary.com/dmlfolzmj/image/upload/v1761188723/nestjs_uploads/slide3_1761188722086.jpg",
    title: "Miễn Phí Vận Chuyển",
    description: "Cho mọi đơn hàng trên 500.000đ.",
    ctaText: "Tìm Hiểu Thêm",
    ctaLink: "/shipping-policy",
  },
]

export function HeroSlider() {
    const isMobile = useIsMobile()
    console.log('isMobile in HeroSlider:', isMobile);
  // Setup plugin autoplay
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  return (
    <section className="w-full">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        // Thêm 2 dòng này để khi rê chuột vào, slider sẽ dừng
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        opts={{
          loop: true, // Cho phép lặp vô tận
        }}
      >
        <CarouselContent>
          {heroSlides.map((slide, index) => (
            <CarouselItem key={index}>
              {/* Mỗi slide là 1 div relative */}
              <div className="relative w-full h-[400px] md:h-[400px] lg:h-[400px] overflow-hidden rounded-lg border bg-sky-50">
                {/* Ảnh nền dùng next/image */}
                <Image
                  src={isMobile ? slide.imageMobile : slide.image}
                  alt={slide.title}
                  fill // fill sẽ lấp đầy div cha
                  className="object-cover" // Đảm bảo ảnh cover đẹp
                  priority={index === 0} // Ưu tiên load ảnh đầu tiên
                />
                
                {/* Lớp phủ mờ để làm nổi bật text */}
                {/* <div className="absolute inset-0 bg-black/40" /> */}

                {/* Nội dung Text và Nút CTA */}
                {/* <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-6">
                  <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg mb-4">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-2xl max-w-2xl drop-shadow-md mb-8">
                    {slide.description}
                  </p>
                  <Button asChild size="lg" className="text-lg font-semibold">
                    <a href={slide.ctaLink}>{slide.ctaText}</a>
                  </Button>
                </div> */}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Nút Prev/Next (Ẩn trên mobile cho gọn) */}
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:inline-flex" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:inline-flex" />
      </Carousel>
      
    </section>
  )
}