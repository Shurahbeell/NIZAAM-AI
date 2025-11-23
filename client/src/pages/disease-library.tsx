import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Activity, Search, AlertCircle, Send, Loader } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { diseaseLibrary } from "@shared/disease-library";
import { useLanguage } from "@/lib/useLanguage";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

export default function DiseaseLibrary() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDisease, setSelectedDisease] = useState<typeof diseaseLibrary[0] | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredDiseases = diseaseLibrary.filter(disease =>
    disease.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    disease.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    disease.symptoms.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleDiseaseSelect = (disease: typeof diseaseLibrary[0]) => {
    setSelectedDisease(disease);
    setChatMessages([
      {
        id: "1",
        type: "ai",
        content: `Hello! I'm your health assistant. Ask me anything about ${disease.name}. I can explain the symptoms, critical levels, what happens to your body, disease stages, and more.`,
        timestamp: new Date()
      }
    ]);
    setChatInput("");
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !selectedDisease || isLoadingChat) return;

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
          disease: selectedDisease.name,
          question: userMessage.content,
          context: {
            symptoms: selectedDisease.symptoms,
            riskFactors: selectedDisease.riskFactors,
            complications: selectedDisease.complications,
            treatments: selectedDisease.treatments,
            prevention: selectedDisease.prevention,
            whenToSeeDoctor: selectedDisease.whenToSeeDoctor
          }
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
            onClick={() => selectedDisease ? setSelectedDisease(null) : setLocation("/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">{t('diseaseLibrary.title')}</h1>
            <p className="text-xs text-muted-foreground">{t('diseaseLibrary.subtitle')}</p>
          </div>
        </div>
      </header>

      {!selectedDisease ? (
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('diseaseLibrary.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredDiseases.map((disease, index) => (
              <Card 
                key={index} 
                className="hover-elevate cursor-pointer"
                onClick={() => handleDiseaseSelect(disease)}
                data-testid={`disease-card-${index}`}
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{disease.name}</CardTitle>
                      <Badge variant="outline" className="mt-2">{disease.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t('diseaseDetails.commonSymptoms')} {disease.symptoms.slice(0, 3).join(", ")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDiseases.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">{t('diseaseLibrary.noResults')}</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="p-4 space-y-4 pb-24">
          {/* Disease AI Chat Section - Moved to Top */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Ask About {selectedDisease.name}
              </CardTitle>
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
                  placeholder="Ask about symptoms, stages, what happens to body, critical level..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isLoadingChat && sendChatMessage()}
                  disabled={isLoadingChat}
                  data-testid="input-disease-chat"
                />
                <Button
                  size="icon"
                  onClick={sendChatMessage}
                  disabled={isLoadingChat || !chatInput.trim()}
                  data-testid="button-send-disease-chat"
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

          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{selectedDisease.name}</CardTitle>
                  <Badge variant="outline" className="mt-2">{selectedDisease.category}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">{t('diseaseDetails.symptoms')}</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDisease.symptoms.map((symptom, i) => (
                    <Badge key={i} variant="outline">{symptom}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">{t('diseaseDetails.riskFactors')}</h3>
                <ul className="space-y-1">
                  {selectedDisease.riskFactors.map((factor, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {factor}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">{t('diseaseDetails.complications')}</h3>
                <ul className="space-y-1">
                  {selectedDisease.complications.map((comp, i) => (
                    <li key={i} className="text-sm text-destructive">⚠️ {comp}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">{t('diseaseDetails.treatment')}</h3>
                <ul className="space-y-1">
                  {selectedDisease.treatments.map((treatment, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {treatment}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">{t('diseaseDetails.prevention')}</h3>
                <ul className="space-y-1">
                  {selectedDisease.prevention.map((prev, i) => (
                    <li key={i} className="text-sm text-accent-foreground">✓ {prev}</li>
                  ))}
                </ul>
              </div>

              <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground mb-1">{t('diseaseDetails.whenToSeeDoctor')}</p>
                    <p className="text-sm text-muted-foreground">{selectedDisease.whenToSeeDoctor}</p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">
                ⚕️ <strong>{t('diseaseDetails.disclaimer')}:</strong> {t('diseaseDetails.disclaimerText')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
