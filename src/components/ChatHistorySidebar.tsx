
import React from "react";
import { X, MessageCircle, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDarkMode } from "@/hooks/useDarkMode";

interface Message {
  text: string;
  sender: "user" | "bot";
  time: string;
}

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onClearHistory: () => void;
  onMessageClick?: (message: Message, index: number) => void;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  isOpen,
  onClose,
  messages,
  onClearHistory,
  onMessageClick,
}) => {
  const { isDarkMode } = useDarkMode();

  const handleClearHistory = () => {
    onClearHistory();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="left" 
        className={`w-80 p-0 transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-[#171c23] border-[#232938] text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        <SheetHeader className={`p-6 border-b transition-colors duration-300 ${
          isDarkMode ? 'border-[#232938]' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <SheetTitle className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Chat History ({messages.length})
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              className={`text-red-500 hover:text-red-600 transition-colors duration-300 ${
                isDarkMode ? 'hover:bg-[#232938]' : 'hover:bg-gray-100'
              }`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-80px)]">
          <div className="p-4 space-y-3">
            {messages.length === 0 ? (
              <div className={`text-center py-8 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No messages yet</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                    message.sender === "user"
                      ? isDarkMode
                        ? 'bg-blue-600/10 border-blue-600/20 hover:bg-blue-600/20'
                        : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                      : isDarkMode
                        ? 'bg-[#232938] border-[#3b4251] hover:bg-[#3b4251]'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => onMessageClick?.(message, index)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs font-medium ${
                      message.sender === "user"
                        ? 'text-blue-500'
                        : isDarkMode
                          ? 'text-green-400'
                          : 'text-green-600'
                    }`}>
                      {message.sender === "user" ? "You" : "Ghost"}
                    </span>
                    <span className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {message.time}
                    </span>
                  </div>
                  <p className={`text-sm line-clamp-3 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {message.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ChatHistorySidebar;
