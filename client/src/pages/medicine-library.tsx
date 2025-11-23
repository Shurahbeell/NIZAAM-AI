import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pill, Search, AlertTriangle, Send, Loader, Globe } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { medicineLibrary } from "@shared/medicine-library";
import { useLanguage } from "@/lib/useLanguage";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

export default function MedicineLibrary() {
  const { t, language, setLanguage } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Map language code to API format
  const getLanguageCode = (): "english" | "ur" | "ru" => {
    if (language === "ur") return "ur";
    if (language === "ru") return "ru";
    return "english";
  };

  const getLanguageName = (): string => {
    switch (language) {
      case "ur":
        return "Urdu";
      case "ru":
        return "Roman Urdu";
      default:
        return "English";
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState<typeof medicineLibrary[0] | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [freeChatMessages, setFreeChatMessages] = useState<ChatMessage[]>([]);
  const [freeMedicineName, setFreeMedicineName] = useState("");
  const [freeChatInput, setFreeChatInput] = useState("");
  const [isLoadingFreeChat, setIsLoadingFreeChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const freeMessagesEndRef = useRef<HTMLDivElement>(null);

  const filteredMedicines = medicineLibrary.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    freeMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [freeChatMessages]);

  const handleStartFreeChat = () => {
    if (freeMedicineName.trim()) {
      let greetingMessage = `Hello! I'm your AI pharmacist assistant. I can provide comprehensive information about ${freeMedicineName}. Feel free to ask me about dosage, side effects, interactions, usage, and more. Remember to consult with a healthcare professional for proper medical advice.`;
      
      if (language === "ur") {
        greetingMessage = `السلام علیکم! میں آپ کے فارمیسی کی معاونت کے لیے یہاں ہوں۔ میں ${freeMedicineName} کے بارے میں تفصیلی معلومات فراہم کر سکتا ہوں۔ خوراک، نقصان دہ اثرات، اور تعاملات کے بارے میں پوچھیں۔ یاد رکھیں کہ صحیح طبی مشورے کے لیے ڈاکٹر سے ملیں۔`;
      } else if (language === "ru") {
        greetingMessage = `Assalamu alaikum! Main aapke pharmacy assistant hoon. Main ${freeMedicineName} ke baray mein tafseeli maloomat de sakta hoon. Khurak, nuksan deh asar, aur interactions ke baray mein poochein. Yaad rakhen ke sahih medical mashwray ke liye doctor se milen.`;
      }

      setFreeChatMessages([
        {
          id: "1",
          type: "ai",
          content: greetingMessage,
          timestamp: new Date()
        }
      ]);
    }
  };

  const sendFreeChatMessage = async () => {
    if (!freeChatInput.trim() || !freeMedicineName.trim() || isLoadingFreeChat) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: freeChatInput,
      timestamp: new Date()
    };

    setFreeChatMessages(prev => [...prev, userMessage]);
    setFreeChatInput("");
    setIsLoadingFreeChat(true);

    try {
      const response = await fetch("/api/medicine/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicine: freeMedicineName,
          question: userMessage.content,
          context: {},
          language: getLanguageCode()
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

      setFreeChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from AI. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingFreeChat(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !selectedMedicine || isLoadingChat) return;

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
      const response = await fetch("/api/medicine/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicine: selectedMedicine.name,
          question: userMessage.content,
          context: {
            genericName: selectedMedicine.genericName,
            category: selectedMedicine.category,
            usage: selectedMedicine.usage,
            dosage: selectedMedicine.dosage,
            sideEffects: selectedMedicine.sideEffects,
            interactions: selectedMedicine.interactions,
            contraindications: selectedMedicine.contraindications,
            precautions: selectedMedicine.precautions
          },
          language: getLanguageCode()
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
        <div className="p-4 flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => selectedMedicine ? setSelectedMedicine(null) : setLocation("/dashboard")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{t('medicineLibrary.title')}</h1>
              <p className="text-xs text-muted-foreground">Complete drug information</p>
            </div>
          </div>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-language-selector">
                <Globe className="w-4 h-4 mr-2" />
                {getLanguageName()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setLanguage("en")}
                className={language === "en" ? "bg-primary/10" : ""}
                data-testid="option-language-english"
              >
                English
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage("ur")}
                className={language === "ur" ? "bg-primary/10" : ""}
                data-testid="option-language-urdu"
              >
                اردو (Urdu)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage("ru")}
                className={language === "ru" ? "bg-primary/10" : ""}
                data-testid="option-language-roman-urdu"
              >
                Roman Urdu
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {!selectedMedicine ? (
        <div className="p-4 space-y-4">
          {/* Free-Form Medicine Chatbot Section */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Ask About Any Medicine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Medicine Name Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter medicine name (e.g., Paracetamol, Ibuprofen, Amoxicillin)"
                  value={freeMedicineName}
                  onChange={(e) => setFreeMedicineName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && freeMedicineName.trim() && !freeChatMessages.length) {
                      handleStartFreeChat();
                    }
                  }}
                  disabled={freeChatMessages.length > 0}
                  data-testid="input-free-medicine-name"
                  className="flex-1"
                />
                {freeChatMessages.length === 0 && (
                  <Button
                    onClick={handleStartFreeChat}
                    disabled={!freeMedicineName.trim()}
                    data-testid="button-start-free-chat"
                  >
                    Start
                  </Button>
                )}
              </div>

              {/* Chat Messages Container */}
              {freeChatMessages.length > 0 && (
                <>
                  <div className="bg-background border rounded-lg h-80 overflow-y-auto p-4 space-y-4" data-testid="free-chat-container">
                    {freeChatMessages.map((msg) => (
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
                    {isLoadingFreeChat && (
                      <div className="flex justify-start">
                        <div className="bg-muted px-4 py-2 rounded-lg">
                          <Loader className="w-4 h-4 animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={freeMessagesEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask about dosage, side effects, interactions..."
                      value={freeChatInput}
                      onChange={(e) => setFreeChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !isLoadingFreeChat && sendFreeChatMessage()}
                      disabled={isLoadingFreeChat}
                      data-testid="input-free-chat-question"
                    />
                    <Button
                      size="icon"
                      onClick={sendFreeChatMessage}
                      disabled={isLoadingFreeChat || !freeChatInput.trim()}
                      data-testid="button-send-free-chat"
                    >
                      {isLoadingFreeChat ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setFreeMedicineName("");
                      setFreeChatMessages([]);
                    }}
                    className="w-full"
                    data-testid="button-change-free-medicine"
                  >
                    Ask About Different Medicine
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Medicine Library Section */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground px-1">Or Browse Medicine Library</h2>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('medicineLibrary.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredMedicines.map((medicine, index) => (
                <Card 
                  key={index} 
                  className="hover-elevate cursor-pointer"
                  onClick={() => setSelectedMedicine(medicine)}
                  data-testid={`medicine-card-${index}`}
                >
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Pill className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{medicine.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{medicine.genericName}</p>
                        <Badge variant="outline" className="mt-2">{medicine.category}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <p className="text-sm text-muted-foreground">{medicine.usage}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredMedicines.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Pill className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">{t('medicineLibrary.noResults')}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-4 pb-24">
          {/* Medicine AI Chat Section - Moved to Top */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Ask About {selectedMedicine.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Chat Messages Container */}
              <div className="bg-background border rounded-lg h-96 overflow-y-auto p-4 space-y-4" data-testid="medicine-chat-container">
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
                  placeholder="Ask about dosage, side effects, interactions, precautions..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isLoadingChat && sendChatMessage()}
                  disabled={isLoadingChat}
                  data-testid="input-medicine-chat"
                />
                <Button
                  size="icon"
                  onClick={sendChatMessage}
                  disabled={isLoadingChat || !chatInput.trim()}
                  data-testid="button-send-medicine-chat"
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
                  <Pill className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{selectedMedicine.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{selectedMedicine.genericName}</p>
                  <Badge variant="outline" className="mt-2">{selectedMedicine.category}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">{t('medicineDetails.sideEffects')}</h3>
                <p className="text-sm text-muted-foreground">{selectedMedicine.usage}</p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">{t('medicineDetails.dosage')}</h3>
                <p className="text-sm text-muted-foreground">{selectedMedicine.dosage}</p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">{t('medicineDetails.sideEffects')}</h3>
                <ul className="space-y-1">
                  {selectedMedicine.sideEffects.map((effect, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {effect}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">{t('medicineDetails.interactions')}</h3>
                <ul className="space-y-1">
                  {selectedMedicine.interactions.map((interaction, i) => (
                    <li key={i} className="text-sm text-destructive">⚠️ {interaction}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">{t('medicineDetails.warnings')}</h3>
                <ul className="space-y-1">
                  {selectedMedicine.contraindications.map((contra, i) => (
                    <li key={i} className="text-sm text-destructive">⛔ {contra}</li>
                  ))}
                </ul>
              </div>

              <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground mb-1">{t('medicineDetails.warnings')}</p>
                    <p className="text-sm text-muted-foreground">{selectedMedicine.precautions}</p>
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
