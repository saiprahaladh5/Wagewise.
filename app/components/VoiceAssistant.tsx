"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  onTextFinal: (text: string) => void;
};

type RecognitionStatus = "idle" | "listening" | "no-support" | "error";

export default function VoiceAssistant({ onTextFinal }: Props) {
  const [status, setStatus] = useState<RecognitionStatus>("idle");
  const [lastHeard, setLastHeard] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);

  // Allowed wake phrases
  const wakePhrases = [
    "hey money buddy",
    "hey moneybuddy",
    "hey siri",
    "hey google",
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionImpl =
      (window as Window & { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognitionImpl) {
      setStatus("no-support");
      return;
    }

    const rec: SpeechRecognition = new SpeechRecognitionImpl();
    rec.lang = "en-US";
    rec.continuous = true; // keep listening until we manually stop
    rec.interimResults = true;

    rec.onstart = () => {
      isListeningRef.current = true;
      setStatus("listening");
      setErrorMsg(null);
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setErrorMsg(event.error || "Speech error");
      setStatus("error");
      isListeningRef.current = false;
    };

    rec.onend = () => {
      // Browser can auto-stop; we reflect that in UI
      isListeningRef.current = false;
      if (status !== "no-support") {
        setStatus("idle");
      }
    };

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let fullTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
      }

      const cleaned = fullTranscript.trim();
      if (!cleaned) return;

      setLastHeard(cleaned);

      // Only act when we get final results
      const lastResult = event.results[event.results.length - 1];
      if (!lastResult.isFinal) return;

      handleFinalTranscript(cleaned);
    };

    recognitionRef.current = rec;

    return () => {
      rec.onresult = null;
      rec.onend = null;
      rec.onerror = null;
      if (isListeningRef.current) {
        rec.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Extract command after wake phrase and send to parent
  const handleFinalTranscript = (spoken: string) => {
    const lower = spoken.toLowerCase();

    let command = spoken; // default: whole thing
    for (const wake of wakePhrases) {
      const idx = lower.indexOf(wake);
      if (idx !== -1) {
        command = spoken.slice(idx + wake.length).trim();
        break;
      }
    }

    // If user said only the wake phrase and nothing else, don't send
    if (!command) {
      console.log("Wake phrase detected but no command.");
      return;
    }

    console.log("Wake/voice command:", command);
    onTextFinal(command);
  };

  const toggleListening = () => {
    if (status === "no-support") return;

    const rec = recognitionRef.current;
    if (!rec) return;

    if (!isListeningRef.current) {
      try {
        rec.start();
      } catch (err) {
        console.error("Error starting recognition:", err);
        setErrorMsg("Could not start microphone.");
        setStatus("error");
      }
    } else {
      rec.stop();
      isListeningRef.current = false;
      setStatus("idle");
    }
  };

  const buttonLabel =
    status === "listening" ? "Stop" : status === "no-support" ? "No mic" : "Start";

  return (
    <div className="rounded-2xl bg-slate-900/70 p-4 text-sm">
      <h3 className="text-sm font-semibold mb-1">Voice Assistant</h3>
      <p className="text-xs text-slate-400 mb-2">
        Tap <span className="font-semibold">Start</span>, then say things like:{" "}
        <span className="italic">
          &quot;Hey MoneyBuddy, add 5,000 to income&quot; or &quot;Hey Google,
          add 25 dollars for food&quot;
        </span>
        . (Works while this page is open.)
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleListening}
          disabled={status === "no-support"}
          className={`rounded-lg px-4 py-2 text-xs font-semibold ${
            status === "listening"
              ? "bg-rose-500 text-slate-900 hover:bg-rose-400"
              : "bg-emerald-500 text-slate-900 hover:bg-emerald-400"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {buttonLabel}
        </button>

        <span className="text-xs text-slate-400">
          Status:{" "}
          {status === "no-support"
            ? "Voice not supported in this browser"
            : status === "listening"
            ? "Listening… say a wake phrase"
            : status === "error"
            ? "Error – try again"
            : "Idle"}
        </span>
      </div>

      {lastHeard && (
        <p className="mt-2 text-xs text-slate-400">
          Last heard:{" "}
          <span className="italic text-slate-200">&quot;{lastHeard}&quot;</span>
        </p>
      )}

      {errorMsg && (
        <p className="mt-1 text-xs text-rose-400">Mic error: {errorMsg}</p>
      )}
    </div>
  );
}
