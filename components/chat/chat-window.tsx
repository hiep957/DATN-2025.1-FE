"use client";
import { useState, useEffect, useRef } from "react";
import { Send, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ChatMessage } from "./chat-message";
import { Message } from "./type";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { BASE_URL } from "@/lib/axios";

// Giả sử bạn lấy userId từ Zustand store
// import { useUserStore } from "@/store/user-store"; 

interface ChatWindowProps {
  onClose: () => void;
  userId: number; // Prop nhận vào ID user
}

export default function ChatWindow({ onClose, userId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore();
  // 1. Load History khi component mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.post(`/chat/history`);
        console.log("History response:", res);
        if (res.data.statusCode === 201) {
          setMessages(Object.values(res.data.data) || []);
        }
      } catch (error) {
        console.error("Failed to load history", error);
      }
    };

    if (userId) fetchHistory();
  }, [userId]);
  console.log("Chat history:", messages);

  // 2. Auto scroll xuống cuối
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Xử lý gửi tin nhắn
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Tạo message rỗng cho Bot để stream vào
    const botMsgIndex = messages.length + 1; // Index dự kiến
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await fetch(`${BASE_URL}/chat/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user?.accessToken}` },
        body: JSON.stringify({ userId, question: userMsg.content }), // Gửi kèm userId
        credentials: "include", // Gửi kèm cookie nếu có

      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let bufferText = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          bufferText += chunk;
          setMessages((prev) => {
            const newMsgs = [...prev];
            const lastMsg = newMsgs[newMsgs.length - 1];
            // Lưu ý: Logic này đang simplfy, đúng ra phải append vào lastMsg.content
            // Nhưng vì bufferText tích lũy toàn bộ nên gán = bufferText là dc.
            // Tuy nhiên để tối ưu stream:
            lastMsg.content = bufferText;
            return newMsgs;
          });
        }
      }

    } catch (error) {
      console.error("Lỗi:", error);
      setMessages((prev) => {
        const newMsgs = [...prev];
        const lastMsg = newMsgs[newMsgs.length - 1];
        lastMsg.content += "\n\n*[Lỗi kết nối]*";
        return newMsgs;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[350px] sm:w-[500px] h-[550px] flex flex-col shadow-2xl border-slate-200">
      {/* Header */}
      <CardHeader className="bg-primary text-primary-foreground p-4 rounded-t-xl flex flex-row justify-between items-center space-y-0">
        <div className="flex items-center gap-3">
          {/* ... Avatar Bot ... (giữ nguyên code cũ của bạn) */}
          <div className="font-bold">Chatbot Tư vấn</div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>

      {/* Messages List */}
      <CardContent className="flex-1 overflow-y-auto p-4 bg-slate-50">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-slate-400 mt-20 text-sm">
            Xin chào, tôi có thể giúp gì cho bạn?
          </div>
        )}

        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex items-center gap-2 text-slate-400 text-xs ml-2">
            <Loader2 className="w-3 h-3 animate-spin" /> Đang suy nghĩ...
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      <CardFooter className="p-3 bg-white border-t">
        <div className="flex w-full items-center gap-2">
          <Input
            placeholder="Nhập câu hỏi..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
            className="rounded-full bg-slate-100 border-0 focus-visible:ring-1"
          />
          <Button size="icon" onClick={handleSend} disabled={isLoading || !input} className="rounded-full w-10 h-10 shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}