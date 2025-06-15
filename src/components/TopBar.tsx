
import React from "react";
import { Menu, Settings, Moon, Sun, History, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useDarkMode } from "@/hooks/useDarkMode";
import AvatarLogo from "./AvatarLogo";

interface TopBarProps {
  userName: string;
  messageCount: number;
  onClearHistory: () => void;
  onVoiceCall?: () => void;
  onOpenSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ 
  userName, 
  messageCount, 
  onClearHistory, 
  onVoiceCall,
  onOpenSidebar
}) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className={`flex items-center justify-between px-8 py-6 transition-colors duration-300 ${
      isDarkMode 
        ? 'border-b border-[#232938]' 
        : 'border-b border-gray-200'
    }`}>
      {/* Hamburger Menu */}
      <div className="flex items-center gap-4">
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

        {/* Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className={`text-blue-500 transition-colors duration-300 ${
              isDarkMode ? 'hover:bg-[#232938]' : 'hover:bg-gray-100'
            }`}>
              <Settings className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={`min-w-[200px] transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-[#232938] border-[#3b4251] text-white' 
              : 'bg-white border-gray-200 text-gray-900'
          }`}>
            {/* Dark Mode Toggle */}
            <DropdownMenuItem 
              className={`cursor-pointer flex items-center justify-between transition-colors duration-300 ${
                isDarkMode ? 'hover:bg-[#3b4251]' : 'hover:bg-gray-100'
              }`} 
              onClick={(e) => {
                e.preventDefault();
                toggleDarkMode();
              }}
            >
              <div className="flex items-center">
                {isDarkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </div>
              <Switch checked={isDarkMode} onChange={toggleDarkMode} />
            </DropdownMenuItem>

            <DropdownMenuSeparator className={isDarkMode ? 'bg-[#3b4251]' : 'bg-gray-200'} />
            
            {/* Clear History */}
            <DropdownMenuItem className={`cursor-pointer transition-colors duration-300 ${
              isDarkMode ? 'hover:bg-[#3b4251]' : 'hover:bg-gray-100'
            }`} onClick={onClearHistory}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear History
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
