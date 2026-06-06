import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, ShieldAlert, Sparkles, MessageCircleCode, CheckSquare } from "lucide-react";
import { ChatMessage } from "../types";

interface OusEmadChatProps {
  carModel: string;
  prefilledPrompt: string;
  onClearPrefilled: () => void;
}

const PRESET_QUESTIONS = [
  "چطور بفهمم قطعه اصلیه یا تقلبی؟",
  "اجرت حدودی تعویض روغن و فیلترها چقدره؟",
  "اگر تسمه تایم پاره بشه چه بلایی سر موتور میاد؟",
  "علت زوزه کشیدن چرخ جلو هنگام حرکت چیه؟",
];

export const OusEmadChat: React.FC<OusEmadChatProps> = ({
  carModel,
  prefilledPrompt,
  onClearPrefilled,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with a welcome message from Ous Emad specifying the selected car
  useEffect(() => {
    setMessages([
      {
        sender: "mechanic",
        text: `کاربر گرامی و همراه عزیز، سلام! بنده «اوس عماد» هستم، در خدمت شما برای مشاوره فنی و تخصصی درباره خودروی ${carModel}. هر سوالی درباره کیفیت لوازم یدکی، استعلام قیمت قطعات در بازار لوازم یدکی و قطعات تهران، بررسی دستمزد مکانیک یا عیب‌یابی و بررسی علائم نقض فنی دارید بفرمایید تا شما را راهنمایی کنم!`,
        timestamp: new Date().toLocaleTimeString("fa-IR"),
      },
    ]);
  }, [carModel]);

  // Handle auto-posting of prefilled question prompts requested by clicking a part tip
  useEffect(() => {
    if (prefilledPrompt) {
      handleSendMessage(prefilledPrompt);
      onClearPrefilled();
    }
  }, [prefilledPrompt]);

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("fa-IR"),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/car-parts/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carModel,
          userMessage: textToSend,
        }),
      });

      if (!response.ok) {
        throw new Error("خطا در پاسخ سرور اوس عماد");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "mechanic",
          text: data.reply || "کاربر گرامی و دوست عزیز! خودرو یا قطعات مورد نظر شما را بررسی کردم؛ لطفاً سوال خود را کمی واضح‌تر مطرح بفرمایید تا به درستی شما را راهنمایی کنم.",
          timestamp: new Date().toLocaleTimeString("fa-IR"),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "system",
          text: "یا علی! مشکلی در اتصال به کارگاه اوس عماد پیش آمده. لطفاً مجدداً امتحان کنید.",
          timestamp: new Date().toLocaleTimeString("fa-IR"),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ous-emad-interactive-chat" className="bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col h-[520px] overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg text-white border-2 border-white shadow-xs">
              🛠️
            </div>
            <span className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white"></span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>مشاوره فنی با اوس عماد</span>
              <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded font-bold">
                مکانیک کارکشته‌
              </span>
            </h3>
            <span className="text-[10px] text-slate-450 block">سرویس آنلاین عیب‌یابی و ترفندهای خرید قطعه</span>
          </div>
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
        {messages.map((msg, i) => {
          const isUser = msg.sender === "user";
          const isSystem = msg.sender === "system";

          if (isSystem) {
            return (
              <div key={i} className="text-center p-2 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-lg">
                {msg.text}
              </div>
            );
          }

          return (
            <div
              key={i}
              className={`flex flex-col max-w-[85%] ${isUser ? "mr-auto text-left" : "ml-auto text-right"}`}
            >
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  isUser
                    ? "bg-blue-600 text-white rounded-tl-none self-end"
                    : "bg-white text-slate-800 border border-slate-200/80 rounded-tr-none self-start shadow-xs"
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-slate-450 mt-1 px-1">{msg.timestamp}</span>
            </div>
          );
        })}

        {isLoading && (
          <div id="chat-loading-animation" className="flex items-center gap-1.5 text-xs text-blue-600 p-2.5 bg-blue-50/50 rounded-lg self-start max-w-[60%] border border-blue-100/50">
            <span className="animate-bounce">●</span>
            <span className="animate-bounce [animation-delay:0.2s]">●</span>
            <span className="animate-bounce [animation-delay:0.4s]">●</span>
            <span className="text-[10px] text-slate-500 mr-2">اوس عماد در حال نوشتن پاسخ...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preset Fast Queries */}
      <div className="px-4 py-2.5 bg-slate-50/50 border-t border-slate-100 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        {PRESET_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="text-[11px] px-3.5 py-1.5 bg-white border border-slate-200 hover:border-blue-600 text-slate-600 hover:text-blue-600 rounded-full cursor-pointer transition-colors duration-200 flex-shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Form Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputMessage);
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`درباره قطعات یا عیب‌یابی ${carModel} از اوس عماد بپرسید...`}
          disabled={isLoading}
          className="flex-1 text-xs px-4 py-3 bg-slate-50 border border-slate-200 hover:border-blue-500 focus:border-blue-500 focus:outline-none text-slate-800 placeholder-slate-400 rounded-xl"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-xl transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
