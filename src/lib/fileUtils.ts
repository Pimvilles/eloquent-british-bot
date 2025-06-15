
// File size limits (in bytes)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Allowed file types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_DOCUMENT_TYPES = ['.pdf', '.doc', '.docx', '.txt', '.csv', '.json'];
export const ALLOWED_MEDIA_TYPES = ['video/mp4', 'video/webm', 'audio/mp3', 'audio/wav', 'audio/ogg'];

export interface ProcessedFile {
  name: string;
  type: string;
  size: number;
  url: string;
  isImage: boolean;
  isDocument: boolean;
  isMedia: boolean;
}

export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` };
  }

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isDocument = ALLOWED_DOCUMENT_TYPES.some(ext => file.name.toLowerCase().endsWith(ext));
  const isMedia = ALLOWED_MEDIA_TYPES.includes(file.type);

  if (!isImage && !isDocument && !isMedia) {
    return { isValid: false, error: 'File type not supported' };
  }

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return { isValid: false, error: `Image size exceeds ${MAX_IMAGE_SIZE / 1024 / 1024}MB limit` };
  }

  return { isValid: true };
};

export const processFile = async (file: File): Promise<ProcessedFile> => {
  const url = URL.createObjectURL(file);
  
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    url,
    isImage: ALLOWED_IMAGE_TYPES.includes(file.type),
    isDocument: ALLOWED_DOCUMENT_TYPES.some(ext => file.name.toLowerCase().endsWith(ext)),
    isMedia: ALLOWED_MEDIA_TYPES.includes(file.type)
  };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (file: ProcessedFile): string => {
  if (file.isImage) return '🖼️';
  if (file.isMedia) return file.type.startsWith('video/') ? '🎥' : '🎵';
  if (file.name.endsWith('.pdf')) return '📄';
  if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) return '📝';
  if (file.name.endsWith('.csv')) return '📊';
  if (file.name.endsWith('.json')) return '📋';
  return '📁';
};
