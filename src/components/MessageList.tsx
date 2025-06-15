
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
    <div className="flex-1 flex flex-col w-full transition-colors duration-300" style={{ height: '100%', minHeight: '340px' }}>
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar"
        onScroll={handleScroll}
        style={{ height: '100%' }}
      >
        <div className="px-12 pt-6 pb-4 pr-8 min-h-full">
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
