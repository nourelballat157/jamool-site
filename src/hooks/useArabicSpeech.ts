import { useCallback, useEffect, useRef, useState } from "react";

const FALLBACK_LANG = "ar-SA";

/**
 * Reusable Arabic text-to-speech hook built on the browser SpeechSynthesis API.
 * It picks an installed Arabic voice when available and speaks words clearly
 * for children (slightly slower rate, gentle pitch).
 */
export default function useArabicSpeech() {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const resolveVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      voiceRef.current =
        voices.find((voice) => voice.lang && voice.lang.toLowerCase().startsWith("ar")) ?? null;
    };

    resolveVoice();
    window.speechSynthesis.addEventListener("voiceschanged", resolveVoice);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", resolveVoice);
      window.speechSynthesis.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speakSequence = useCallback(
    (texts: string[]) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      const clean = texts.filter((text) => text && text.trim().length > 0);
      if (clean.length === 0) return;

      window.speechSynthesis.cancel();
      clean.forEach((text, index) => {
        const utterance = new SpeechSynthesisUtterance(text);
        if (voiceRef.current) utterance.voice = voiceRef.current;
        utterance.lang = voiceRef.current?.lang ?? FALLBACK_LANG;
        utterance.rate = 0.82;
        utterance.pitch = 1.05;
        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => {
          if (index === clean.length - 1) setSpeaking(false);
        };
        utterance.onerror = () => setSpeaking(false);
        window.speechSynthesis.speak(utterance);
      });
    },
    []
  );

  const speak = useCallback(
    (text: string) => {
      speakSequence([text]);
    },
    [speakSequence]
  );

  return { supported, speaking, speak, speakSequence, stop };
}