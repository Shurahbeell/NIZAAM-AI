import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Send, Sparkles, Heart, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/useLanguage";
import { useLHWLanguage } from "@/lib/useLHWLanguage";
import { LHWLanguageToggle } from "@/components/lhw-language-toggle";

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

export default function MenstrualHealthAdvisor() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { language: appLanguage } = useLanguage();
  const { language: lhwLanguage, t } = useLHWLanguage();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "ai",
      content:
        lhwLanguage === "ur"
          ? "السلام علیکم! میں آپ کے ماہانہ صحت کے بارے میں سوالات کا جواب دینے میں آپ کی مدد کرنے کے لیے یہاں ہوں۔ ماہانہ سائیکل، محفوظ مصنوعات، صفائی، اور صحت سے متعلق کوئی بھی سوال پوچھیں۔"
          : "Hello! I'm your AI Menstrual Health Advisor. I'm here to provide information about menstrual health, safe products, hygiene practices, cycle tracking, and general wellness. Feel free to ask any questions about menstrual health education.",
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState("general");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/agent/menstrual-chat", {
        message: chatInput,
        topic,
        language: lhwLanguage === "ur" ? "ur" : "en",
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.response,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get response from AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const topics = [
    { value: "general", label: lhwLanguage === "ur" ? "عام" : "General" },
    { value: "products", label: lhwLanguage === "ur" ? "محفوظ مصنوعات" : "Products" },
    { value: "hygiene", label: lhwLanguage === "ur" ? "صفائی" : "Hygiene" },
    { value: "tracking", label: lhwLanguage === "ur" ? "ٹریکنگ" : "Tracking" },
    { value: "infections", label: lhwLanguage === "ur" ? "انفیکشنز" : "Infections" },
    { value: "adolescent", label: lhwLanguage === "ur" ? "نوجوان" : "Adolescent" },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/lhw/menstrual-hub")} data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Heart className="w-6 h-6 text-rose-600" />
                {t("lhw.menstrual_health_advisor")}
              </h1>
              <p className="text-sm text-muted-foreground">Powered by Gemini AI</p>
            </div>
          </div>
          <LHWLanguageToggle />
        </div>

        {/* Topic Selection */}
        <Card className="p-4 mb-4">
          <label className="text-sm font-medium mb-2 block">{t("lhw.topic")}</label>
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger data-testid="select-topic">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {topics.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* Disclaimer */}
        <Alert className="mb-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900 dark:text-amber-300">
            {lhwLanguage === "ur" ? "یہ ای آئی مشیر عام صحت کی معلومات فراہم کرتا ہے۔ سنگین مسائل کے لیے براہ کرم ڈاکٹر سے رجوع کریں۔" : "This AI advisor provides general health information. For serious concerns or persistent issues, please consult a healthcare professional."}
          </AlertDescription>
        </Alert>

        {/* Chat Container */}
        <Card className="p-4 h-96 flex flex-col mb-4 overflow-hidden">
          <div className="flex-1 overflow-y-auto mb-4 space-y-3">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                data-testid={`message-${msg.id}`}
              >
                <div
                  className={`max-w-xs rounded-lg p-3 ${
                    msg.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs mt-1 opacity-70">{msg.timestamp.toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <Skeleton className="h-12 w-48" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              placeholder={t("lhw.ask_question")}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
              data-testid="input-message"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !chatInput.trim()}
              size="icon"
              data-testid="button-send"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Suggested Questions */}
        <Card className="p-4">
          <p className="text-sm font-medium mb-3">{lhwLanguage === "ur" ? "تجویز شدہ سوالات" : "Suggested Questions"}</p>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start text-left h-auto py-2"
              onClick={() => {
                setChatInput("What are safe menstrual products?");
                setTimeout(() => handleSendMessage(), 100);
              }}
              data-testid="button-question-1"
            >
              <Sparkles className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>What are safe menstrual products?</span>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-left h-auto py-2"
              onClick={() => {
                setChatInput("How often should I change menstrual protection?");
                setTimeout(() => handleSendMessage(), 100);
              }}
              data-testid="button-question-2"
            >
              <Sparkles className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>How often should I change protection?</span>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-left h-auto py-2"
              onClick={() => {
                setChatInput("How do I track my menstrual cycle?");
                setTimeout(() => handleSendMessage(), 100);
              }}
              data-testid="button-question-3"
            >
              <Sparkles className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>How do I track my cycle?</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
