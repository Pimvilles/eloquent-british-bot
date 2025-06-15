
import React from "react";
import { Play, Copy } from "lucide-react";
import AvatarLogo from "./AvatarLogo";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useToast } from "@/hooks/use-toast";

interface Props {
  isBot: boolean;
  text: string;
  time: string;
  onPlay?: () => void;
  playing?: boolean;
}

const ChatBubble: React.FC<Props> = ({ isBot, text, time, onPlay, playing }) => {
  const { isDarkMode } = useDarkMode();
  const { toast } = useToast();
  
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
        duration: 2000,
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        title: "Copy failed",
        description: "Unable to copy text to clipboard",
        variant: "destructive",
        duration: 2000,
      });
    }
  };
  
  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"} mb-2`}>
      {isBot && (
        <div className="mr-3 mt-1">
          <AvatarLogo size={40} />
        </div>
      )}
      <div
        className={`
          px-5 py-3 rounded-2xl max-w-2xl shadow transition-colors duration-300
          ${isBot 
            ? isDarkMode 
              ? "bg-[#232938] text-white" 
              : "bg-gray-100 text-gray-900"
            : "bg-blue-600 text-white"
          }
          relative flex items-center group
        `}
        style={{ borderTopLeftRadius: isBot ? 0 : 16, borderTopRightRadius: !isBot ? 0 : 16 }}
      >
        <span className={`${isBot ? "mr-16" : "mr-8"}`}>{text}</span>
        {isBot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              aria-label="Copy text"
              onClick={handleCopyText}
              className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                isDarkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-600"
              }`}
            >
              <Copy width={16} height={16} />
            </button>
            {onPlay && (
              <button
                aria-label="Play"
                onClick={onPlay}
                className={`text-blue-400 hover:text-blue-300 transition ${
                  playing ? "animate-pulse" : ""
                }`}
              >
                <Play width={20} height={20} />
              </button>
            )}
          </div>
        )}
        <span className={`absolute bottom-1 right-3 text-xs transition-colors duration-300 ${
          isDarkMode ? "text-gray-400" : "text-gray-500"
        }`}>{time}</span>
      </div>
      {!isBot && (
        <div className="ml-3 mt-1">
          {/* Empty for space/alignment if needed */}
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
