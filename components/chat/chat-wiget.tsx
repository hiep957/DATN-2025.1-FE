"use client";
import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ChatWindow from "./chat-window";
import { useAuthStore } from "@/store/useAuthStore";

// Giả sử lấy userId từ store
// import { useUserStore } from "@/store/user-store"; 

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);

    // MOCK userId (Bạn thay thế bằng store thật của bạn)
    const { user } = useAuthStore();
    if (!user) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end sm:bottom-10 sm:right-10 font-sans">

            {/* Cửa sổ chat với hiệu ứng xuất hiện */}
            <div
                className={cn(
                    "transition-all duration-300 ease-in-out transform origin-bottom-right mb-4",
                    isOpen
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 translate-y-10 pointer-events-none"
                )}
            >
                {/* Chỉ render nội dung bên trong khi user đã mở để tiết kiệm tài nguyên ban đầu 
             HOẶC render luôn nhưng ẩn đi nếu muốn giữ state */}
                {isOpen && <ChatWindow onClose={() => setIsOpen(false)} userId={user?.id} />}
            </div>

            {/* Nút Toggle Tròn */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="icon"
                className={cn(
                    "h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300",
                    isOpen ? "bg-red-500 hover:bg-red-600 rotate-90" : "bg-blue-600 hover:bg-blue-700"
                )}
            >
                {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
            </Button>
        </div>
    );
}