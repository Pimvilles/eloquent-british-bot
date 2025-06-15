import React, { useRef, useState } from "react";
import { Mic, Files, X } from "lucide-react";
import { useSpeechToText } from "@/lib/speech";
import { validateFile, processFile, ProcessedFile } from "@/lib/fileUtils";
import FilePreview from "./FilePreview";
import { useToast } from "@/hooks/use-toast";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onSpeechResult: (txt: string) => void;
  onFilesSelected?: (files: ProcessedFile[]) => void;
}

const MessageInputRow: React.FC<Props> = ({
  value,
  onChange,
  onSend,
  onSpeechResult,
  onFilesSelected
}) => {
  const [listening, setListening] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<ProcessedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    toast
  } = useToast();
  const {
    start,
    recognition
  } = useSpeechToText({
    onResult: txt => {
      setListening(false);
      onSpeechResult(txt);
    }
  });
  const startMic = () => {
    setListening(true);
    start();
  };
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const newFiles: ProcessedFile[] = [];
    const errors: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateFile(file);
      if (validation.isValid) {
        try {
          const processedFile = await processFile(file);
          newFiles.push(processedFile);
        } catch (error) {
          console.error('Error processing file:', error);
          errors.push(`Failed to process ${file.name}`);
        }
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }
    if (newFiles.length > 0) {
      const updatedFiles = [...selectedFiles, ...newFiles];
      setSelectedFiles(updatedFiles);
      onFilesSelected?.(updatedFiles);
      toast({
        title: "Files uploaded",
        description: `${newFiles.length} file(s) successfully uploaded`
      });
    }
    if (errors.length > 0) {
      toast({
        title: "Upload errors",
        description: errors.join(', '),
        variant: "destructive"
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onFilesSelected?.(updatedFiles);

    // Clean up object URL to prevent memory leaks
    if (selectedFiles[index]) {
      URL.revokeObjectURL(selectedFiles[index].url);
    }
  };
  const handleSend = () => {
    if (value.trim() || selectedFiles.length > 0) {
      onSend();
      // Clear files after sending
      selectedFiles.forEach(file => URL.revokeObjectURL(file.url));
      setSelectedFiles([]);
    }
  };
  return (
    <div className="w-full">
      {/* File previews */}
      {selectedFiles.length > 0 && (
        <div className="px-4 py-3 bg-[#171c23] border-t border-[#2a2f3a]">
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <FilePreview key={index} file={file} onRemove={() => removeFile(index)} />
            ))}
          </div>
        </div>
      )}
      
      {/* Input row */}
      <div className="flex items-center gap-2 w-full bg-[#1a1f29] rounded-b-2xl py-[5px] px-4">
        {/* Files Upload Button */}
        <button 
          title="Upload files or take photo" 
          onClick={handleFileUpload} 
          type="button" 
          className="flex-shrink-0 h-11 w-11 flex items-center justify-center rounded-lg bg-[#212635] hover:bg-[#2a2f3a] transition text-white"
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
            if (e.key === "Enter" && (value.trim() || selectedFiles.length > 0)) {
              handleSend();
            }
          }} 
          placeholder="Enter a prompt here" 
          style={{
            minHeight: 44,
            maxHeight: 80
          }} 
          className="flex-1 min-w-0 bg-[#232937] text-white rounded-xl border-none outline-none placeholder-gray-400 text-base py-[11px] px-[11px]" 
        />
        
        <button 
          title="Mic" 
          className={`flex-shrink-0 h-11 w-11 flex items-center justify-center rounded-lg ${listening ? "bg-blue-700" : "bg-blue-600 hover:bg-blue-700"} transition text-white`} 
          onClick={startMic} 
          disabled={listening} 
          type="button"
        >
          <Mic size={20} />
        </button>
        
        <button 
          title="Send" 
          className="flex-shrink-0 h-11 w-11 flex items-center justify-center rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 transition text-white" 
          onClick={handleSend} 
          disabled={!value.trim() && selectedFiles.length === 0} 
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 20v-6l16-2-16-2V4l19 8-19 8Z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MessageInputRow;
