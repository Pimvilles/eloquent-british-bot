
import React, { useRef, useState } from "react";
import ChatBubble from "./ChatBubble";
import MessageInputRow from "./MessageInputRow";
import AvatarLogo from "./AvatarLogo";
import BrandFooter from "./BrandFooter";
import { speakWithElevenLabs } from "@/lib/speech";

const BOT_NAME = "Jarvus";
const USER_NAME = "Mr Moloto";

interface Message {
  text: string;
  sender: "user" | "bot";
  time: string;
}

const WEBHOOK_URL = "http://localhost:5678/webhook-test/3588d4a3-11a8-4a88-9e4b-5142113c5d06";

const Chatbot = () => {
  // Store chat messages
  const [messages, setMessages] = useState<Message[]>([
    {
      text: `Yebo Mr Moloto! Jarvus here, ready to assist you today, Boss! What can I help you with?`,
      sender: "bot",
      time: getNow(),
    },
  ]);
  const [input, setInput] = useState("");
  // TTS
  const [ttsMessageIdx, setTtsMessageIdx] = useState<number | null>(null);
  const [ttsApiKey, setTtsApiKey] = useState<string>("");
  const [isTTSModal, setIsTTSModal] = useState(false);

  // Handle user send
  async function sendMessage() {
    const question = input.trim();
    if (!question) return;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { text: question, sender: "user", time: getNow() },
    ]);
    // Optimistic UI - then fetch
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: question }),
      });
      const data = await res.json();
      if (data?.response) {
        setMessages((prev) => [
          ...prev,
          { text: data.response, sender: "bot", time: getNow() },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { text: "Sorry, there was an error with the bot response.", sender: "bot", time: getNow() },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { text: "Sorry, failed to contact the AI server.", sender: "bot", time: getNow() },
      ]);
    }
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
  }, [messages.length]);

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
      <BrandFooter />
      {isTTSModal && renderTTSModal()}
    </div>
  );
};

function getNow() {
  const date = new Date();
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default Chatbot;
