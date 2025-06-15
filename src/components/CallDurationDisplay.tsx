
import React from "react";

interface CallDurationDisplayProps {
  duration: number;
}

const CallDurationDisplay: React.FC<CallDurationDisplayProps> = ({ duration }) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-lg font-mono text-gray-300">
      {formatDuration(duration)}
    </div>
  );
};

export default CallDurationDisplay;
