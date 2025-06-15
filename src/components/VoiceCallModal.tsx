
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
  
  const { sendVoiceMessage } = useChat();
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
        text: "Voice call connected! I'm Melsi, ready to assist you Mr Moloto. How can I help?",
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
      
      console.log("[Voice] Processing speech:", text);
      
      // Send message to webhook and get AI response
      const aiResponse = await sendVoiceMessage(text);
      
      if (aiResponse) {
        console.log("[Voice] Got AI response:", aiResponse);
        setCallState("speaking");
        speakWithBrowser({
          text: aiResponse,
          onStart: () => setCallState("speaking"),
          onEnd: () => {
            setCallState("idle");
            setCurrentTranscript("");
            if (!isPushToTalk) {
              setTimeout(() => startContinuousListening(), 500);
            }
          },
        });
      } else {
        console.log("[Voice] No AI response received");
        const fallbackResponse = "I'm sorry, I didn't catch that. Could you please repeat?";
        setCallState("speaking");
        speakWithBrowser({
          text: fallbackResponse,
          onStart: () => setCallState("speaking"),
          onEnd: () => {
            setCallState("idle");
            setCurrentTranscript("");
            if (!isPushToTalk) {
              setTimeout(() => startContinuousListening(), 500);
            }
          },
        });
      }
      
    } catch (error) {
      console.error("Error processing speech:", error);
      const errorResponse = "I'm having trouble processing your request. Please try again.";
      setCallState("speaking");
      speakWithBrowser({
        text: errorResponse,
        onStart: () => setCallState("speaking"),
        onEnd: () => {
          setCallState("idle");
          setCurrentTranscript("");
          if (!isPushToTalk) {
            setTimeout(() => startContinuousListening(), 500);
          }
        },
      });
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
          <DialogTitle className="text-center">Voice Call with Melsi</DialogTitle>
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
