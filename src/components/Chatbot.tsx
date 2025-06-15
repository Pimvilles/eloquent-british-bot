
import React, { useState } from "react";
import TopBar from "./TopBar";
import MessageList from "./MessageList";
import MessageInputRow from "./MessageInputRow";
import BrandFooter from "./BrandFooter";
import { speakWithBrowser } from "@/lib/speech";
import { useChat } from "@/hooks/useChat";
import { useDarkMode } from "@/hooks/useDarkMode";

const USER_NAME = "Mr Moloto";

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [ttsMessageIdx, setTtsMessageIdx] = useState<number | null>(null);
  const { isDarkMode } = useDarkMode();
  
  const { messages, isProcessing, sendMessage, handleClearHistory } = useChat();

  const handleSend = async () => {
    const question = input.trim();
    if (!question) return;
    setInput("");
    await sendMessage(question);
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

  return (
    <div className={`flex flex-col justify-between min-h-[95vh] w-full mx-auto rounded-2xl shadow-2xl transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-[#171c23] text-white' 
        : 'bg-white text-gray-900'
    }`}>
      <TopBar 
        userName={USER_NAME}
        messageCount={messages.length}
        onClearHistory={handleClearHistory}
      />
      
      <MessageList
        messages={messages}
        isProcessing={isProcessing}
        ttsMessageIdx={ttsMessageIdx}
        onPlayMessage={handlePlayMessage}
      />
      
      <div className="px-0">
        <MessageInputRow
          value={input}
          onChange={setInput}
          onSend={handleSend}
          onSpeechResult={handleSpeechToTextResult}
        />
      </div>
      
      {isProcessing && (
        <div className="w-full flex justify-center py-3 text-blue-400 animate-pulse">
          <span>Ghost is executing your request...</span>
        </div>
      )}
      
      <BrandFooter />
    </div>
  );
};

export default Chatbot;
