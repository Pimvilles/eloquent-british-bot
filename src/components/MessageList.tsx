
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
  const messageListRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useDarkMode();
  const [shouldAutoScroll, setShouldAutoScroll] = React.useState(true);

  // Only auto-scroll when new messages arrive and user is near bottom
  useEffect(() => {
    if (messageListRef.current && shouldAutoScroll) {
      const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      if (isNearBottom) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }
    }
  }, [messages.length, shouldAutoScroll]);

  // Handle scroll events to detect if user is manually scrolling
  const handleScroll = () => {
    if (messageListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
    }
  };

  return (
    <div
      className={`flex-1 w-full overflow-y-auto px-12 pt-6 pb-4 transition-colors duration-300`}
      ref={messageListRef}
      onScroll={handleScroll}
      style={{ minHeight: 340 }}
    >
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
  );
};

export default MessageList;
