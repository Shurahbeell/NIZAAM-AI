import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

export default function ChatBubble({ message, isUser, timestamp }: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      data-testid={`chat-bubble-${isUser ? 'user' : 'ai'}`}
    >
      <Avatar className={cn(
        "w-10 h-10 flex-shrink-0 border-2 shadow-md",
        isUser ? "border-primary/20" : "border-secondary/20"
      )}>
        <AvatarFallback className={cn(
          "font-semibold",
          isUser 
            ? "bg-gradient-to-br from-primary to-secondary text-white" 
            : "bg-gradient-to-br from-accent to-accent/50 text-foreground"
        )}>
          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </AvatarFallback>
      </Avatar>
      <div className={cn("flex flex-col max-w-[80%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-5 py-3 rounded-2xl shadow-md",
            isUser
              ? "bg-gradient-to-br from-primary to-secondary text-white"
              : "bg-white border border-border"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>
        {timestamp && (
          <span className="text-xs text-muted-foreground mt-1.5 px-1">{timestamp}</span>
        )}
      </div>
    </div>
  );
}
