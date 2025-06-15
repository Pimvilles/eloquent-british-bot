
/**
 * Simple conversation memory using localStorage
 * Stores/retrieves entire array of { text, sender, time } objects
 */

const STORAGE_KEY = "ghost_conversation_v1";

export interface MemoryMessage {
  text: string;
  sender: "user" | "bot";
  time: string;
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

function getNow() {
  const date = new Date();
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
