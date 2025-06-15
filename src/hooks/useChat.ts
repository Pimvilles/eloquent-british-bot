
import { useState, useEffect } from "react";
import { connectZapierMCP } from "@/lib/zapierMCP";
import { loadConversation, saveConversation, clearConversation, saveChatToHistory } from "@/lib/memory";
import { Message } from "@/types/chat";
import { sendToWebhook, sendVoiceMessageToWebhook } from "@/services/webhookService";
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

  // New method for voice calls that returns the AI response directly
  const sendVoiceMessage = async (question: string): Promise<string | null> => {
    if (!question.trim()) return null;
    
    console.log("[Voice] Sending voice message:", question);
    
    // Try webhook first for voice messages
    const webhookResponse = await sendVoiceMessageToWebhook(question);
    
    if (webhookResponse) {
      console.log("[Voice] Got webhook response:", webhookResponse);
      return webhookResponse;
    }

    console.log("[Voice] No webhook response, falling back to default");
    return "I'm having trouble connecting to my voice processing system right now. Please try again in a moment.";
  };

  const sendMessage = async (question: string) => {
    if (!question.trim()) return;
    
    const userMessage = { text: question, sender: "user" as const, time: getNow() };
    setMessages((prev) => [...prev, userMessage]);
    
    setIsProcessing(true);

    let botMsg = "";
    let mcpFailed = false;
    
    setMessages((prev) => [
      ...prev,
      { text: "Melsi is thinking...", sender: "bot" as const, time: getNow() },
    ]);

    const removeThinking = () => {
      setMessages((prev) =>
        prev.filter((m) => m.text !== "Melsi is thinking...")
      );
    };

    // Try webhook first for user messages
    const webhookResponse = await sendToWebhook(question, "user");
    
    if (webhookResponse) {
      // If webhook returns a response, use it directly
      setIsProcessing(false);
      removeThinking();
      setMessages((prev) => [
        ...prev,
        { text: webhookResponse, sender: "bot" as const, time: getNow() },
      ]);
      // Don't send bot response back to webhook to avoid feedback loop
      return;
    }

    // Fallback to MCP if webhook doesn't return a response
    console.log("[Chat] Webhook didn't return response, trying MCP SSE...");
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
          } else if (mcpFailed) {
            // If MCP failed and we have no response, show fallback
            const fallbackResponse = "Sorry, I'm having trouble connecting to my tools right now. Please try again in a moment.";
            setMessages((prev) => [
              ...prev,
              { text: fallbackResponse, sender: "bot" as const, time: getNow() },
            ]);
          }
        } else if (data.message) {
          botMsg += data.message;
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
        } else if (data.message === "Sorry, there was a problem with the tool connection.") {
          mcpFailed = true;
        }
      }
    );
  };

  return {
    messages,
    isProcessing,
    sendMessage,
    sendVoiceMessage,
    handleClearHistory,
    handleNewChat,
    loadMessageContext,
  };
};
