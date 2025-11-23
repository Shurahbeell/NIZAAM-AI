import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Send, Loader } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/useLanguage";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

export default function DiseaseChatbot() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [diseaseName, setDiseaseName] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleDiseaseChange = () => {
    if (diseaseName.trim()) {
      setChatMessages([
        {
          id: "1",
          type: "ai",
          content: `Hello! I'm your AI health assistant. I can provide information about ${diseaseName}. Feel free to ask me about symptoms, treatments, prevention, risk factors, and more. Remember to consult with a healthcare professional for diagnosis and treatment.`,
          timestamp: new Date()
        }
      ]);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !diseaseName.trim() || isLoadingChat) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsLoadingChat(true);

    try {
      const response = await fetch("/api/disease/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disease: diseaseName,
          question: userMessage.content,
          context: {}
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.response,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get response from AI. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingChat(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">Disease Chatbot</h1>
            <p className="text-xs text-muted-foreground">Ask about any disease</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Disease Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Which disease would you like to know about?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Enter disease name (e.g., Diabetes, Hypertension, Asthma)"
                value={diseaseName}
                onChange={(e) => setDiseaseName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && diseaseName.trim() && !chatMessages.length) {
                    handleDiseaseChange();
                  }
                }}
                data-testid="input-disease-name"
                className="flex-1"
              />
              {!chatMessages.length && (
                <Button
                  onClick={handleDiseaseChange}
                  disabled={!diseaseName.trim()}
                  data-testid="button-select-disease"
                >
                  Start Chat
                </Button>
              )}
            </div>
            {chatMessages.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  setDiseaseName("");
                  setChatMessages([]);
                }}
                className="w-full"
                data-testid="button-change-disease"
              >
                Change Disease
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Chat Section */}
        {chatMessages.length > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base">Chat about {diseaseName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Chat Messages Container */}
              <div className="bg-background border rounded-lg h-96 overflow-y-auto p-4 space-y-4" data-testid="disease-chat-container">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === "ai" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.type === "ai"
                          ? "bg-muted text-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoadingChat && (
                  <div className="flex justify-start">
                    <div className="bg-muted px-4 py-2 rounded-lg">
                      <Loader className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about symptoms, treatment, prevention, risk factors..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isLoadingChat && sendChatMessage()}
                  disabled={isLoadingChat}
                  data-testid="input-disease-question"
                />
                <Button
                  size="icon"
                  onClick={sendChatMessage}
                  disabled={isLoadingChat || !chatInput.trim()}
                  data-testid="button-send-question"
                >
                  {isLoadingChat ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              <strong>💡 Tip:</strong> This chatbot can answer questions about any disease. Ask about symptoms, causes, treatments, prevention, risk factors, and more. Always consult a healthcare professional for medical advice.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
