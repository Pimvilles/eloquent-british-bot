
import React from "react";

interface AvatarLogoProps {
  size?: number;
  onClick?: () => void;
}

const AvatarLogo: React.FC<AvatarLogoProps> = ({ size = 56, onClick }) => {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="rounded-full border-4 border-blue-500 shadow-lg animate-blue-glow hover:border-blue-400 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        style={{ background: "#222d3b" }}
        title="Start Voice Call"
        aria-label="Start voice call"
      >
        <img
          src="/lovable-uploads/a18ab021-2b37-4e5c-97a3-00608fc26747.png"
          alt="AI Bot - Click for Voice Call"
          width={size}
          height={size}
          className="rounded-full object-cover"
        />
      </button>
    );
  }

  return (
    <img
      src="/lovable-uploads/a18ab021-2b37-4e5c-97a3-00608fc26747.png"
      alt="AI Bot"
      width={size}
      height={size}
      className="rounded-full object-cover border-4 border-blue-500 shadow-lg animate-blue-glow"
      style={{ background: "#222d3b" }}
    />
  );
};

export default AvatarLogo;
