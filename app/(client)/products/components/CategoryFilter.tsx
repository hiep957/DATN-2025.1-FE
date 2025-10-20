"use client";

import { Category } from "@/app/admin/product/type";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export default function CategoryFilter({
    categories,
    value,
    onChange,
}: {
    categories: Category;
    value: string;
    onChange: (v: string) => void;
}) {
    const [categoryList, setCategoryList] = useState<Category[]>([]);
    const params = useSearchParams();
    const categoriesArray = Array.isArray(categories) ? categories : Object.values(categories);
    //lấy slug từ params xuống
    const slug = params.get("category") || "";
    // Tính danh sách hiển thị: nếu chọn con -> show anh em; nếu chọn cha -> show các con; chưa chọn -> show top-level
    const options = useMemo(() => {
        const selected = categoriesArray.find((c) => c.slug === slug);
        if (!selected) return categoriesArray.filter((c) => !c.parentId);
        if (selected.parentId) return categoriesArray.filter((c) => c.parentId === selected.parentId);
        return categoriesArray.filter((c) => c.parentId === selected.id);
    }, [categoriesArray, slug]);

    return (
        <div className="space-y-2">
            <Carousel
                opts={{
                    align: "start",
                    dragFree: true,
                    containScroll: "trimSnaps",
                }}
              className="w-full"
            >
                <CarouselContent className="-ml-2">
                    {/* (tuỳ) thêm "Tất cả" ở đầu */}
                    {/* <CarouselItem className="basis-auto pl-2">
            <Chip label="Tất cả" selected={!value} onClick={() => onChange("")} />
          </CarouselItem> */}

                    {options.map((cat) => (
                        <CarouselItem key={cat.id} className="basis-auto pl-2">
                            <Chip
                                label={cat.name}
                                selected={value === cat.slug}
                                onClick={() => onChange(cat.slug)}
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {/* Ẩn nút trên mobile, hiện trên ≥sm */}
                {/* <CarouselPrevious className="md:hidden " />
                <CarouselNext className="md:hidden " /> */}
            </Carousel>
        </div>
    );
}

function Chip({
    label,
    selected,
    onClick,
}: {
    label: string;
    selected?: boolean;
    onClick?: () => void;
}) {
    return (
        <Button
            type="button"
            onClick={onClick}
            variant={selected ? "default" : "outline"}
            aria-pressed={selected}
            className={cn(
                "rounded-full font-normal h-9 px-4 whitespace-nowrap",
                "active:scale-[0.98] transition",
                !selected && "bg-white"
            )}
        >
            {label}
        </Button>
    );
}