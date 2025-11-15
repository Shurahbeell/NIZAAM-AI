import { useState, useEffect, useRef } from "react";
import ChatBubble from "@/components/ChatBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, Mic, Stethoscope, Globe, AlertTriangle, Info } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AgentSession, AgentMessage } from "@shared/schema";

export default function SymptomChat() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [language, setLanguage] = useState<"english" | "urdu">("english");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create agent session on mount (only once)
  useEffect(() => {
    if (sessionId) return; // Guard: don't create multiple sessions
    
    const initSession = async () => {
      try {
        const response = await apiRequest("POST", "/api/agent/sessions", {
          userId: "demo-user", // TODO: Get from auth context
          agent: "triage",
          language: "english" // Initial language, can be changed per message
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
  }, [sessionId, toast]); // Removed language from dependencies

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
        language
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

  const toggleLanguage = () => {
    const newLanguage = language === "english" ? "urdu" : "english";
    setLanguage(newLanguage);
    toast({
      title: language === "english" ? "زبان تبدیل ہوگئی" : "Language Changed",
      description: language === "english" ? "اردو میں منتقل کیا گیا" : "Switched to English"
    });
  };

  // Get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency": return "destructive";
      case "bhu-visit": return "default";
      case "self-care": return "secondary";
      default: return "outline";
    }
  };

  // Get urgency label
  const getUrgencyLabel = (urgency: string) => {
    if (language === "urdu") {
      switch (urgency) {
        case "emergency": return "ایمرجنسی";
        case "bhu-visit": return "ڈاکٹر سے ملیں";
        case "self-care": return "گھر پر علاج";
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
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">
                {language === "urdu" ? "علامات کا جائزہ" : "Symptom Triage"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {language === "urdu" ? "AI سے طاقتور صحت کا جائزہ" : "AI-powered health assessment"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleLanguage}
            data-testid="button-language-toggle"
          >
            <Globe className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Welcome message */}
        {(!messages || messages.length === 0) && (
          <Card className="p-6 mb-4 bg-muted/50">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">
                  {language === "urdu" 
                    ? "خوش آمدید!" 
                    : "Welcome!"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === "urdu"
                    ? "میں آپ کا AI ٹرائیج اسسٹنٹ ہوں۔ میں آپ کی علامات کو سمجھنے اور مناسب نگہداشت کی رہنمائی میں مدد کر سکتا ہوں۔"
                    : "I'm your AI Triage Assistant powered by GPT-5. I can help you understand your symptoms and guide you to appropriate care."}
                </p>
                <div className="mt-3 p-3 bg-background rounded-md border border-destructive/20">
                  <div className="flex gap-2 items-start">
                    <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      {language === "urdu"
                        ? "⚠️ اہم: میں ڈاکٹر نہیں ہوں۔ یہ طبی مشورہ نہیں ہے — براہ کرم صحیح تشخیص کے لیے ڈاکٹر سے رجوع کریں۔"
                        : "⚠️ Important: I am NOT a doctor. This is not medical advice — please consult a doctor for proper diagnosis."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Messages */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
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
                  <div className="ml-12 mt-2 flex flex-wrap gap-2">
                    {urgency && (
                      <Badge variant={getUrgencyColor(urgency)} data-testid={`badge-urgency-${urgency}`}>
                        {getUrgencyLabel(urgency)}
                      </Badge>
                    )}
                    {confidence !== undefined && (
                      <Badge variant="outline" data-testid="badge-confidence">
                        {language === "urdu" ? "اعتماد" : "Confidence"}: {Math.round(confidence * 100)}%
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
          <div className="flex gap-3 mb-4">
            <div className="flex gap-1 bg-muted px-4 py-3 rounded-lg">
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4 bg-background">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !sendMessageMutation.isPending && handleSend()}
            placeholder={language === "urdu" ? "اپنی علامات بیان کریں..." : "Describe your symptoms..."}
            className="flex-1"
            disabled={!sessionId || sendMessageMutation.isPending}
            data-testid="input-message"
            dir={language === "urdu" ? "rtl" : "ltr"}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            data-testid="button-voice"
            disabled
          >
            <Mic className="w-5 h-5" />
          </Button>
          <Button 
            onClick={handleSend} 
            size="icon" 
            data-testid="button-send"
            disabled={!sessionId || sendMessageMutation.isPending || !message.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">
          {language === "urdu" 
            ? "GPT-5 سے طاقتور • ثانوی علامات کا اندازہ نہیں" 
            : "Powered by GPT-5 • Not a substitute for professional medical advice"}
        </p>
      </div>
    </div>
  );
}
