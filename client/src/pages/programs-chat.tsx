import { useState, useEffect, useRef } from "react";
import ChatBubble from "@/components/ChatBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Send, Mic, Building2, Sparkles, Info } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/useLanguage";
import { useAuthStore } from "@/lib/auth";
import type { AgentSession, AgentMessage } from "@shared/schema";

export default function ProgramsChat() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { language: globalLanguage } = useLanguage();
  const [chatLanguage, setChatLanguage] = useState<"en" | "ur" | "ru">("en");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create or restore agent session on mount
  useEffect(() => {
    if (sessionId || !user) return;
    
    const initSession = async () => {
      try {
        // Create new session with chat language
        const newSessionResponse = await apiRequest("POST", "/api/agent/sessions", {
          userId: user.id,
          agent: "eligibility",
          language: chatLanguage
        });
        const newSession: AgentSession = await newSessionResponse.json();
        setSessionId(newSession.id);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to start chat session. Please try again.",
          variant: "destructive"
        });
      }
    };
    initSession();
  }, [sessionId, toast, chatLanguage, user]);

  // Fetch conversation history
  const { data: messages = [], isLoading } = useQuery<AgentMessage[]>({
    queryKey: ["/api/agent/messages", sessionId],
    enabled: !!sessionId
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest("POST", "/api/agent/chat", {
        sessionId,
        agentName: "eligibility",
        message: userMessage,
        language: chatLanguage
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent/messages", sessionId] });
      scrollToBottom();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || !sessionId) return;
    
    sendMessageMutation.mutate(message);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      {/* Header with gradient */}
      <header className="border-b bg-gradient-to-r from-primary to-secondary shadow-lg sticky top-0 z-10 backdrop-blur-sm">
        <div className="p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
            data-testid="button-back"
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shadow-md backdrop-blur-sm">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg">
                {chatLanguage === "en" ? "Health Programs" : chatLanguage === "ur" ? "صحت کے پروگرام" : "Sehat Ke Program"}
              </h1>
              <p className="text-xs text-white/80 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {chatLanguage === "en" ? "Pakistan government programs" : chatLanguage === "ur" ? "پاکستان کے سرکاری پروگرام" : "Pakistan sarkaari programs"}
              </p>
            </div>
          </div>
          <Select value={chatLanguage} onValueChange={(value) => {
            setChatLanguage(value as "en" | "ur" | "ru");
            setSessionId(null);
            toast({
              title: "Language Changed",
              description: value === "en" ? "English" : value === "ur" ? "اردو (Urdu)" : "رومن اردو (Roman Urdu)",
            });
          }}>
            <SelectTrigger className="w-[200px] bg-white/20 border-white/30 text-white hover:bg-white/30 rounded-xl" data-testid="select-chat-language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ur">اردو (Urdu)</SelectItem>
              <SelectItem value="ru">رومن اردو (Roman Urdu)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Welcome message */}
        {(!messages || messages.length === 0) && (
          <Card className="p-6 mb-6 border-none shadow-xl bg-gradient-to-br from-white to-accent/30 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-md">
                <Info className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1" dir={chatLanguage === "ur" ? "rtl" : "ltr"}>
                <h3 className="font-bold text-lg mb-2">
                  {chatLanguage === "en" 
                    ? "Welcome!" 
                    : chatLanguage === "ur"
                    ? "خوش آمدید!"
                    : "Khush aamdeed!"}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {chatLanguage === "en"
                    ? "I can help you find information about all Pakistan government health programs."
                    : chatLanguage === "ur"
                    ? "میں آپ کو پاکستان کے تمام سرکاری صحت کے پروگراموں کی معلومات تلاش کرنے میں مدد کر سکتا ہوں۔"
                    : "Main aapko Pakistan ke tamam sarkaari sehat ke programon ki maloomaat talash karnay mein madad kar sakta hoon."}
                </p>
                <p className="text-xs text-muted-foreground">
                  {chatLanguage === "en"
                    ? "You can ask:\n• 'List all programs' to see available programs\n• About specific programs\n• To check your eligibility"
                    : chatLanguage === "ur"
                    ? "آپ پوچھ سکتے ہیں:\n• 'تمام پروگرام' دیکھنے کے لیے\n• کسی خاص پروگرام کے بارے میں\n• اپنی اہلیت چیک کرنے کے لیے"
                    : "Aap poochen sakte hain:\n• 'Tamam program' dekhne ke liye\n• Kisi khas program ke barey mein\n• Apni ahliyat check karne ke liye"}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Messages */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Loading conversation...</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg.content}
              isUser={msg.senderType === "user"}
              timestamp={msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) : undefined}
            />
          ))
        )}
        
        {/* Typing indicator */}
        {sendMessageMutation.isPending && (
          <div className="flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-10 h-10" />
            <div className="flex gap-1.5 bg-white border border-border px-5 py-4 rounded-2xl shadow-md">
              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white/80 backdrop-blur-sm p-4 shadow-lg">
        <div className="flex gap-2 mb-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !sendMessageMutation.isPending && handleSend()}
            placeholder={
              chatLanguage === "en"
                ? "Ask about health programs..."
                : chatLanguage === "ur"
                ? "صحت کے پروگرام کے بارے میں پوچھیں..."
                : "Sehat ke program ke barey mein pochain..."
            }
            className="flex-1 h-12 rounded-xl border-2 text-base shadow-md"
            data-testid="input-message"
            disabled={!sessionId || sendMessageMutation.isPending}
            dir={chatLanguage === "ur" ? "rtl" : "ltr"}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            data-testid="button-voice"
            className="w-12 h-12 rounded-xl"
            disabled
          >
            <Mic className="w-5 h-5" />
          </Button>
          <Button 
            onClick={handleSend} 
            size="icon" 
            data-testid="button-send"
            disabled={!sessionId || sendMessageMutation.isPending || !message.trim()}
            className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all duration-300"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          {chatLanguage === "en"
            ? "Powered by Gemini • 20+ Pakistan health programs"
            : chatLanguage === "ur"
            ? "Gemini سے چلتا ہے • 20+ پاکستان صحت کے پروگرام"
            : "Gemini se chalta hai • 20+ Pakistan sehat ke program"}
        </p>
      </div>
    </div>
  );
}
