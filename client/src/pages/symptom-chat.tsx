import { useState, useEffect, useRef } from "react";
import ChatBubble from "@/components/ChatBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, Mic, Stethoscope, Globe, AlertTriangle, Info, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AgentSession, AgentMessage } from "@shared/schema";
import { useLanguage } from "@/lib/useLanguage";

export default function SymptomChat() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { language: globalLanguage } = useLanguage();
  
  // Map global language to chat language (en/ur/ru -> english/urdu)
  const getChatLanguage = (): "english" | "urdu" => {
    return globalLanguage === 'en' ? 'english' : 'urdu';
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create agent session on mount (only once)
  useEffect(() => {
    if (sessionId) return;
    
    const initSession = async () => {
      try {
        const response = await apiRequest("POST", "/api/agent/sessions", {
          userId: "demo-user",
          agent: "triage",
          language: getChatLanguage()
        });
        const session: AgentSession = await response.json();
        setSessionId(session.id);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to start chat session. Please try again.",
          variant: "destructive"
        });
      }
    };
    initSession();
  }, [sessionId, toast, globalLanguage]);

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
        agentName: "triage",
        message: userMessage,
        language: getChatLanguage()
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

  const handleLanguageToggle = () => {
    toast({
      title: globalLanguage === "en" ? "لغت تبدیل کی" : "Language Changed",
      description: globalLanguage === "en" ? "اردو میں منتقل کیا گیا" : "Switched to English"
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency": return "destructive";
      case "bhu-visit": return "default";
      case "self-care": return "secondary";
      default: return "outline";
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    if (language === "urdu") {
      switch (urgency) {
        case "emergency": return "Emergency";
        case "bhu-visit": return "Doctor se milen";
        case "self-care": return "Ghar par ilaj";
        default: return urgency;
      }
    }
    switch (urgency) {
      case "emergency": return "Emergency";
      case "bhu-visit": return "Visit Doctor";
      case "self-care": return "Self-Care";
      default: return urgency;
    }
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
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg">
                {getChatLanguage() === "urdu" ? "Alamaat ka jaiza" : "Symptom Triage"}
              </h1>
              <p className="text-xs text-white/80 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {getChatLanguage() === "urdu" ? "AI se taaqatwar sehat ka jaiza" : "AI-powered health assessment"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLanguageToggle}
            data-testid="button-language-toggle"
            className="text-white hover:bg-white/20 rounded-xl"
          >
            <Globe className="w-5 h-5" />
          </Button>
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
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">
                  {getChatLanguage() === "urdu" 
                    ? "Khush aamdeed!" 
                    : "Welcome!"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {getChatLanguage() === "urdu"
                    ? "Main aapka AI triage assistant hoon. Main aapki alamaat ko samjhne aur munasib nigah dasht ki rahnumayee mein madad kar sakta hoon."
                    : "I'm your AI Triage Assistant powered by Gemini. I can help you understand your symptoms and guide you to appropriate care."}
                </p>
                <div className="p-4 bg-destructive/10 rounded-xl border-2 border-destructive/20">
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-destructive mb-1">
                        {getChatLanguage() === "urdu" ? "Ahem Note" : "Important Note"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getChatLanguage() === "urdu"
                          ? "Main doctor nahin hoon. Ye tibbi masla nahin hai — behad karam sahi takhnis ke liye doctor se rujoo karen."
                          : "I am NOT a doctor. This is not medical advice — please consult a doctor for proper diagnosis."}
                      </p>
                    </div>
                  </div>
                </div>
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
          messages.map((msg, index) => {
            const metadata = msg.metadata as any;
            const reasoning = msg.reasoningTrace as any;
            const urgency = metadata?.urgency;
            const confidence = reasoning?.confidence;

            return (
              <div key={msg.id} className="mb-4">
                <ChatBubble
                  message={msg.content}
                  isUser={msg.senderType === "user"}
                  timestamp={msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) : undefined}
                />
                
                {/* Show metadata for agent responses */}
                {msg.senderType === "agent" && (urgency || confidence !== undefined) && (
                  <div className="ml-14 mt-2 flex flex-wrap gap-2">
                    {urgency && (
                      <Badge 
                        variant={getUrgencyColor(urgency)} 
                        data-testid={`badge-urgency-${urgency}`}
                        className="shadow-sm px-3 py-1"
                      >
                        {getUrgencyLabel(urgency)}
                      </Badge>
                    )}
                    {confidence !== undefined && (
                      <Badge 
                        variant="outline" 
                        data-testid="badge-confidence"
                        className="shadow-sm px-3 py-1"
                      >
                        {getChatLanguage() === "urdu" ? "Aitemaad" : "Confidence"}: {Math.round(confidence * 100)}%
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            );
          })
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
            placeholder={getChatLanguage() === "urdu" ? "Apni alamaat bayan karen..." : "Describe your symptoms..."}
            className="flex-1 h-12 rounded-xl border-2 text-base shadow-md"
            disabled={!sessionId || sendMessageMutation.isPending}
            data-testid="input-message"
            dir={getChatLanguage() === "urdu" ? "rtl" : "ltr"}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            data-testid="button-voice"
            disabled
            className="w-12 h-12 rounded-xl"
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
          {getChatLanguage() === "urdu" 
            ? "Gemini se taaqatwar • Thanvi alamaat ka andaza nahin" 
            : "Powered by Gemini • Not a substitute for professional medical advice"}
        </p>
      </div>
    </div>
  );
}
