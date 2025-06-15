
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX } from "lucide-react";
import { useSpeechToText, speakWithBrowser } from "@/lib/speech";
import { useChat } from "@/hooks/useChat";
import AvatarLogo from "./AvatarLogo";

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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStateIndicator = () => {
    switch (callState) {
      case "listening":
        return { text: "Listening...", color: "text-green-400" };
      case "processing":
        return { text: "Processing...", color: "text-blue-400" };
      case "speaking":
        return { text: "Speaking...", color: "text-purple-400" };
      default:
        return { text: "Ready", color: "text-gray-400" };
    }
  };

  const stateIndicator = getStateIndicator();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Voice Call with Ghost</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Avatar with state indication */}
          <div className="relative">
            <AvatarLogo size={120} />
            <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium ${stateIndicator.color} bg-gray-800 border border-gray-600`}>
              {stateIndicator.text}
            </div>
          </div>

          {/* Call Duration */}
          <div className="text-lg font-mono text-gray-300">
            {formatDuration(callDuration)}
          </div>

          {/* Current Transcript */}
          {currentTranscript && (
            <div className="w-full p-3 bg-gray-800 rounded-lg border">
              <p className="text-sm text-gray-300 text-center">
                "{currentTranscript}"
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Mute Button */}
            <Button
              variant={isMuted ? "destructive" : "outline"}
              size="icon"
              onClick={toggleMute}
              className="h-12 w-12 rounded-full"
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            {/* Push to Talk / Continuous Mode */}
            <Button
              variant="outline"
              onClick={toggleListeningMode}
              className="px-4 py-2 text-xs"
            >
              {isPushToTalk ? "Push to Talk" : "Continuous"}
            </Button>

            {/* End Call Button */}
            <Button
              variant="destructive"
              size="icon"
              onClick={handleEndCall}
              className="h-12 w-12 rounded-full"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>

          {/* Push to Talk Instructions */}
          {isPushToTalk && (
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Hold Space to speak</p>
              <Button
                variant="outline"
                size="lg"
                className="w-32 h-16"
                onMouseDown={handlePushToTalkStart}
                onMouseUp={handlePushToTalkEnd}
                onTouchStart={handlePushToTalkStart}
                onTouchEnd={handlePushToTalkEnd}
              >
                <Mic className="h-6 w-6" />
              </Button>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center text-xs text-gray-500 max-w-sm">
            {isPushToTalk 
              ? "Press and hold the microphone button or Space key to speak" 
              : "Speak naturally - Ghost will listen and respond automatically"
            }
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceCallModal;
