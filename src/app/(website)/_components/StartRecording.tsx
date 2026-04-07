"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Play, Copy, Square, ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────
type Stage = "idle" | "recording" | "transcribing" | "transcribed";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

// ─── Shared Mic Icon ──────────────────────────────────────────────────────────
function MicIcon() {
  return (
    <div
      className="w-[120px] h-[120px] rounded-[22px] flex items-center justify-center shadow-lg flex-shrink-0"
      style={{
        background: "linear-gradient(160deg, #4da3f7 0%, #1a72e8 100%)",
      }}
    >
      <Mic className="w-14 h-14 text-white" strokeWidth={2.2} />
    </div>
  );
}

// ─── Stage 1 : Idle ───────────────────────────────────────────────────────────
function IdleView({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center gap-7 bg-white ">
      <MicIcon />
      <h1 className="lg:text-[60px] md:text-[40px] text-[30px] font-semibold text-gray-900 text-center leading-[120%]">
        Record and transcribe audio
      </h1>
      <button
        onClick={onStart}
        className="flex items-center gap-2 bg-[#E41B00] hover:bg-red-700 active:scale-95 transition-all duration-150 text-white text-[24px] font-medium leading-[120%] px-10 h-[70px] !rounded-[8px] shadow"
      >
        <Mic className="w-6 h-6" strokeWidth={2.2} />
        Start recording
      </button>
    </div>
  );
}

// ─── Stage 2 : Recording ──────────────────────────────────────────────────────
function RecordingView({
  elapsed,
  isPaused,
  onTogglePause,
  onStop,
  analyserRef,
}: {
  elapsed: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onStop: () => void;
  analyserRef: React.RefObject<AnalyserNode | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, W, H);

      const analyser = analyserRef.current;
      const barW = 3;
      const gap = 2;
      const total = Math.floor(W / (barW + gap));

      if (analyser) {
        const bufLen = analyser.frequencyBinCount;
        const data = new Uint8Array(bufLen);
        analyser.getByteFrequencyData(data);
        const step = Math.floor(bufLen / total);

        for (let i = 0; i < total; i++) {
          const val = data[i * step] / 255;
          const barH = Math.max(4, val * H);
          const x = i * (barW + gap);
          const y = (H - barH) / 2;
          ctx.fillStyle = "#1a72e8";
          ctx.beginPath();
          ctx.roundRect(x, y, barW, barH, 2);
          ctx.fill();
        }
      } else {
        for (let i = 0; i < total; i++) {
          const barH =
            4 + Math.abs(Math.sin(Date.now() / 200 + i * 0.4)) * (H - 8);
          const x = i * (barW + gap);
          const y = (H - barH) / 2;
          ctx.fillStyle = "#1a72e8";
          ctx.beginPath();
          ctx.roundRect(x, y, barW, barH, 2);
          ctx.fill();
        }
      }
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyserRef]);

  return (
    <div className="flex flex-col items-center gap-7">
      <MicIcon />
      <h1 className="lg:text-[60px] md:text-[40px] text-[30px] font-semibold text-gray-900 text-center leading-[120%]">
        Record and transcribe audio
      </h1>

      {/* Waveform canvas */}
      <canvas ref={canvasRef} width={200} height={48} className="rounded" />

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Pause indicator */}
        <button
          type="button"
          onClick={onTogglePause}
          className="flex items-center justify-center px-3 h-[50px] rounded-[8px] border border-red-300 bg-white hover:bg-red-50 transition-colors"
          title={isPaused ? "Resume recording" : "Pause recording"}
        >
          {isPaused ? (
            <Play
              className="w-4 h-4 text-red-500 fill-red-500"
              strokeWidth={1.8}
            />
          ) : (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-4 bg-red-400 rounded-sm" />
              <div className="w-1.5 h-4 bg-red-400 rounded-sm" />
            </div>
          )}
        </button>

        {/* Stop + timer */}
        <button
          onClick={onStop}
          className="flex items-center gap-2 bg-[#E41B00] hover:bg-red-700 active:scale-95 transition-all duration-150 text-white text-[24px] font-medium px-6 h-[50px] rounded-[8px] shadow"
        >
          <Square className="w-6 h-6 fill-white" strokeWidth={0} />
          {formatTime(elapsed)}
        </button>
      </div>
    </div>
  );
}

// ─── Stage 4 : Transcribing (loading) ────────────────────────────────────────
function TranscribingView() {
  return (
    <div className="flex flex-col items-center gap-7">
      <MicIcon />
      <h1 className="text-[2.1rem] font-bold text-gray-900 text-center">
        Transcribing…
      </h1>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Stage 5 : Transcribed ────────────────────────────────────────────────────
function TranscribedView({
  club,
  distance,
  direction,
  shotType,
  position,
  scoring,
  event,
  onRedo,
}: {
  club: string;
  distance: string;
  direction: string;
  shotType: string;
  position: string;
  scoring: string;
  event: string;
  onRedo: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const displayValues = [
    club,
    distance ? `${distance}m` : "",
    direction,
    shotType,
    position,
    scoring,
    event,
  ].filter(Boolean);

  const handleCopy = () => {
    const combinedText = displayValues.join(", ");
    navigator.clipboard.writeText(combinedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <MicIcon />
      <h1 className="text-[2.1rem] font-bold text-gray-900 text-center leading-tight">
        Transcription
      </h1>

      {/* Single result field */}
      <div className="relative w-full bg-blue-50 border border-blue-100 rounded-xl px-4 py-4 min-h-[120px] flex flex-col justify-between">
        {/* Content */}
        <div className="text-black text-[18px] leading-relaxed font-medium tracking-wide space-y-3 pr-8">
          {displayValues.length > 0 ? (
            <>
              {/* First Box */}
              <div className="bg-blue-100 border border-blue-200 rounded-lg px-3 py-2">
                <div className="flex flex-wrap items-center gap-1">
                  {[club, distance ? `${distance}m` : "", direction, shotType]
                    .filter(Boolean)
                    .map((value, idx) => {
                      const isDistance = distance && value === `${distance}m`;
                      return (
                        <span
                          key={`top-${value}-${idx}`}
                          className={
                            isDistance ? "" : ""
                          }
                        >
                          {idx > 0 ? ", " : ""}
                          {value}
                        </span>
                      );
                    })}
                </div>
              </div>

              {/* Second Box */}
              <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2">
                <div className="flex flex-wrap items-center gap-1">
                  {[position, scoring, event]
                    .filter(Boolean)
                    .map((value, idx) => (
                      <span key={`bottom-${value}-${idx}`}>
                        {idx > 0 ? ", " : ""}
                        {value}
                      </span>
                    ))}
                </div>
              </div>
            </>
          ) : (
            "-"
          )}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          title="Copy"
          className="absolute top-3 right-3 p-1 rounded-md hover:bg-gray-200 transition"
        >
          <Copy className="w-4 h-4 text-gray-500" />
        </button>

        {/* Copied Text */}
        {copied && (
          <span className="absolute bottom-3 right-3 text-xs text-green-600 font-medium bg-white px-2 py-1 rounded-md shadow-sm">
            Copied!
          </span>
        )}
      </div>

      <button
        onClick={onRedo}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 transition-all duration-150 text-white text-[0.95rem] font-semibold px-10 py-[14px] rounded-xl shadow w-full justify-center"
      >
        <Mic className="w-4 h-4" strokeWidth={2.2} />
        Redo recording
      </button>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────
export default function StartRecording() {
  const SESSION_STORAGE_KEY = "recordingSessionId";
  const TAB_SESSION_KEY = "recordingTabSessionId";
  const [stage, setStage] = useState<Stage>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [club, setClub] = useState("");
  const [distance, setDistance] = useState("");
  const [direction, setDirection] = useState("");
  const [shotType, setShotType] = useState("");
  const [position, setPosition] = useState("");
  const [scoring, setScoring] = useState("");
  const [event, setEvent] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const shouldTranscribeRef = useRef(false);
  const sessionIdRef = useRef("");

  const generateSessionId = useCallback(() => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }, []);

  const ensureSessionId = useCallback(() => {
    if (sessionIdRef.current) return sessionIdRef.current;

    const tabSessionId = sessionStorage.getItem(TAB_SESSION_KEY);
    const localSessionId = localStorage.getItem(SESSION_STORAGE_KEY);

    if (tabSessionId) {
      const stableSessionId = localSessionId || tabSessionId;
      if (localSessionId !== stableSessionId) {
        localStorage.setItem(SESSION_STORAGE_KEY, stableSessionId);
      }
      if (tabSessionId !== stableSessionId) {
        sessionStorage.setItem(TAB_SESSION_KEY, stableSessionId);
      }
      sessionIdRef.current = stableSessionId;
      return stableSessionId;
    }

    const newId = generateSessionId();
    localStorage.setItem(SESSION_STORAGE_KEY, newId);
    sessionStorage.setItem(TAB_SESSION_KEY, newId);
    sessionIdRef.current = newId;
    return newId;
  }, [SESSION_STORAGE_KEY, TAB_SESSION_KEY, generateSessionId]);

  useEffect(() => {
    ensureSessionId();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [ensureSessionId]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
  }, []);

  const sendAudioMutation = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const sessionId = ensureSessionId();

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("sessionId", sessionId);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/transcribe`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!res.ok) {
        throw new Error("Failed to transcribe audio.");
      }

      return res.json();
    },
  });

  const transcribeAudio = useCallback(
    async (audioBlob: Blob) => {
      try {
        const result = await sendAudioMutation.mutateAsync(audioBlob);
        setClub(result?.data?.shot?.club || "");
        setDistance(
          result?.data?.shot?.distance !== undefined
            ? String(result.data.shot.distance)
            : "",
        );
        setDirection(result?.data?.shot?.direction || "");
        setShotType(result?.data?.shot?.shotType || "");
        setPosition(result?.data?.shot?.position || "");
        setScoring(result?.data?.shot?.scoring || "");
        setEvent(result?.data?.shot?.event || "");
        setStage("transcribed");
      } catch {
        setStage("idle");
        alert("Transcription failed. Please try again.");
      }
    },
    [sendAudioMutation],
  );

  const startRecording = useCallback(async () => {
    ensureSessionId();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const shouldTranscribe = shouldTranscribeRef.current;
        shouldTranscribeRef.current = false;
        stream.getTracks().forEach((t) => t.stop());
        await audioCtx.close();
        if (shouldTranscribe) {
          await transcribeAudio(blob);
        }
      };

      mr.start();
      setElapsed(0);
      setIsPaused(false);
      shouldTranscribeRef.current = false;
      setStage("recording");
      startTimer();
    } catch {
      alert("Microphone access denied or not available.");
    }
  }, [ensureSessionId, startTimer, transcribeAudio]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPaused(false);
    setStage("transcribing");
    shouldTranscribeRef.current = true;
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") mr.stop();
  }, []);

  const togglePause = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (!mr) return;

    if (mr.state === "recording") {
      mr.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPaused(true);
      return;
    }

    if (mr.state === "paused") {
      mr.resume();
      startTimer();
      setIsPaused(false);
    }
  }, [startTimer]);

  const handleRedo = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPaused(false);
    shouldTranscribeRef.current = false;
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") mr.stop();
    setElapsed(0);
    setClub("");
    setDistance("");
    setDirection("");
    setShotType("");
    setPosition("");
    setScoring("");
    setEvent("");
    setStage("idle");
  }, []);

  const handleRedoAndStart = useCallback(async () => {
    handleRedo();
    await startRecording();
  }, [handleRedo, startRecording]);
  return (
    <div className="flex min-h-[calc(100vh-85px)] w-full items-center justify-center px-4">
      <div className="max-w-6xl mx-auto flex h-[630px] w-full flex-col rounded-lg bg-white py-16">
        <div className="w-full px-6 pb-2">
          {stage !== "idle" && (
            <button
              type="button"
              onClick={handleRedo}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          {stage === "idle" && <IdleView onStart={startRecording} />}
          {stage === "recording" && (
            <RecordingView
              elapsed={elapsed}
              isPaused={isPaused}
              onTogglePause={togglePause}
              onStop={stopRecording}
              analyserRef={analyserRef}
            />
          )}
          {stage === "transcribing" && <TranscribingView />}
          {stage === "transcribed" && (
            <TranscribedView
              club={club}
              distance={distance}
              direction={direction}
              shotType={shotType}
              position={position}
              scoring={scoring}
              event={event}
              onRedo={handleRedoAndStart}
            />
          )}
        </div>
      </div>
    </div>
  );
}
