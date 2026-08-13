import { useState, useRef, useEffect } from "react";
import api from "../configs/api";
import { Bot, X, Send, Trash2, Minimize2, Maximize2, MessageSquare, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "bot", 
      text: "👋 Hi! I'm your AI assistant powered by Gemini. How can I help you create amazing thumbnails today?",
      timestamp: new Date()
    },
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, isMinimized]);

  useEffect(() => {
    if (!open && messages.length > 1) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "bot") {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [messages, open]);

  useEffect(() => {
    if (open) {
      setUnreadCount(0);
    }
  }, [open]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMessage, timestamp: new Date() },
    ]);

    setLoading(true);

    try {
      const { data } = await api.post("/api/chat", { message: userMessage });

      setMessages((prev) => [
        ...prev,
        { 
          role: "bot", 
          text: data.reply || "I apologize, but I couldn't generate a response. Please try again.",
          timestamp: new Date()
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { 
          role: "bot", 
          text: "⚠️ Unable to connect to the server. Please try again later.",
          timestamp: new Date()
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      { 
        role: "bot", 
        text: "👋 Hi! I'm your AI assistant powered by Gemini. How can I help you create amazing thumbnails today?",
        timestamp: new Date()
      },
    ]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      <style>{`
        .chat-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .chat-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        @keyframes typing {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Floating Action Button */}
      <div
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-pink-600 shadow-[0_0_20px_rgba(219,39,119,0.4)] hover:scale-105 transition-all duration-300"
      >
        <MessageSquare className="text-white w-6 h-6" />
        {!open && unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg border border-neutral-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </div>

      {/* Chat Window */}
      {open && (
        <div 
          className={\`fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl bg-neutral-900/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-300 \${
            isMinimized ? 'h-[60px]' : 'h-[500px]'
          }\`}
        >
          {/* Header */}
          <div className="flex justify-between items-center bg-white/5 border-b border-white/10 px-4 py-3 h-[60px]">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-500/20 text-pink-500">
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-sm text-white tracking-wide">Gemini Assistant</span>
                <span className="text-[10px] text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Online
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); clearChat(); }}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setOpen(false); }}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="flex flex-col h-[calc(100%-60px)]">
              {/* Messages Area */}
              <div 
                className="flex-1 overflow-y-auto p-4 space-y-4 chat-scrollbar overscroll-contain"
                data-lenis-prevent="true"
                onWheel={(e) => e.stopPropagation()}
              >
                {messages.map((msg, i) => (
                  <div key={i} className={\`flex \${msg.role === "user" ? "justify-end" : "justify-start"}\`}>
                    <div className={\`flex flex-col max-w-[85%] \${msg.role === "user" ? "items-end" : "items-start"}\`}>
                      <div
                        className={\`rounded-2xl px-4 py-2.5 text-sm \${
                          msg.role === "user"
                            ? "bg-pink-600 text-white rounded-br-sm shadow-md shadow-pink-900/20"
                            : "bg-white/10 text-gray-100 rounded-bl-sm border border-white/5"
                        }\`}
                      >
                        <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                      </div>
                      <div className="text-[10px] mt-1 text-gray-500 px-1">
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <div className="h-1.5 w-1.5 bg-gray-400 rounded-full" style={{ animation: 'typing 1.4s infinite', animationDelay: '0s' }}></div>
                        <div className="h-1.5 w-1.5 bg-gray-400 rounded-full" style={{ animation: 'typing 1.4s infinite', animationDelay: '0.2s' }}></div>
                        <div className="h-1.5 w-1.5 bg-gray-400 rounded-full" style={{ animation: 'typing 1.4s infinite', animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              {messages.length === 1 && (
                <div 
                  className="flex gap-2 px-4 pb-3 overflow-x-auto chat-scrollbar overscroll-contain"
                  data-lenis-prevent="true"
                  onWheel={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setInput("How to write a good prompt?")}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 rounded-full transition-colors border border-white/10 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-pink-400" />
                    Good prompts?
                  </button>
                  <button
                    onClick={() => setInput("What aspect ratio should I use?")}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 rounded-full transition-colors border border-white/10"
                  >
                    Aspect ratios?
                  </button>
                  <button
                    onClick={() => setInput("Suggest a style for gaming")}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 rounded-full transition-colors border border-white/10"
                  >
                    Gaming style?
                  </button>
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 border-t border-white/10 bg-black/20">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full pr-2 focus-within:ring-1 focus-within:ring-pink-500/50 focus-within:border-pink-500/50 transition-all">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Ask Gemini..."
                    disabled={loading}
                    className="flex-1 bg-transparent border-none px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none disabled:opacity-50"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="p-1.5 rounded-full bg-pink-600 text-white disabled:opacity-50 disabled:bg-gray-600 hover:bg-pink-500 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}