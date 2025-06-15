
/**
 * Simple conversation memory using localStorage
 * Stores/retrieves entire array of { text, sender, time } objects
 */

const STORAGE_KEY = "ghost_conversation_v1";
const HISTORY_KEY = "ghost_chat_history_v1";

export interface MemoryMessage {
  text: string;
  sender: "user" | "bot";
  time: string;
}

export interface ChatHistoryItem {
  id: string;
  messages: MemoryMessage[];
  timestamp: string;
  title: string;
}

// Save entire messages array
export function saveConversation(messages: MemoryMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {}
}

// Get messages or default (array with Ghost intro message)
export function loadConversation(): MemoryMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Default intro
  return [
    {
      text: `Yebo Mr Moloto! Ghost here. Ready to execute. What's the next task?`,
      sender: "bot",
      time: getNow(),
    },
  ];
}

// Clear conversation history
export function clearConversation() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// Save current chat to history
export function saveChatToHistory(messages: MemoryMessage[]) {
  try {
    const history = loadChatHistory();
    const firstUserMessage = messages.find(msg => msg.sender === "user");
    const title = firstUserMessage 
      ? firstUserMessage.text.substring(0, 50) + (firstUserMessage.text.length > 50 ? "..." : "")
      : "New Chat";
    
    const chatItem: ChatHistoryItem = {
      id: Date.now().toString(),
      messages,
      timestamp: new Date().toISOString(),
      title,
    };
    
    const updatedHistory = [chatItem, ...history].slice(0, 50); // Keep last 50 chats
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch {}
}

// Load chat history
export function loadChatHistory(): ChatHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

// Clear all chat history
export function clearChatHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {}
}

function getNow() {
  const date = new Date();
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
