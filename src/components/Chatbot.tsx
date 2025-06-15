import React, { useRef, useState } from "react";
import ChatBubble from "./ChatBubble";
import MessageInputRow from "./MessageInputRow";
import AvatarLogo from "./AvatarLogo";
import BrandFooter from "./BrandFooter";
import { speakWithBrowser } from "@/lib/speech";
import { connectZapierMCP } from "@/lib/zapierMCP";
import { loadConversation, saveConversation, MemoryMessage, clearConversation } from "@/lib/memory";
import { Menu, Settings, Moon, Sun, History, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useDarkMode } from "@/hooks/useDarkMode";

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
- General knowledge, facts, or witty remarks should be rare—only if they don't distract from the task.
- Be concise and businesslike, but still polite and respectful.
- Only tease or joke if Mr Moloto invites it.
- Always address him as "Mr Moloto".

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
  // Tool/stream state
  const [isProcessing, setIsProcessing] = useState(false);
  // Dark mode
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Save messages to memory each change
  React.useEffect(() => {
    saveConversation(messages);
  }, [messages]);

  // Clear conversation history
  const handleClearHistory = () => {
    clearConversation();
    setMessages([{
      text: "Yebo Mr Moloto! Ghost here. Ready to execute. What's the next task?",
      sender: "bot",
      time: getNow(),
    }]);
  };

  // Handle user send
  async function sendMessage() {
    const question = input.trim();
    if (!question) return;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { text: question, sender: "user", time: getNow() },
    ]);
    
    // ---- LOCAL GREETING RESPONSE LOGIC ----
    // basic greetings (expand as needed)
    const greetings = [
      "hello",
      "hi",
      "hey",
      "howzit",
      "good morning",
      "good afternoon",
      "good evening",
      "yebo",
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
    // ---- END LOCAL GREETING LOGIC ----

    setIsProcessing(true);

    // Run via Zapier MCP SSE streaming
    let botMsg = ""; // response will be streamed
    setMessages((prev) => [
      ...prev,
      { text: "Ghost is thinking...", sender: "bot" as const, time: getNow() },
    ]);
    // Remove the loading message later
    const removeThinking = () => {
      setMessages((prev) =>
        prev.filter((m) => m.text !== "Ghost is thinking...")
      );
    };

    console.log("[Chatbot] Connecting to MCP SSE with prompt...");
    const disconnect = connectZapierMCP(
      ZAPIER_MCP_SSE,
      `[SYSTEM INSTRUCTIONS]\n${SYSTEM_PROMPT}\n\n[CHAT CONTEXT]\n${getContext(messages)}\n\n[REQUEST]\n${question}`,
      (data) => {
        console.log("[Chatbot] Received SSE data:", data);
        if (data.isFinal) {
          setIsProcessing(false);
          removeThinking();
          if (botMsg.trim()) {
            setMessages((prev) => [
              ...prev,
              { text: botMsg.trim(), sender: "bot" as const, time: getNow() },
            ]);
            console.log("[Chatbot] Added final bot reply:", botMsg.trim());
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
              const updated: Message[] = [
                ...prev.slice(0, -1),
                { text: botMsg, sender: "bot" as const, time: getNow() },
              ];
              console.log("[Chatbot] Streaming bot msg update:", botMsg);
              return updated;
            }
            return prev;
          });
        }
      }
    );
    // Optional: cancel stream on unmount
  }

  // Play message as speech
  function handlePlayMessage(text: string, idx: number) {
    setTtsMessageIdx(idx);
    speakWithBrowser({
      text,
      onStart: () => setTtsMessageIdx(idx),
      onEnd: () => setTtsMessageIdx(null),
    });
  }

  function handleSpeechToTextResult(txt: string) {
    setInput(txt);
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
      <div className="flex items-center justify-between border-b border-[#232938] px-8 py-6">
        {/* Hamburger Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-[#232938]">
              <Menu className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-[#232938] border-[#3b4251] text-white min-w-[200px]">
            <DropdownMenuItem className="hover:bg-[#3b4251] cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-[#3b4251]" />
            
            {/* Dark Mode Toggle */}
            <DropdownMenuItem className="hover:bg-[#3b4251] cursor-pointer flex items-center justify-between" onClick={toggleDarkMode}>
              <div className="flex items-center">
                {isDarkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </div>
              <Switch checked={isDarkMode} />
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-[#3b4251]" />
            
            {/* Conversation History */}
            <DropdownMenuItem className="hover:bg-[#3b4251] cursor-pointer" onClick={handleClearHistory}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear History
            </DropdownMenuItem>
            
            <DropdownMenuItem className="hover:bg-[#3b4251] cursor-pointer">
              <History className="mr-2 h-4 w-4" />
              History ({messages.length} messages)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Centered Greeting */}
        <div className="flex-1 flex justify-center">
          <h2 className="text-3xl font-extrabold text-blue-500 mb-0">
            Hello, {USER_NAME}
          </h2>
        </div>

        {/* Avatar */}
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
