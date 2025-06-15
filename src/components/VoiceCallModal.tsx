
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSpeechToText, speakWithBrowser } from "@/lib/speech";
import { useChat } from "@/hooks/useChat";
import VoiceCallStatus from "./VoiceCallStatus";
import VoiceCallControls from "./VoiceCallControls";
import CallDurationDisplay from "./CallDurationDisplay";

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CallState = "idle" | "listening" | "processing" | "speaking";

const VoiceCallModal: React.FC<VoiceCallModalProps> = ({ isOpen, onClose }) => {
  const [callState, setCallState] = useState<CallState>("idle");
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [isPushToTalk, setIsPushToTalk] = useState(false);
  
  const { sendMessage } = useChat();
  const speechTimeoutRef = useRef<NodeJS.Timeout>();
  const callStartTimeRef = useRef<number>();
  const durationIntervalRef = useRef<NodeJS.Timeout>();

  const { start: startListening, recognition } = useSpeechToText({
    onResult: (text: string) => {
      console.log("Speech recognized:", text);
      setCurrentTranscript(text);
      handleSpeechResult(text);
    },
  });

  useEffect(() => {
    if (isOpen) {
      callStartTimeRef.current = Date.now();
      setCallDuration(0);
      durationIntervalRef.current = setInterval(() => {
        if (callStartTimeRef.current) {
          setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000));
        }
      }, 1000);
      
      // Start with a greeting
      setCallState("speaking");
      speakWithBrowser({
        text: "Voice call connected! I'm Ghost, ready to assist you Mr Moloto. How can I help?",
        onStart: () => setCallState("speaking"),
        onEnd: () => {
          setCallState("idle");
          if (!isPushToTalk) {
            startContinuousListening();
          }
        },
      });
    } else {
      // Cleanup on close
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
      setCallState("idle");
      setIsListening(false);
      setCurrentTranscript("");
      setCallDuration(0);
      stopListening();
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    };
  }, [isOpen, isPushToTalk]);

  const startContinuousListening = () => {
    if (!isMuted && recognition) {
      setIsListening(true);
      setCallState("listening");
      startListening();
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (recognition) {
      recognition.stop();
    }
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }
  };

  const handleSpeechResult = async (text: string) => {
    if (!text.trim()) return;
    
    stopListening();
    setCallState("processing");
    
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Send message to AI and wait for response
      await sendMessage(text);
      
      // Get the latest bot response (this is simplified - in a real implementation 
      // you'd want to listen for the specific response to this message)
      setTimeout(() => {
        // This timeout allows the AI response to be processed
        const lastBotMessage = "Thank you for your message. I'm processing your request now.";
        
        setCallState("speaking");
        speakWithBrowser({
          text: lastBotMessage,
          onStart: () => setCallState("speaking"),
          onEnd: () => {
            setCallState("idle");
            setCurrentTranscript("");
            if (!isPushToTalk) {
              setTimeout(() => startContinuousListening(), 500);
            }
          },
        });
      }, 1000);
      
    } catch (error) {
      console.error("Error processing speech:", error);
      setCallState("idle");
      if (!isPushToTalk) {
        setTimeout(() => startContinuousListening(), 500);
      }
    }
  };

  const handleEndCall = () => {
    window.speechSynthesis.cancel();
    stopListening();
    onClose();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      stopListening();
    } else if (callState === "idle" && !isPushToTalk) {
      startContinuousListening();
    }
  };

  const toggleListeningMode = () => {
    setIsPushToTalk(!isPushToTalk);
    if (isPushToTalk) {
      // Switching to continuous mode
      if (callState === "idle" && !isMuted) {
        startContinuousListening();
      }
    } else {
      // Switching to push-to-talk mode
      stopListening();
    }
  };

  const handlePushToTalkStart = () => {
    if (isPushToTalk && !isMuted && callState === "idle") {
      startContinuousListening();
    }
  };

  const handlePushToTalkEnd = () => {
    if (isPushToTalk && isListening) {
      stopListening();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Voice Call with Ghost</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-4">
          <VoiceCallStatus 
            callState={callState}
            currentTranscript={currentTranscript}
          />

          <CallDurationDisplay duration={callDuration} />

          <VoiceCallControls
            isMuted={isMuted}
            isPushToTalk={isPushToTalk}
            onToggleMute={toggleMute}
            onToggleListeningMode={toggleListeningMode}
            onEndCall={handleEndCall}
            onPushToTalkStart={handlePushToTalkStart}
            onPushToTalkEnd={handlePushToTalkEnd}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceCallModal;
