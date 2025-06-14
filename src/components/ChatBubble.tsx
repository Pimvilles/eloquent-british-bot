
import React from "react";
import { Play } from "lucide-react";
import AvatarLogo from "./AvatarLogo";

interface Props {
  isBot: boolean;
  text: string;
  time: string;
  onPlay?: () => void;
  playing?: boolean;
}

const ChatBubble: React.FC<Props> = ({ isBot, text, time, onPlay, playing }) => (
  <div className={`flex ${isBot ? "justify-start" : "justify-end"} mb-2`}>
    {isBot && (
      <div className="mr-3 mt-1">
        <AvatarLogo size={40} />
      </div>
    )}
    <div
      className={`
        px-5 py-3 rounded-2xl max-w-2xl shadow
        ${isBot ? "bg-[#232937] text-white" : "bg-blue-600 text-white"}
        relative flex items-center
      `}
      style={{ borderTopLeftRadius: isBot ? 0 : 16, borderTopRightRadius: !isBot ? 0 : 16 }}
    >
      <span className="mr-8">{text}</span>
      {isBot && onPlay && (
        <button
          aria-label="Play"
          onClick={onPlay}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 transition ${
            playing ? "animate-pulse" : ""
          }`}
        >
          <Play width={24} height={24} />
        </button>
      )}
      <span className="absolute bottom-1 right-3 text-xs text-gray-400">{time}</span>
    </div>
    {!isBot && (
      <div className="ml-3 mt-1">
        {/* Empty for space/alignment if needed */}
      </div>
    )}
  </div>
);

export default ChatBubble;
