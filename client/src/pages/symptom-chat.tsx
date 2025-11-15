import { useState } from "react";
import ChatBubble from "@/components/ChatBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Mic, Stethoscope } from "lucide-react";
import { useLocation } from "wouter";
import { analyzeSymptoms } from "@shared/symptom-triage";

export default function SymptomChat() {
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI Symptom Triage Assistant. I can help you understand your symptoms and guide you to the appropriate care.\n\n⚠️ Important: I am NOT a doctor. This is not medical advice — please consult a doctor for proper diagnosis.\n\nDescribe your symptoms and I'll help assess them.",
      isUser: false,
      timestamp: "10:00 AM"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: message,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    const userInput = message;
    setMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const triageResult = analyzeSymptoms(userInput);
      
      let responseText = `**Severity Level:** ${triageResult.severity.toUpperCase()}\n\n`;
      
      if (triageResult.possible_causes.length > 0 && triageResult.possible_causes[0].match_percentage > 0) {
        responseText += `**Possible Causes:**\n`;
        triageResult.possible_causes.forEach((cause, index) => {
          responseText += `${index + 1}. ${cause.disease} (${cause.match_percentage}% match)\n`;
        });
        responseText += `\n`;
      }
      
      if (triageResult.red_flags.length > 0) {
        responseText += `**⚠️ Red Flags:**\n`;
        triageResult.red_flags.forEach(flag => {
          responseText += `• ${flag}\n`;
        });
        responseText += `\n`;
      }
      
      if (triageResult.follow_up_questions.length > 0) {
        responseText += `**Follow-up Questions:**\n`;
        triageResult.follow_up_questions.forEach(q => {
          responseText += `• ${q}\n`;
        });
        responseText += `\n`;
      }
      
      responseText += `**Next Step:**\n${triageResult.recommendation}\n\n`;
      responseText += `${triageResult.advice}`;
      
      const aiResponse = {
        id: messages.length + 2,
        text: responseText,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
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
              <h1 className="font-semibold text-foreground">Symptom Triage</h1>
              <p className="text-xs text-muted-foreground">AI-powered health assessment</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg.text}
            isUser={msg.isUser}
            timestamp={msg.timestamp}
          />
        ))}
        {isTyping && (
          <div className="flex gap-3 mb-4">
            <div className="flex gap-1 bg-muted px-4 py-3 rounded-lg">
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      <div className="border-t p-4 bg-background">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe your symptoms..."
            className="flex-1"
            data-testid="input-message"
          />
          <Button variant="ghost" size="icon" data-testid="button-voice">
            <Mic className="w-5 h-5" />
          </Button>
          <Button onClick={handleSend} size="icon" data-testid="button-send">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
