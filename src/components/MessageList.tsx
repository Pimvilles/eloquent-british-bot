
import React, { useRef, useEffect } from "react";
import ChatBubble from "./ChatBubble";
import { useDarkMode } from "@/hooks/useDarkMode";

interface Message {
  text: string;
  sender: "user" | "bot";
  time: string;
}

interface MessageListProps {
  messages: Message[];
  isProcessing: boolean;
  ttsMessageIdx: number | null;
  onPlayMessage: (text: string, idx: number) => void;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isProcessing, 
  ttsMessageIdx, 
  onPlayMessage 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useDarkMode();
  const [shouldAutoScroll, setShouldAutoScroll] = React.useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollContainerRef.current && shouldAutoScroll) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages.length, shouldAutoScroll]);

  // Handle scroll events to detect if user is manually scrolling
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isNearBottom);
  };

  return (
    <div className="flex-1 w-full transition-colors duration-300 relative" style={{ minHeight: 340 }}>
      <div 
        ref={scrollContainerRef}
        className="h-full w-full overflow-y-scroll custom-scrollbar"
        onScroll={handleScroll}
        style={{
          scrollbarWidth: 'thick',
          scrollbarColor: isDarkMode ? '#718096 rgba(255, 255, 255, 0.1)' : '#4a5568 rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="px-12 pt-6 pb-4 pr-8">
          <div className="w-full max-w-5xl mx-auto">
            {messages.map((msg, i) => (
              <ChatBubble
                key={i}
                isBot={msg.sender === "bot"}
                text={msg.text}
                time={msg.time}
                playing={ttsMessageIdx === i}
                onPlay={
                  msg.sender === "bot"
                    ? () => onPlayMessage(msg.text, i)
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageList;
