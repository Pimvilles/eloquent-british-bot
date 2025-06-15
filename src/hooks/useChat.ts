
import { useState, useEffect } from "react";
import { connectZapierMCP } from "@/lib/zapierMCP";
import { loadConversation, saveConversation, clearConversation, saveChatToHistory } from "@/lib/memory";
import { Message } from "@/types/chat";
import { sendToWebhook } from "@/services/webhookService";
import { getNow, getContext, createInitialMessage } from "@/utils/chatUtils";
import { SYSTEM_PROMPT, ZAPIER_MCP_SSE } from "@/config/systemPrompt";

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>(() => loadConversation());
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    saveConversation(messages);
  }, [messages]);

  const handleClearHistory = () => {
    clearConversation();
    setMessages([createInitialMessage()]);
  };

  const handleNewChat = () => {
    // Save current conversation to history if it has meaningful content
    if (messages.length > 1) {
      saveChatToHistory(messages);
    }
    
    // Clear current conversation and start fresh
    clearConversation();
    setMessages([createInitialMessage()]);
  };

  const loadMessageContext = (clickedMessage: Message, messageIndex: number) => {
    // Load conversation up to the clicked message
    const conversationUpToMessage = messages.slice(0, messageIndex + 1);
    setMessages(conversationUpToMessage);
    saveConversation(conversationUpToMessage);
  };

  const sendMessage = async (question: string) => {
    if (!question.trim()) return;
    
    const userMessage = { text: question, sender: "user" as const, time: getNow() };
    setMessages((prev) => [...prev, userMessage]);
    
    // Send user message to webhook
    await sendToWebhook(question, "user");

    setIsProcessing(true);

    let botMsg = "";
    setMessages((prev) => [
      ...prev,
      { text: "Melsi is thinking...", sender: "bot" as const, time: getNow() },
    ]);

    const removeThinking = () => {
      setMessages((prev) =>
        prev.filter((m) => m.text !== "Melsi is thinking...")
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
            const finalResponse = botMsg.trim();
            setMessages((prev) => [
              ...prev,
              { text: finalResponse, sender: "bot" as const, time: getNow() },
            ]);
            console.log("[Chat] Added final bot reply:", finalResponse);
            // Send final bot response to webhook
            sendToWebhook(finalResponse, "bot");
          }
        } else if (data.message) {
          botMsg += data.message;
          // Faster message updates - reduced throttling
          setMessages((prev) => {
            if (
              prev.length > 0 &&
              prev[prev.length - 1].text === "Melsi is thinking..."
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
    handleNewChat,
    loadMessageContext,
  };
};
