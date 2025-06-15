
import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDarkMode } from "@/hooks/useDarkMode";
import AvatarLogo from "./AvatarLogo";

interface TopBarProps {
  userName: string;
  messageCount: number;
  onClearHistory: () => void;
  onVoiceCall?: () => void;
  onOpenSidebar: () => void;
  onNewChat: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ 
  userName, 
  messageCount, 
  onClearHistory, 
  onVoiceCall,
  onOpenSidebar,
  onNewChat
}) => {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`flex items-center justify-between px-8 py-6 transition-colors duration-300 ${
      isDarkMode 
        ? 'border-b border-[#232938]' 
        : 'border-b border-gray-200'
    }`}>
      {/* Hamburger Menu */}
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className={`text-blue-500 transition-colors duration-300 ${
            isDarkMode ? 'hover:bg-[#232938]' : 'hover:bg-gray-100'
          }`}
          onClick={onOpenSidebar}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Centered Greeting */}
      <div className="flex-1 flex justify-center">
        <h2 className="text-3xl font-extrabold text-blue-500 mb-0">
          Hello, {userName}
        </h2>
      </div>

      {/* Avatar with Voice Call */}
      <div className="flex-shrink-0">
        <AvatarLogo size={68} onClick={onVoiceCall} />
      </div>
    </div>
  );
};

export default TopBar;
