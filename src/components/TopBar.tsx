
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
}

const TopBar: React.FC<TopBarProps> = ({ userName, messageCount, onClearHistory }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="flex items-center justify-between border-b border-[#232938] px-8 py-6">
      {/* Hamburger Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-[#232938]">
            <Menu className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="bg-[#232938] border-[#3b4251] text-white min-w-[200px]">
          <DropdownMenuItem className="hover:bg-[#3b4251] cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-[#3b4251]" />
          
          {/* Dark Mode Toggle */}
          <DropdownMenuItem className="hover:bg-[#3b4251] cursor-pointer flex items-center justify-between" onClick={toggleDarkMode}>
            <div className="flex items-center">
              {isDarkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </div>
            <Switch checked={isDarkMode} />
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-[#3b4251]" />
          
          {/* Conversation History */}
          <DropdownMenuItem className="hover:bg-[#3b4251] cursor-pointer" onClick={onClearHistory}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear History
          </DropdownMenuItem>
          
          <DropdownMenuItem className="hover:bg-[#3b4251] cursor-pointer">
            <History className="mr-2 h-4 w-4" />
            History ({messageCount} messages)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Centered Greeting */}
      <div className="flex-1 flex justify-center">
        <h2 className="text-3xl font-extrabold text-blue-500 mb-0">
          Hello, {userName}
        </h2>
      </div>

      {/* Avatar */}
      <div className="flex-shrink-0">
        <AvatarLogo size={68} />
      </div>
    </div>
  );
};

export default TopBar;
