
export interface Message {
  text: string;
  sender: "user" | "bot";
  time: string;
}

export interface ChatState {
  messages: Message[];
  isProcessing: boolean;
}
