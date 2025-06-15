
import { useState, useCallback, useRef } from "react";
import { useChat } from "./useChat";

export const useVoiceCall = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const callStartTimeRef = useRef<number>();
  const durationIntervalRef = useRef<NodeJS.Timeout>();
  
  const { sendMessage } = useChat();

  const startCall = useCallback(() => {
    setIsCallActive(true);
    callStartTimeRef.current = Date.now();
    setCallDuration(0);
    
    durationIntervalRef.current = setInterval(() => {
      if (callStartTimeRef.current) {
        setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000));
      }
    }, 1000);
  }, []);

  const endCall = useCallback(() => {
    setIsCallActive(false);
    setCallDuration(0);
    
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    
    // Cancel any ongoing speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const sendVoiceMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;
    
    try {
      await sendMessage(`[Voice Call] ${message}`);
    } catch (error) {
      console.error("Error sending voice message:", error);
    }
  }, [sendMessage]);

  return {
    isCallActive,
    callDuration,
    startCall,
    endCall,
    sendVoiceMessage,
  };
};
