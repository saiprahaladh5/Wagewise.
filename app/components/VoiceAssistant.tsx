"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

type VoiceMessage = {
  role: "user" | "assistant" | "system";
  text: string;
};

type Props = {
  onTextFinal: (text: string) => void;
  onAskAI?: (question: string) => Promise<string>;
};

type VoiceStatus = "idle" | "listening" | "processing" | "speaking" | "no-support" | "error";

export default function VoiceAssistant({ onTextFinal, onAskAI }: Props) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const wakePhrases = [
    "hey money buddy",
    "hey moneybuddy",
    "hey wagewise",
    "hey wage wise",
  ];

  const scrollToBottom = useCallback(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, []);

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!synthRef.current) { resolve(); return; }
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = synthRef.current.getVoices();
      const preferred = voices.find(
        (v) => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Microsoft") || v.name.includes("Natural"))
      ) ?? voices.find((v) => v.lang.startsWith("en")) ?? voices[0];
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setStatus("speaking");
      utterance.onend = () => { setStatus("idle"); resolve(); };
      utterance.onerror = () => { setStatus("idle"); resolve(); };

      synthRef.current.speak(utterance);
    });
  }, []);

  const isAIQuestion = useCallback((text: string): boolean => {
    const lower = text.toLowerCase();
    const questionWords = ["how", "what", "why", "when", "where", "should", "can", "do", "am i", "is my", "tell me", "analyze", "analyse", "help", "advice", "suggest", "review", "check", "track"];
    return questionWords.some((w) => lower.includes(w));
  }, []);

  const hasTransactionIntent = useCallback((text: string): boolean => {
    const lower = text.toLowerCase();
    const amountMatch = lower.match(/(\d[\d,]*(?:\.\d+)?)/);
    const actionWords = ["add", "spent", "paid", "received", "got", "earned", "bought", "delete", "remove"];
    return !!amountMatch && actionWords.some((w) => lower.includes(w));
  }, []);

  const handleFinalTranscript = useCallback(async (spoken: string) => {
    const lower = spoken.toLowerCase();

    let command = spoken;
    for (const wake of wakePhrases) {
      const idx = lower.indexOf(wake);
      if (idx !== -1) {
        command = spoken.slice(idx + wake.length).trim();
        break;
      }
    }

    if (!command) {
      const msg = "I heard the wake phrase but didn't catch a command. Try again.";
      setMessages((prev) => [...prev, { role: "system", text: msg }]);
      await speak(msg);
      return;
    }

    setMessages((prev) => [...prev, { role: "user", text: command }]);
    scrollToBottom();

    if (hasTransactionIntent(command)) {
      onTextFinal(command);
      const confirmMsg = "Done. I've processed that transaction for you.";
      setMessages((prev) => [...prev, { role: "assistant", text: confirmMsg }]);
      scrollToBottom();
      await speak(confirmMsg);
    } else if (isAIQuestion(command) && onAskAI) {
      setStatus("processing");
      setMessages((prev) => [...prev, { role: "system", text: "Thinking..." }]);
      scrollToBottom();

      try {
        const aiResponse = await onAskAI(command);
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.text !== "Thinking...");
          return [...filtered, { role: "assistant", text: aiResponse }];
        });
        scrollToBottom();
        await speak(aiResponse);
      } catch {
        const errMsg = "Sorry, I couldn't get a response. Try again.";
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.text !== "Thinking...");
          return [...filtered, { role: "system", text: errMsg }];
        });
        await speak(errMsg);
      }
    } else {
      onTextFinal(command);
      const fallbackMsg = "Got it. I've processed your command.";
      setMessages((prev) => [...prev, { role: "assistant", text: fallbackMsg }]);
      scrollToBottom();
      await speak(fallbackMsg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onTextFinal, onAskAI, speak, scrollToBottom, hasTransactionIntent, isAIQuestion]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    synthRef.current = window.speechSynthesis;

    const SpeechRecognitionImpl =
      (window as Window & { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognitionImpl) {
      setStatus("no-support");
      return;
    }

    const rec: SpeechRecognition = new SpeechRecognitionImpl();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onstart = () => {
      isListeningRef.current = true;
      setStatus("listening");
      setErrorMsg(null);
      setLiveTranscript("");
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "aborted") {
        setErrorMsg(event.error || "Speech error");
        setStatus("error");
      }
      isListeningRef.current = false;
    };

    rec.onend = () => {
      isListeningRef.current = false;
      setStatus((prev) => prev === "listening" ? "idle" : prev);
      setLiveTranscript("");
      cancelAnimationFrame(animFrameRef.current);
      setVolume(0);
    };

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let fullTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
      }

      const cleaned = fullTranscript.trim();
      if (!cleaned) return;
      setLiveTranscript(cleaned);

      const lastResult = event.results[event.results.length - 1];
      if (!lastResult.isFinal) return;

      setLiveTranscript("");
      handleFinalTranscript(cleaned);
    };

    recognitionRef.current = rec;

    return () => {
      rec.onresult = null;
      rec.onend = null;
      rec.onerror = null;
      if (isListeningRef.current) rec.stop();
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [handleFinalTranscript]);

  const startAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setVolume(avg / 255);
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      /* mic permission denied or not available */
    }
  };

  const toggleListening = () => {
    if (status === "no-support" || status === "processing" || status === "speaking") return;

    if (synthRef.current) synthRef.current.cancel();

    const rec = recognitionRef.current;
    if (!rec) return;

    if (!isListeningRef.current) {
      try {
        rec.start();
        startAudioVisualization();
      } catch (err) {
        console.error("Error starting recognition:", err);
        setErrorMsg("Could not start microphone.");
        setStatus("error");
      }
    } else {
      rec.stop();
      isListeningRef.current = false;
      setStatus("idle");
      cancelAnimationFrame(animFrameRef.current);
      setVolume(0);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setLiveTranscript("");
    setErrorMsg(null);
  };

  const micScale = 1 + volume * 0.3;
  const ringScale = 1 + volume * 0.6;

  const statusLabel =
    status === "no-support" ? "Voice not supported in this browser"
    : status === "listening" ? "Listening... speak now"
    : status === "processing" ? "Thinking..."
    : status === "speaking" ? "Speaking..."
    : status === "error" ? "Error - tap to try again"
    : "Tap the microphone to start";

  return (
    <div className="space-y-4">
      {/* Chat history */}
      {messages.length > 0 && (
        <div className="max-h-60 space-y-2.5 overflow-y-auto rounded-xl bg-[#0b1120] p-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                  : msg.role === "assistant"
                  ? "border border-white/[0.06] bg-[#0f1629] text-slate-300"
                  : "bg-white/[0.03] text-slate-500 italic"
              }`}>
                {msg.role === "assistant" && (
                  <div className="mb-1 flex items-center gap-1">
                    <span className="flex h-4 w-4 items-center justify-center rounded bg-violet-500/20 text-[8px] font-bold text-violet-400">W</span>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-violet-400">WageWise</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          ))}
          {status === "processing" && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-white/[0.06] bg-[#0f1629] px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      )}

      {/* Live transcript */}
      {liveTranscript && (
        <div className="rounded-xl bg-violet-500/10 px-4 py-2.5 text-xs text-violet-300">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
          {liveTranscript}
        </div>
      )}

      {/* Mic button with visual rings */}
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="relative flex items-center justify-center">
          {status === "listening" && (
            <>
              <span className="absolute h-20 w-20 animate-ping rounded-full bg-violet-500/10" style={{ transform: `scale(${ringScale})` }} />
              <span className="absolute h-24 w-24 rounded-full bg-violet-500/5" style={{ transform: `scale(${ringScale * 1.1})` }} />
            </>
          )}
          {status === "speaking" && (
            <span className="absolute h-20 w-20 animate-pulse rounded-full bg-cyan-500/10" />
          )}
          <button
            type="button"
            onClick={toggleListening}
            disabled={status === "no-support" || status === "processing"}
            style={{ transform: `scale(${status === "listening" ? micScale : 1})` }}
            className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full transition-all duration-150 ${
              status === "listening"
                ? "bg-violet-500 shadow-xl shadow-violet-500/40"
                : status === "speaking"
                ? "bg-cyan-500 shadow-xl shadow-cyan-500/40"
                : status === "processing"
                ? "bg-amber-500/20 cursor-wait"
                : "bg-violet-500/20 hover:bg-violet-500/30 active:scale-95"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {status === "processing" ? (
              <svg className="h-6 w-6 animate-spin text-amber-400" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            ) : status === "speaking" ? (
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            ) : (
              <svg className={`h-7 w-7 ${status === "listening" ? "text-white" : "text-violet-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-500">{statusLabel}</p>

        {/* Volume bar */}
        {status === "listening" && (
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-violet-400 transition-all duration-75"
                style={{ height: `${Math.max(4, volume * 28 * (1 + Math.sin(i * 0.8) * 0.5))}px`, opacity: volume > i * 0.08 ? 1 : 0.2 }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-center gap-3">
        {messages.length > 0 && (
          <button onClick={clearChat} className="rounded-lg border border-white/[0.06] px-3 py-1.5 text-[11px] text-slate-500 transition-all hover:border-white/10 hover:text-slate-400">
            Clear chat
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-400">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
