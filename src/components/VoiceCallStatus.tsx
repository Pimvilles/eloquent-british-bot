
import React from "react";
import AvatarLogo from "./AvatarLogo";

type CallState = "idle" | "listening" | "processing" | "speaking";

interface VoiceCallStatusProps {
  callState: CallState;
  currentTranscript: string;
}

const VoiceCallStatus: React.FC<VoiceCallStatusProps> = ({ callState, currentTranscript }) => {
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
    <>
      {/* Avatar with state indication */}
      <div className="relative">
        <AvatarLogo size={120} />
        <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium ${stateIndicator.color} bg-gray-800 border border-gray-600`}>
          {stateIndicator.text}
        </div>
      </div>

      {/* Current Transcript */}
      {currentTranscript && (
        <div className="w-full p-3 bg-gray-800 rounded-lg border">
          <p className="text-sm text-gray-300 text-center">
            "{currentTranscript}"
          </p>
        </div>
      )}
    </>
  );
};

export default VoiceCallStatus;
