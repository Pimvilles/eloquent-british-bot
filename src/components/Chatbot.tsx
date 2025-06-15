import React, { useRef, useState } from "react";
import ChatBubble from "./ChatBubble";
import MessageInputRow from "./MessageInputRow";
import AvatarLogo from "./AvatarLogo";
import BrandFooter from "./BrandFooter";
import { speakWithElevenLabs } from "@/lib/speech";
import { connectZapierMCP } from "@/lib/zapierMCP";
import { loadConversation, saveConversation, MemoryMessage } from "@/lib/memory";

const BOT_NAME = "Ghost";
const USER_NAME = "Mr Moloto";

// Zapier MCP SSE endpoint from user
const ZAPIER_MCP_SSE =
  "https://mcp.zapier.com/api/mcp/s/OTNjMDc2MmEtZGIzNC00N2YwLTkyYTQtM2U3NTViMTQ4ZDc3OjdmZmZkNmFkLWJhZTMtNDgzYy1iNDgxLTIyZDk1ZThhYzE2Nw==/sse";

// Ghost system prompt (given by user)
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
- General knowledge, facts, or witty remarks should be rare—only if they don’t distract from the task.
- Be concise and businesslike, but still polite and respectful.
- Only tease or joke if Mr Moloto invites it.
- Always address him as “Mr Moloto”.

Whenever a task is requested, quickly determine which tool is best and use it.

If a task cannot be performed with the available tools, briefly inform Mr Moloto and suggest a practical alternative.
`;

interface Message {
  text: string;
  sender: "user" | "bot";
  time: string;
}

const Chatbot = () => {
  // Message state and TTS
  const [messages, setMessages] = useState<Message[]>(() => loadConversation());
  const [input, setInput] = useState("");
  const [ttsMessageIdx, setTtsMessageIdx] = useState<number | null>(null);
  const [ttsApiKey, setTtsApiKey] = useState<string>("");
  const [isTTSModal, setIsTTSModal] = useState(false);
  // Tool/stream state
  const [isProcessing, setIsProcessing] = useState(false);

  // Save messages to memory each change
  React.useEffect(() => {
    saveConversation(messages);
  }, [messages]);

  // Handle user send
  async function sendMessage() {
    const question = input.trim();
    if (!question) return;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { text: question, sender: "user", time: getNow() },
    ]);
    setIsProcessing(true);

    // Run via Zapier MCP SSE streaming
    let botMsg = ""; // response will be streamed
    setMessages((prev) => [
      ...prev,
      { text: "Ghost is thinking...", sender: "bot", time: getNow() },
    ]);
    // Remove the loading message later
    const removeThinking = () => {
      setMessages((prev) =>
        prev.filter((m) => m.text !== "Ghost is thinking...")
      );
    };

    const disconnect = connectZapierMCP(
      ZAPIER_MCP_SSE,
      // system prompt + user message for context
      `[SYSTEM INSTRUCTIONS]\n${SYSTEM_PROMPT}\n\n[CHAT CONTEXT]\n${getContext(messages)}\n\n[REQUEST]\n${question}`,
      (data) => {
        if (data.isFinal) {
          setIsProcessing(false);
          removeThinking();
          if (botMsg.trim()) {
            setMessages((prev) => [
              ...prev,
              { text: botMsg.trim(), sender: "bot", time: getNow() },
            ]);
          }
        } else if (data.message) {
          // Stream content into the last bot message
          botMsg += data.message;
          setMessages((prev) => {
            // replace last message if still "Ghost is thinking..."
            if (
              prev.length > 0 &&
              prev[prev.length - 1].text === "Ghost is thinking..."
            ) {
              return [
                ...prev.slice(0, -1),
                { text: botMsg, sender: "bot", time: getNow() },
              ];
            }
            return prev;
          });
        }
      }
    );

    // Optional: cancel stream on unmount
    // (We'll keep code simple for now)
  }

  // Play message as speech
  async function handlePlayMessage(text: string, idx: number) {
    if (!ttsApiKey) {
      setIsTTSModal(true);
      return;
    }
    setTtsMessageIdx(idx);
    await speakWithElevenLabs({
      text,
      apiKey: ttsApiKey,
      onEnd: () => setTtsMessageIdx(null),
    });
  }

  function handleSpeechToTextResult(txt: string) {
    setInput(txt);
  }

  // Simple modal for TTS API Key
  function renderTTSModal() {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
        <div className="bg-[#232937] rounded-2xl px-10 py-7 text-center">
          <div className="text-lg text-white font-semibold mb-2">Enter your ElevenLabs API Key</div>
          <input
            className="mt-3 px-4 py-2 bg-[#181c20] rounded-lg w-full text-white border border-blue-600"
            type="password"
            value={ttsApiKey}
            onChange={e => setTtsApiKey(e.target.value)}
            placeholder="Paste API Key..."
          />
          <div className="flex gap-4 mt-5 mb-1 items-center justify-center">
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700"
              onClick={() => setIsTTSModal(false)}
              disabled={!ttsApiKey}
            >
              Save & Close
            </button>
            <button
              className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-800"
              onClick={() => setIsTTSModal(false)}
            >
              Cancel
            </button>
          </div>
          <div className="text-xs text-blue-400 pt-2">Get your key at <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="underline">ElevenLabs.io</a></div>
        </div>
      </div>
    );
  }

  // Scroll to latest
  const messageListRef = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (messageListRef.current)
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [messages.length, isProcessing]);

  return (
    <div className="flex flex-col justify-between min-h-[95vh] w-full bg-[#171c23] mx-auto rounded-2xl shadow-2xl">
      {/* Top Bar */}
      <div className="flex items-center border-b border-[#232938] px-8 py-6">
        <div className="flex-1">
          <h2 className="text-3xl font-extrabold text-blue-500 mb-0">
            Hello, {USER_NAME}
          </h2>
        </div>
        <div className="flex-shrink-0">
          <AvatarLogo size={68} />
        </div>
      </div>
      {/* Messages */}
      <div
        className="flex-1 w-full overflow-y-auto px-12 pt-6 pb-4"
        ref={messageListRef}
        style={{ minHeight: 340 }}
      >
        <div className="w-full max-w-5xl mx-auto">
          {messages.map((msg, i) => (
            <ChatBubble
              key={i}
              isBot={msg.sender === "bot"}
              text={msg.text}
              time={msg.time}
              playing={ttsMessageIdx === i}
              onPlay={
                msg.sender === "bot"
                  ? () => handlePlayMessage(msg.text, i)
                  : undefined
              }
            />
          ))}
        </div>
      </div>
      {/* Input Row */}
      <div className="px-0">
        <MessageInputRow
          value={input}
          onChange={setInput}
          onSend={sendMessage}
          onSpeechResult={handleSpeechToTextResult}
        />
      </div>
      {isProcessing && (
        <div className="w-full flex justify-center py-3 text-blue-400 animate-pulse">
          <span>Ghost is executing your request...</span>
        </div>
      )}
      <BrandFooter />
      {isTTSModal && renderTTSModal()}
    </div>
  );
};

function getNow() {
  const date = new Date();
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Returns last 10 exchanges for context
function getContext(messages: MemoryMessage[]) {
  return messages
    .slice(-10)
    .map(
      (msg) =>
        `[${msg.sender === "user" ? "Mr Moloto" : "Ghost"}] ${msg.text}`
    )
    .join("\n");
}

export default Chatbot;
