"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useMobile";

export default function ImageGallery({
    mainImages,
    imageColor,
}: {
    mainImages: { id: number; url: string }[];
    imageColor?: string;
}) {
    const [current, setCurrent] = React.useState(0);
    const mainCarousel = React.useRef<any>(null);
    const mainImageRef = React.useRef<HTMLDivElement>(null);

    const handleSelect = (index: number) => {
        setCurrent(index);
        mainCarousel.current?.scrollTo(index);

    };

    const isDesktop = useIsMobile();

    return (
        <div className="flex w-full gap-3">
            {/* Thumbnail list */}
            <div className="hidden sm:block">
                <ScrollArea
                    // Chiều cao thumbnail khớp với ảnh chính
                    className={cn(
                        "w-24",
                        mainImageRef.current ? "" : "h-[500px]" // fallback khi chưa load ảnh
                    )}
                    style={{
                        height: mainImageRef.current
                            ? `${mainImageRef.current.clientHeight}px`
                            : undefined,
                    }}
                >
                    <div className="flex flex-col gap-2">
                        {mainImages.map((img, i) => (
                            <button
                                key={img.id}
                                onClick={() => handleSelect(i)}
                                className={cn(
                                    "overflow-hidden rounded-md transition-all border",
                                    i === current
                                        ? "border-black"
                                        : "border-transparent hover:border-foreground/30"
                                )}
                            >
                                <img
                                    src={img.url}
                                    alt={`Thumbnail ${i + 1}`}
                                    className="w-full h-24 object-cover"
                                    draggable={false}
                                />
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Carousel */}
            <div className="relative w-full"  ref={mainImageRef}>
                <Carousel
                    setApi={(api) => {
                        mainCarousel.current = api;
                        api?.on("select", () => setCurrent(api.selectedScrollSnap()));
                    }}
                    className="w-full"
                >
                    <CarouselContent className="">
                        {mainImages.map((img, i) => (
                            <CarouselItem key={img.id}>
                                <Card className="border-0 p-0 shadow-none">
                                    <CardContent className="flex items-center justify-center px-0 py-0">
                                        <div className={cn("relative w-full rounded-lg overflow-hidden", isDesktop ? "" : "aspect-square")}>
                                            <img
                                                src={img.url}
                                                alt="Product image"
                                                className="w-full h-full object-contain"
                                                draggable={false}
                                            />
                                            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded sm:hidden">
                                                {i + 1}/{mainImages.length}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    {/* Nút tiến / lùi */}
                    <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md" />
                    <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md" />
                </Carousel>
            </div>
        </div>
    );
}
