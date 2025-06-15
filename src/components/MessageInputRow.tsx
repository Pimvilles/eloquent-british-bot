
import React, { useRef, useState } from "react";
import { Mic, Files } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      console.log("File selected:", file.name, file.type);
      
      // For now, just show an alert. In the future, this would handle file upload
      alert(`File selected: ${file.name}\nType: ${file.type}\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    }
  };

  return (
    <div className="flex items-center gap-3 w-full px-6 py-4 bg-[#1a1f29] rounded-b-2xl">
      {/* Files Upload Button */}
      <button
        title="Upload files or take photo"
        className="flex-shrink-0 h-11 w-11 flex items-center justify-center rounded-lg bg-[#212635] hover:bg-[#2a2f3a] transition text-gray-400 hover:text-gray-300"
        onClick={handleFileUpload}
        type="button"
      >
        <Files size={20} />
      </button>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.csv,.json"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        multiple
      />

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
