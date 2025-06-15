
import React, { useState } from "react";
import TopBar from "./TopBar";
import MessageList from "./MessageList";
import MessageInputRow from "./MessageInputRow";
import BrandFooter from "./BrandFooter";
import PWAInstallPrompt from "./PWAInstallPrompt";
import ChatHistorySidebar from "./ChatHistorySidebar";
import VoiceCallModal from "./VoiceCallModal";
import { speakWithBrowser } from "@/lib/speech";
import { useChat } from "@/hooks/useChat";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useVoiceCall } from "@/hooks/useVoiceCall";
import { ProcessedFile } from "@/lib/fileUtils";

const USER_NAME = "Mr Moloto";

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [ttsMessageIdx, setTtsMessageIdx] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<ProcessedFile[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isDarkMode } = useDarkMode();
  
  const { messages, isProcessing, sendMessage, handleClearHistory, handleNewChat, loadMessageContext } = useChat();
  const { isCallActive, startCall, endCall } = useVoiceCall();

  const handleSend = async () => {
    const question = input.trim();
    let messageContent = question;
    
    // Add file information to the message if files are selected
    if (selectedFiles.length > 0) {
      const fileDescriptions = selectedFiles.map(file => {
        if (file.isImage) {
          return `Image: ${file.name} (${file.type})`;
        } else if (file.isDocument) {
          return `Document: ${file.name}`;
        } else if (file.isMedia) {
          return `Media: ${file.name} (${file.type})`;
        }
        return `File: ${file.name}`;
      }).join(', ');
      
      messageContent = question 
        ? `${question}\n\nAttached files: ${fileDescriptions}`
        : `Attached files: ${fileDescriptions}`;
    }
    
    if (!messageContent && selectedFiles.length === 0) return;
    
    setInput("");
    setSelectedFiles([]);
    await sendMessage(messageContent);
  };

  const handlePlayMessage = (text: string, idx: number) => {
    setTtsMessageIdx(idx);
    speakWithBrowser({
      text,
      onStart: () => setTtsMessageIdx(idx),
      onEnd: () => setTtsMessageIdx(null),
    });
  };

  const handleSpeechToTextResult = (txt: string) => {
    setInput(txt);
  };

  const handleVoiceCall = () => {
    startCall();
  };

  const handleEndVoiceCall = () => {
    endCall();
  };

  const handleFilesSelected = (files: ProcessedFile[]) => {
    setSelectedFiles(files);
  };

  const handleOpenSidebar = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleMessageClick = (message: any, index: number) => {
    loadMessageContext(message, index);
    setIsSidebarOpen(false);
    console.log('Loaded conversation up to message:', message, 'at index:', index);
  };

  return (
    <>
      <PWAInstallPrompt />
      <div className={`flex flex-col h-full w-full mx-auto rounded-2xl shadow-2xl transition-colors duration-300 mobile-viewport-fix ${
        isDarkMode 
          ? 'bg-[#171c23] text-white' 
          : 'bg-white text-gray-900'
      }`}>
        <div className="flex-shrink-0">
          <TopBar 
            userName={USER_NAME}
            messageCount={messages.length}
            onClearHistory={handleClearHistory}
            onNewChat={handleNewChat}
            onVoiceCall={handleVoiceCall}
            onOpenSidebar={handleOpenSidebar}
          />
        </div>
        
        <div className="flex-1 overflow-hidden">
          <MessageList
            messages={messages}
            isProcessing={isProcessing}
            ttsMessageIdx={ttsMessageIdx}
            onPlayMessage={handlePlayMessage}
          />
        </div>
        
        <div className="flex-shrink-0">
          <div className="px-0">
            <MessageInputRow
              value={input}
              onChange={setInput}
              onSend={handleSend}
              onSpeechResult={handleSpeechToTextResult}
              onFilesSelected={handleFilesSelected}
            />
          </div>
          
          {isProcessing && (
            <div className="w-full flex justify-center py-3 text-blue-400 animate-pulse">
              <span>Melsi is executing your request...</span>
            </div>
          )}
          
          <div className="pb-safe">
            <BrandFooter />
          </div>
        </div>
      </div>

      <ChatHistorySidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        messages={messages}
        onClearHistory={handleClearHistory}
        onNewChat={handleNewChat}
        onMessageClick={handleMessageClick}
      />

      <VoiceCallModal
        isOpen={isCallActive}
        onClose={handleEndVoiceCall}
      />
    </>
  );
};

export default Chatbot;
