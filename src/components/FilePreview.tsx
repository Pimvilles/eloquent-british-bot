
import React from 'react';
import { X } from 'lucide-react';
import { ProcessedFile, formatFileSize, getFileIcon } from '@/lib/fileUtils';

interface FilePreviewProps {
  file: ProcessedFile;
  onRemove: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
  return (
    <div className="relative bg-[#232937] border border-[#2a2f3a] rounded-lg p-3 max-w-xs">
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs transition-colors"
        type="button"
      >
        <X size={12} />
      </button>
      
      {file.isImage ? (
        <div className="space-y-2">
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-24 object-cover rounded"
          />
          <div className="text-xs text-gray-300">
            <div className="truncate" title={file.name}>
              {file.name}
            </div>
            <div className="text-gray-400">
              {formatFileSize(file.size)}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getFileIcon(file)}</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-300 truncate" title={file.name}>
              {file.name}
            </div>
            <div className="text-xs text-gray-400">
              {formatFileSize(file.size)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilePreview;
