import { Store } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet"
import { Category } from "@/app/admin/product/type";
// Thêm import cho Accordion
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion" // Đảm bảo đường dẫn này đúng với cấu trúc dự án của bạn
import { useEffect, useState } from "react";
import api from "@/lib/axios";

interface SheetCategoryProps {
    openSheetCategory: boolean;
    setOpenSheetCategory?: (open: boolean) => void;
}



export const SheetCategory = ({ openSheetCategory, setOpenSheetCategory }: SheetCategoryProps) => {

    const [categories, setCategories] = useState<Category[]>([]);
        const [loading, setLoading] = useState<boolean>(false);
        useEffect((() => {
            async function fetchCategories() {
                try {
                    setLoading(true);
                    const response = await api.get('/category');
                    console.log("Fetched categories:", response.data);
                    // Xử lý dữ liệu nếu cần
                    setCategories(response.data.data.data);
                } catch (error) {
                    console.error("Error fetching categories:", error);
                } finally {
                    setLoading(false);
                }
    
            }
            fetchCategories();
        }), [])
    

    // Lọc ra các danh mục cha (không có parentId)
    const parentCategories = categories.filter(category => !category.parentId);

    return (
        <Sheet open={openSheetCategory} onOpenChange={setOpenSheetCategory}>
            <SheetTrigger asChild>
                <button
                    className="inline-flex flex-col items-center justify-center px-5 hover:bg-muted"
                    aria-label="Menu"
                >
                    <Store className="h-6 w-6 mb-1 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Danh mục</span>
                </button>
            </SheetTrigger>

            <SheetContent side="left" className="overflow-y-auto w-[320px] sm:w-[360px] bg-background/95 backdrop-blur-m"> {/* Thêm cuộn nếu danh mục quá dài */}
                <SheetHeader className="mb-2">
                    {/* 2. Đổi <h2> thành <SheetTitle> */}
                    <SheetTitle>Danh mục sản phẩm</SheetTitle>
                </SheetHeader>

                {/* --- NỘI DUNG DANH MỤC SẢN PHẨM --- */}
                <Accordion type="multiple" className="w-full ">
                    {parentCategories.map(parent => {
                        // Tìm các danh mục con của danh mục cha này
                        const childCategories = categories.filter(
                            child => child.parentId === parent.id
                        );

                        // TRƯỜNG HỢP 1: Danh mục cha CÓ con
                        if (childCategories.length > 0) {
                            return (
                                <AccordionItem value={`category-${parent.id}`} key={parent.id} >
                                    <AccordionTrigger className="hover:no-underline flex items-center p-2">
                                        {/* Hiển thị ảnh và tên của CHA */}
                                        <div className="flex items-center gap-4 p-2">
                                            <img
                                                src={parent.thumbnail}
                                                alt={parent.name}
                                                className="w-10 h-10 rounded-md object-cover"
                                            />
                                            <span className="font-medium">{parent.name}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        {/* Hiển thị danh sách CON */}
                                        <div className="flex flex-col gap-2 pl-4">
                                            {childCategories.map(child => (
                                                <a
                                                    href={`products?category=${child.slug}`} // Giả sử bạn muốn link đến trang danh mục con
                                                    key={child.id}
                                                    className="flex items-center gap-4 p-2 rounded-md hover:bg-muted"
                                                >
                                                    <img
                                                        src={child.thumbnail}
                                                        alt={child.name}
                                                        className="w-8 h-8 rounded-md object-cover"
                                                    />
                                                    <span className="text-sm">{child.name}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        }

                        // TRƯỜNG HỢP 2: Danh mục cha KHÔNG có con (như "Nữ")
                        return (
                            <a
                                key={parent.id}
                                href={`/category/${parent.slug}`}
                                className="flex items-center gap-4 p-4 border-b hover:bg-muted" // Dùng p-4 và border-b để giống với AccordionTrigger
                            >
                                <img
                                    src={parent.thumbnail}
                                    alt={parent.name}
                                    className="w-10 h-10 rounded-md object-cover"
                                />
                                <span className="font-medium">{parent.name}</span>
                            </a>
                        )
                    })}
                </Accordion>
                {/* --- KẾT THÚC NỘI DUNG --- */}

            </SheetContent>
        </Sheet>
    )
}