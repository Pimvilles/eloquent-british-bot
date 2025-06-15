/**
 * Helpers for Speech-to-Text (Web Speech API) & Text-to-Speech (ElevenLabs)
 */

// Speech-to-Text Hook (Web Speech API)
export function useSpeechToText({
  onResult,
}: {
  onResult: (text: string) => void;
}) {
  // Cross-browser: get the correct SpeechRecognition constructor
  const SpeechRecognitionConstructor =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  let recognition: any = null;
  if (SpeechRecognitionConstructor) {
    recognition = new SpeechRecognitionConstructor();
  }

  const start = () => {
    if (recognition) {
      recognition.continuous = false;
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) onResult(transcript);
      };
      recognition.onerror = () => {}; // Silently ignore
      recognition.start();
    }
  };

  return { start, recognition };
}

// TTS using Web Speech API (Browser-native and free)
export function speakWithBrowser({
  text,
  onStart,
  onEnd,
}: {
  text: string;
  onStart?: () => void;
  onEnd?: () => void;
}) {
  if (!('speechSynthesis' in window)) {
    console.error("Browser does not support speech synthesis.");
    alert("Sorry, your browser doesn't support text-to-speech.");
    onEnd?.();
    return;
  }

  // Cancel any previous speech to prevent overlap
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  // Try to find a British voice to match the bot's persona
  const setVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const britishVoice = voices.find(voice => voice.lang === 'en-GB');
    if (britishVoice) {
      utterance.voice = britishVoice;
    }
  };

  // Voices might load asynchronously
  if (window.speechSynthesis.getVoices().length > 0) {
    setVoice();
  } else {
    window.speechSynthesis.onvoiceschanged = setVoice;
  }

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = (event) => {
    console.error("SpeechSynthesisUtterance.onerror", event);
    onEnd?.(); // Ensure state is reset on error
  };

  window.speechSynthesis.speak(utterance);
}

// TTS using ElevenLabs API
export async function speakWithElevenLabs({
  text,
  apiKey,
  onStart,
  onEnd,
}: {
  text: string;
  apiKey: string;
  onStart?: () => void;
  onEnd?: () => void;
}) {
  // Aria (British Male), default model
  const voiceId = "onwK4e9ZLuTAKqWW03F9"; // Daniel is a Male British voice
  const modelId = "eleven_multilingual_v2";

  onStart?.();

  // Make ElevenLabs TTS API call
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: { stability: 0.4, similarity_boost: 0.8 },
      }),
    }
  );

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.onended = () => {
    onEnd?.();
    URL.revokeObjectURL(url);
  };
  audio.play();
}
