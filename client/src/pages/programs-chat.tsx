import { useState, useEffect, useRef } from "react";
import ChatBubble from "@/components/ChatBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, Mic, Building2, Sparkles, Info } from "lucide-react";
import { useLocation } from "wouter";
import { healthPrograms } from "@shared/health-programs";

export default function ProgramsChat() {
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Welcome to Pakistan Health Programs Advisor! I can help you find information about all government health programs.\n\nYou can ask me:\n• 'List all programs' to see all 20 available programs\n• About specific programs (e.g., 'Tell me about Sehat Card')\n• 'Which program am I eligible for?' with your details\n• 'What documents are needed?'",
      isUser: false,
      timestamp: "10:00 AM"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatProgramsResponse = (userQuery: string) => {
    const query = userQuery.toLowerCase();
    
    if (query.includes("all programs") || query.includes("list all") || query.includes("show all")) {
      let response = "Here are all available Pakistan health programs:\n\n";
      healthPrograms.forEach((program, index) => {
        response += `${index + 1}. ${program.name}\n`;
      });
      response += "\n\nAsk about any specific program to learn more, or ask 'Which program am I eligible for?' with your details.";
      return response;
    }
    
    if (query.includes("eligible") || query.includes("qualify")) {
      return "To check which programs you're eligible for, please tell me:\n• Your province\n• Your age\n• Your income level (low/middle/high)\n• Any specific health condition (pregnancy, TB, kidney, etc.)\n• Whether you're registered in BISP\n\nI'll then recommend the best programs for you.";
    }
    
    if (query.includes("documents") || query.includes("what do i need")) {
      return "**Common Documents Needed:**\n\n• CNIC (Computerized National Identity Card)\n• B-Form (for children)\n• Hospital slip/medical records\n• Doctor prescription (if applicable)\n• Proof of income (for Bait-ul-Mal and means-tested programs)\n\nSpecific programs may need additional documents. Ask about a specific program for exact requirements.";
    }
    
    const matchedProgram = healthPrograms.find(p => 
      p.name.toLowerCase().includes(query) || 
      query.includes(p.name.toLowerCase().split(" ")[0])
    );
    
    if (matchedProgram) {
      return `### ${matchedProgram.name}\n\n` +
        `• **Purpose:** ${matchedProgram.purpose}\n\n` +
        `• **Eligibility:** ${matchedProgram.eligibility}\n\n` +
        `• **Benefits:** ${matchedProgram.benefits}\n\n` +
        `• **Required Documents:** ${matchedProgram.required_documents.join(", ")}\n\n` +
        `• **Cost:** ${matchedProgram.cost}\n\n` +
        `• **How to Apply:** ${matchedProgram.how_to_apply}\n\n` +
        `*Note: ${matchedProgram.notes}*`;
    }
    
    return "I can help you with information about Pakistan health programs. You can:\n\n" +
      "• Ask 'list all programs' to see all available programs\n" +
      "• Ask about specific programs (e.g., 'Tell me about Sehat Card')\n" +
      "• Ask 'Which program am I eligible for?' with your details\n" +
      "• Ask 'What documents are needed?'";
  };

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: message,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    const userQuery = message;
    setMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const responseText = formatProgramsResponse(userQuery);
      
      const aiResponse = {
        id: messages.length + 2,
        text: responseText,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      scrollToBottom();
    }, 1500);
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
              <h1 className="font-bold text-white text-lg">Health Programs</h1>
              <p className="text-xs text-white/80 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Pakistan government programs
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg.text}
            isUser={msg.isUser}
            timestamp={msg.timestamp}
          />
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
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
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about health programs..."
            className="flex-1 h-12 rounded-xl border-2 text-base shadow-md"
            data-testid="input-message"
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
            className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all duration-300"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
          <Building2 className="w-3 h-3" />
          20+ Pakistan government health programs available
        </p>
      </div>
    </div>
  );
}
