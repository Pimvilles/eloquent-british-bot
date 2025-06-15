
import React, { useRef, useState } from "react";
import { Mic } from "lucide-react";
import { useSpeechToText } from "@/lib/speech";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onSpeechResult: (txt: string) => void;
}

const MessageInputRow: React.FC<Props> = ({
  value,
  onChange,
  onSend,
  onSpeechResult,
}) => {
  const [listening, setListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { start, recognition } = useSpeechToText({
    onResult: (txt) => {
      setListening(false);
      onSpeechResult(txt);
    },
  });

  const startMic = () => {
    setListening(true);
    start();
  };

  return (
    <div className="flex items-center gap-3 w-full px-6 py-4 bg-[#1a1f29] rounded-b-2xl">
      <div className="flex-shrink-0 flex items-center justify-center h-11 w-11 rounded-lg bg-[#212635]">
        <span className="block w-6 text-gray-400">{/* Book icon if needed */}</span>
      </div>
      <input
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && value.trim()) {
            onSend();
          }
        }}
        placeholder="Enter a prompt here"
        className="flex-1 bg-[#232937] text-white px-4 py-3 rounded-xl border-none outline-none placeholder-gray-400 text-base"
        style={{ minHeight: 44, maxHeight: 80 }}
      />
      <button
        title="Mic"
        className={`h-11 w-11 flex items-center justify-center rounded-lg ${listening ? "bg-blue-700" : "bg-blue-600 hover:bg-blue-700"} transition text-white`}
        onClick={startMic}
        disabled={listening}
        type="button"
      >
        <Mic size={24} />
      </button>
      <button
        title="Send"
        className={`h-11 w-11 flex items-center justify-center rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 transition text-white`}
        onClick={() => {
          if (value.trim()) onSend();
        }}
        disabled={!value.trim()}
        type="button"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M3 20v-6l16-2-16-2V4l19 8-19 8Z" fill="currentColor"/>
        </svg>
      </button>
    </div>
  );
};

export default MessageInputRow;
