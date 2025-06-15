
import { useState, useEffect } from "react";
import { connectZapierMCP } from "@/lib/zapierMCP";
import { loadConversation, saveConversation, clearConversation } from "@/lib/memory";

interface Message {
  text: string;
  sender: "user" | "bot";
  time: string;
}

const ZAPIER_MCP_SSE =
  "https://mcp.zapier.com/api/mcp/s/OTNjMDc2MmEtZGIzNC00N2YwLTkyYTQtM2U3NTViMTQ4ZDc3OjdmZmZkNmFkLWJhZTMtNDgzYy1iNDgxLTIyZDk1ZThhYzE2Nw==/sse";

const SYSTEM_PROMPT = `You are Ghost—a sharp, witty, British-born, Mzansi-raised AI assistant. Your top priority is to complete tasks and deliver results efficiently for Mr Kwena Moloto, CEO of Kwena Moloto A.I Solutions in Johannesburg, South Africa.

You have full access to business and productivity tools via Zapier MCP. For any actionable request, you must immediately analyse which tool to use and call that tool to perform the task. Do not just describe what you could do—**always act and deliver real results**. Only ask for confirmation if absolutely necessary, and then act without further back-and-forth.

You have access to the following tools:

- Zapier MCP: Use this for business automation and connected task execution (Gmail, Calendar, Notion, etc.)
- Tavily Search: Use this to search the internet and retrieve real-time, up-to-date information.
- Google Gemini: Use this for advanced language processing or when deep thinking is needed.
- Calculator: Use for any math, finance, or formula tasks.
- Maps (Google Places): Use to look up businesses, places, contact info, and reviews.
- Web Crawler: Use this to extract full website content or scan site info.
- HTTP Request Tool: Use to call any public API.

Rules:
- Focus on executing tasks and returning actionable results, not on extended conversation.
- Ask questions only if absolutely necessary.
- General knowledge, facts, or witty remarks should be rare—only if they don't distract from the task.
- Be concise and businesslike, but still polite and respectful.
- Only tease or joke if Mr Moloto invites it.
- Always address him as "Mr Moloto".

Whenever a task is requested, quickly determine which tool is best and use it.

If a task cannot be performed with the available tools, briefly inform Mr Moloto and suggest a practical alternative.
`;

function getNow() {
  const date = new Date();
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getContext(messages: Message[]) {
  return messages
    .slice(-10)
    .map(
      (msg) =>
        `[${msg.sender === "user" ? "Mr Moloto" : "Ghost"}] ${msg.text}`
    )
    .join("\n");
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>(() => loadConversation());
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    saveConversation(messages);
  }, [messages]);

  const handleClearHistory = () => {
    clearConversation();
    setMessages([{
      text: "Yebo Mr Moloto! Ghost here. Ready to execute. What's the next task?",
      sender: "bot",
      time: getNow(),
    }]);
  };

  const loadMessageContext = (clickedMessage: Message, messageIndex: number) => {
    // Load conversation up to the clicked message
    const conversationUpToMessage = messages.slice(0, messageIndex + 1);
    setMessages(conversationUpToMessage);
    saveConversation(conversationUpToMessage);
  };

  const sendMessage = async (question: string) => {
    if (!question.trim()) return;
    
    setMessages((prev) => [
      ...prev,
      { text: question, sender: "user", time: getNow() },
    ]);
    
    // Handle greetings locally
    const greetings = [
      "hello", "hi", "hey", "howzit", "good morning", 
      "good afternoon", "good evening", "yebo",
    ];
    const cleaned = question.toLowerCase().replace(/[^a-z\s]/g, "");

    if (
      greetings.some((g) =>
        cleaned === g ||
        cleaned.startsWith(g + " ") ||
        cleaned.endsWith(" " + g) ||
        cleaned.includes(" " + g + " ")
      )
    ) {
      setIsProcessing(false);
      setMessages((prev) => [
        ...prev,
        {
          text: "Yebo Mr Moloto! Ghost here. Ready to execute. What's the next task?",
          sender: "bot" as const,
          time: getNow(),
        },
      ]);
      return;
    }

    setIsProcessing(true);

    let botMsg = "";
    setMessages((prev) => [
      ...prev,
      { text: "Ghost is thinking...", sender: "bot" as const, time: getNow() },
    ]);

    const removeThinking = () => {
      setMessages((prev) =>
        prev.filter((m) => m.text !== "Ghost is thinking...")
      );
    };

    console.log("[Chat] Connecting to MCP SSE with prompt...");
    connectZapierMCP(
      ZAPIER_MCP_SSE,
      `[SYSTEM INSTRUCTIONS]\n${SYSTEM_PROMPT}\n\n[CHAT CONTEXT]\n${getContext(messages)}\n\n[REQUEST]\n${question}`,
      (data) => {
        console.log("[Chat] Received SSE data:", data);
        if (data.isFinal) {
          setIsProcessing(false);
          removeThinking();
          if (botMsg.trim()) {
            setMessages((prev) => [
              ...prev,
              { text: botMsg.trim(), sender: "bot" as const, time: getNow() },
            ]);
            console.log("[Chat] Added final bot reply:", botMsg.trim());
          }
        } else if (data.message) {
          botMsg += data.message;
          setMessages((prev) => {
            if (
              prev.length > 0 &&
              prev[prev.length - 1].text === "Ghost is thinking..."
            ) {
              const updated: Message[] = [
                ...prev.slice(0, -1),
                { text: botMsg, sender: "bot" as const, time: getNow() },
              ];
              console.log("[Chat] Streaming bot msg update:", botMsg);
              return updated;
            }
            return prev;
          });
        }
      }
    );
  };

  return {
    messages,
    isProcessing,
    sendMessage,
    handleClearHistory,
    loadMessageContext,
  };
};
