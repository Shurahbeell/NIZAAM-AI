import { useState, useEffect, useRef } from "react";
import ChatBubble from "@/components/ChatBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, Mic, Building2, Sparkles, Info } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/useLanguage";
import type { AgentSession, AgentMessage } from "@shared/schema";

export default function ProgramsChat() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { language: globalLanguage } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create agent session on mount
  useEffect(() => {
    if (sessionId) return;
    
    const initSession = async () => {
      try {
        const response = await apiRequest("POST", "/api/agent/sessions", {
          userId: "demo-user",
          agent: "knowledge",
          language: globalLanguage
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
        agentName: "knowledge",
        message: userMessage,
        language: globalLanguage
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
                {globalLanguage !== "en" ? "Sehat Programs" : "Health Programs"}
              </h1>
              <p className="text-xs text-white/80 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {globalLanguage !== "en" ? "Pakistan sarkaari programs" : "Pakistan government programs"}
              </p>
            </div>
          </div>
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
                  {globalLanguage !== "en" 
                    ? "Khush aamdeed!" 
                    : "Welcome!"}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {globalLanguage !== "en"
                    ? "Main aapko Pakistan ke sab sarkaari sehat programs ke barey mein jaankari dene mein madad kar sakta hoon."
                    : "I can help you find information about all Pakistan government health programs."}
                </p>
                <p className="text-xs text-muted-foreground">
                  {globalLanguage !== "en"
                    ? "Aap poochen:\n• 'Sab programs' dekhnay ke liye\n• Kisi khaas program ke barey mein\n• Apni eligibility check karnay ke liye"
                    : "You can ask:\n• 'List all programs' to see available programs\n• About specific programs\n• To check your eligibility"}
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
            placeholder={globalLanguage !== "en" ? "Sehat programs ke barey mein pochain..." : "Ask about health programs..."}
            className="flex-1 h-12 rounded-xl border-2 text-base shadow-md"
            data-testid="input-message"
            disabled={!sessionId || sendMessageMutation.isPending}
            dir={globalLanguage === "ur" ? "rtl" : "ltr"}
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
          {globalLanguage !== "en"
            ? "Gemini se taaqatwar • 20+ Pakistan sehat programs"
            : "Powered by Gemini • 20+ Pakistan health programs"}
        </p>
      </div>
    </div>
  );
}
