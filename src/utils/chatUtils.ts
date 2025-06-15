
import { Message } from "@/types/chat";

export function getNow() {
  const date = new Date();
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function getContext(messages: Message[]) {
  return messages
    .slice(-10)
    .map(
      (msg) =>
        `[${msg.sender === "user" ? "Mr Moloto" : "Melsi"}] ${msg.text}`
    )
    .join("\n");
}

export const createInitialMessage = (): Message => ({
  text: "Yebo Mr Moloto! Melsi here. Ready to execute. What's the next task?",
  sender: "bot",
  time: getNow(),
});
