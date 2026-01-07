"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, Bot, Loader2, Image as ImageIcon } from "lucide-react"; // Import thêm icon
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button"; // Dùng Button cho đẹp
import { cn } from "@/lib/utils";

import { ProductCarousel } from "./product-carousel"; // Giả sử component này nhận prop products là mảng
import { Message } from "./type";
import { useMemo, useState } from "react";

// Định nghĩa lại kiểu dữ liệu mà Carousel cần (dựa trên comment của bạn)
interface CarouselProduct {
  id: number;
  name: string;
  min_price: number;
  max_price: number;
  img_url: string;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [products, setProducts] = useState<CarouselProduct[]>([]);

  // 1. Dùng useMemo để lấy mảng các ID (Array<string>)
  const productIds = useMemo(() => {
    if (isUser || !message.content) return [];
    
    // Regex với flag 'g' (global) để tìm tất cả các match
    const regex = /http:\/\/localhost:8000\/(\d+)/g;
    
    // matchAll trả về iterator, convert sang array
    const matches = [...message.content.matchAll(regex)];
    
    // Lấy group 1 (là các con số ID) và loại bỏ trùng lặp (Set)
    const ids = matches.map(m => m[1]);
    return Array.from(new Set(ids)); 
  }, [message.content, isUser]);

  const handleViewImages = async () => {
    if (productIds.length === 0) return;

    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    if (products.length > 0) {
      setIsExpanded(true);
      return;
    }

    try {
      setIsLoading(true);

      // 2. Dùng Promise.all để fetch tất cả các sản phẩm cùng lúc
      const fetchPromises = productIds.map(id => 
        fetch(`http://localhost:3000/products/${id}`).then(res => res.json())
      );

      const responses = await Promise.all(fetchPromises);

      // 3. Xử lý dữ liệu trả về từ Backend để khớp với Frontend
      const mappedProducts: CarouselProduct[] = responses.map((res: any) => {
        const item = res.data; // Dựa vào mẫu JSON bạn đưa: { data: { ... } }

        // Tính giá min/max từ variants
        const prices = item.variants?.map((v: any) => parseFloat(v.price)) || [0];
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

        // Lấy ảnh đầu tiên trong mảng images
        const firstImage = item.images && item.images.length > 0 ? item.images[0].url : "";

        return {
          id: item.id,
          name: item.name,
          min_price: minPrice,
          max_price: maxPrice,
          img_url: firstImage,
        };
      });

      setProducts(mappedProducts);
      setIsExpanded(true);
    } catch (error) {
      console.error("Lỗi fetch sản phẩm:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex w-full mb-4", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex max-w-[90%] gap-2", isUser ? "flex-row-reverse" : "flex-row")}>
        {/* Avatar */}
        <Avatar className="h-8 w-8 mt-1 shrink-0">
          <AvatarFallback className={isUser ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"}>
            {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col overflow-hidden w-full">
          {/* Bong bóng chat */}
          <div
            className={cn(
              "p-3 rounded-2xl text-sm shadow-sm break-words",
              isUser
                ? "bg-blue-600 text-white rounded-tr-none"
                : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
            )}
          >
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* NÚT XEM ẢNH & CAROUSEL */}
          {!isUser && productIds.length > 0 && (
            <div className="mt-2 ml-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewImages}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 h-8 text-xs font-medium flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <ImageIcon className="w-3 h-3" />
                )}
                {isExpanded ? "Ẩn hình minh họa" : `Xem hình ${productIds.length} sản phẩm`}
              </Button>

              {isExpanded && products.length > 0 && (
                <div className="mt-2 w-full max-w-[400px] border rounded-lg p-2 bg-white shadow-sm animate-in fade-in slide-in-from-top-2">
                  <ProductCarousel products={products} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}