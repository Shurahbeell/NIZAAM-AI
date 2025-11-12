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
      className={cn("flex gap-3 mb-4", isUser ? "flex-row-reverse" : "flex-row")}
      data-testid={`chat-bubble-${isUser ? 'user' : 'ai'}`}
    >
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className={cn(isUser ? "bg-primary" : "bg-accent")}>
          {isUser ? <User className="w-4 h-4 text-primary-foreground" /> : <Bot className="w-4 h-4 text-accent-foreground" />}
        </AvatarFallback>
      </Avatar>
      <div className={cn("flex flex-col max-w-[80%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-4 py-3 rounded-lg",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          <p className="text-sm leading-relaxed">{message}</p>
        </div>
        {timestamp && (
          <span className="text-xs text-muted-foreground mt-1">{timestamp}</span>
        )}
      </div>
    </div>
  );
}
