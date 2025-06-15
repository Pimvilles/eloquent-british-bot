
import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff } from "lucide-react";

interface VoiceCallControlsProps {
  isMuted: boolean;
  isPushToTalk: boolean;
  onToggleMute: () => void;
  onToggleListeningMode: () => void;
  onEndCall: () => void;
  onPushToTalkStart: () => void;
  onPushToTalkEnd: () => void;
}

const VoiceCallControls: React.FC<VoiceCallControlsProps> = ({
  isMuted,
  isPushToTalk,
  onToggleMute,
  onToggleListeningMode,
  onEndCall,
  onPushToTalkStart,
  onPushToTalkEnd,
}) => {
  return (
    <>
      {/* Controls */}
      <div className="flex items-center space-x-4">
        {/* Mute Button */}
        <Button
          variant={isMuted ? "destructive" : "outline"}
          size="icon"
          onClick={onToggleMute}
          className="h-12 w-12 rounded-full"
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>

        {/* Push to Talk / Continuous Mode */}
        <Button
          variant="outline"
          onClick={onToggleListeningMode}
          className="px-4 py-2 text-xs"
        >
          {isPushToTalk ? "Push to Talk" : "Continuous"}
        </Button>

        {/* End Call Button */}
        <Button
          variant="destructive"
          size="icon"
          onClick={onEndCall}
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
            onMouseDown={onPushToTalkStart}
            onMouseUp={onPushToTalkEnd}
            onTouchStart={onPushToTalkStart}
            onTouchEnd={onPushToTalkEnd}
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
    </>
  );
};

export default VoiceCallControls;
