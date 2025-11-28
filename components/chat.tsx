"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { X, MessageCircle, Send, Bot, User, Loader2 } from "lucide-react";

// Import Shadcn UI components (điều chỉnh đường dẫn import theo dự án của bạn)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils"; // Hàm classNames của shadcn

type Message = {
    role: "user" | "bot";
    content: string;
};

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Tạo message rỗng để stream
        setMessages((prev) => [...prev, { role: "bot", content: "" }]);

        try {
            const response = await fetch("http://localhost:3000/chat/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: userMessage.content }),
            });

            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let done = false;

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;

                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    setMessages((prev) => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        lastMessage.content += chunk;
                        return newMessages;
                    });
                }
            }
        } catch (error) {
            console.error("Lỗi:", error);
            setMessages((prev) => {
                const newMessages = [...prev];
                // Nếu tin nhắn cuối đang rỗng (lỗi ngay lập tức) hoặc đang stream dở thì báo lỗi
                if (newMessages[newMessages.length - 1].role === 'bot') {
                    newMessages[newMessages.length - 1].content += "\n\n*[Hệ thống]: Đã có lỗi xảy ra, vui lòng thử lại.*";
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end sm:bottom-10 sm:right-10">

            {/* --- CHAT BOX --- */}
            <div
                className={cn(
                    "transition-all duration-300 ease-in-out transform origin-bottom-right mb-4",
                    isOpen
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 translate-y-10 pointer-events-none"
                )}
            >
                <Card className="w-[350px] sm:w-[400px] h-[500px] flex flex-col shadow-2xl border-slate-200">

                    {/* Header */}
                    <CardHeader className="bg-primary text-primary-foreground p-4 rounded-t-xl flex flex-row justify-between items-center space-y-0">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className="h-9 w-9 border-2 border-white/20">
                                    <AvatarImage src="/bot-avatar.png" alt="AI" />
                                    <AvatarFallback className="bg-white text-primary font-bold">AI</AvatarFallback>
                                </Avatar>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-primary rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Chatbot RAG hỏi đáp về sản phẩm,chính sách</h3>
                                <p className="text-[10px] opacity-90">Sẵn sàng hỗ trợ 24/7</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary-foreground hover:bg-white/20 rounded-full"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </CardHeader>

                    {/* Messages Area */}
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-50 space-y-2">
                                <Bot className="w-12 h-12 text-slate-300" />
                                <p className="text-sm text-slate-500">Hãy hỏi tôi bất cứ điều gì về sản phẩm hoặc thắc mắc của bạn về chúng tôi...</p>
                            </div>
                        )}

                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex w-full",
                                    msg.role === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                <div className={cn(
                                    "flex max-w-[85%] gap-2",
                                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                )}>
                                    {/* Avatar nhỏ bên cạnh tin nhắn */}
                                    <Avatar className="h-6 w-6 mt-1">
                                        <AvatarFallback className={msg.role === "user" ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"}>
                                            {msg.role === "user" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Bong bóng chat */}
                                    <div
                                        className={cn(
                                            "p-3 rounded-2xl text-sm shadow-sm",
                                            msg.role === "user"
                                                ? "bg-blue-600 text-white rounded-tr-none"
                                                : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                                        )}
                                    >
                                        {/* RENDER MARKDOWN TẠI ĐÂY */}
                                        <div className="prose prose-sm max-w-none dark:prose-invert break-words">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    // Tùy chỉnh hiển thị các thẻ HTML
                                                    p: ({ children }) => <p className="mb-1 last:mb-0 leading-relaxed">{children}</p>,
                                                    ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                                                    ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                                                    li: ({ children }) => <li className="mb-0.5">{children}</li>,
                                                    a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">{children}</a>,
                                                    code: ({ inline, className, children, ...props }: any) => {
                                                        return !inline ? (
                                                            <div className="bg-slate-800 text-slate-100 p-2 rounded-md my-2 overflow-x-auto text-xs font-mono">
                                                                {children}
                                                            </div>
                                                        ) : (
                                                            <code className="bg-black/10 px-1 py-0.5 rounded text-xs font-mono font-bold" {...props}>
                                                                {children}
                                                            </code>
                                                        )
                                                    }
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Loading & Typing Indicator */}
                        {isLoading && messages[messages.length - 1]?.content === "" && (
                            <div className="flex justify-start w-full">
                                <div className="flex gap-2 max-w-[85%]">
                                    <Avatar className="h-6 w-6 mt-1">
                                        <AvatarFallback className="bg-emerald-600 text-white"><Bot className="w-3 h-3" /></AvatarFallback>
                                    </Avatar>
                                    <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                                        <div className="flex space-x-1">
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </CardContent>

                    {/* Input Footer */}
                    <CardFooter className="p-3 bg-white border-t border-slate-100">
                        <div className="flex w-full items-center space-x-2">
                            <Input
                                placeholder="Nhập tin nhắn..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                className="flex-1 rounded-full bg-slate-50 border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
                                disabled={isLoading}
                            />
                            <Button
                                size="icon"
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className={cn(
                                    "rounded-full h-10 w-10 transition-all",
                                    input.trim() ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-300"
                                )}
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* --- TOGGLE BUTTON --- */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="icon"
                className={cn(
                    "h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50",
                    isOpen ? "bg-red-500 hover:bg-red-600 rotate-90" : "bg-blue-600 hover:bg-blue-700"
                )}
            >
                {isOpen ? (
                    <X className="w-8 h-8" />
                ) : (
                    <MessageCircle className="w-8 h-8" />
                )}
            </Button>
        </div>
    );
}