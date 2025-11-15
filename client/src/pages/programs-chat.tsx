import { useState } from "react";
import ChatBubble from "@/components/ChatBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Mic, Building2 } from "lucide-react";
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
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Health Programs</h1>
              <p className="text-xs text-muted-foreground">Pakistan government programs</p>
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
            placeholder="Ask about health programs..."
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
