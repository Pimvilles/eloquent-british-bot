
/**
 * Helpers for Speech-to-Text (Web Speech API) & Text-to-Speech (ElevenLabs)
 */
export function useSpeechToText({ onResult }: { onResult: (text: string) => void }) {
  let recognition: SpeechRecognition | null = null;
  if ("webkitSpeechRecognition" in window) {
    const w: any = window;
    recognition = new w.webkitSpeechRecognition();
  } else if ("SpeechRecognition" in window) {
    recognition = new (window as any).SpeechRecognition();
  }

  const start = () => {
    if (recognition) {
      recognition.continuous = false;
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) onResult(transcript);
      };
      recognition.onerror = () => {}; // Silently ignore
      recognition.start();
    }
  };

  return { start, recognition: !!recognition };
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
        "accept": "audio/mpeg",
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
