"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Play, Pause, Copy, Square } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Stage = "idle" | "recording" | "done" | "transcribing" | "transcribed";

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
      style={{ background: "linear-gradient(160deg, #4da3f7 0%, #1a72e8 100%)" }}
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
            <Play className="w-4 h-4 text-red-500 fill-red-500" strokeWidth={1.8} />
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

// ─── Stage 3 : Done ───────────────────────────────────────────────────────────
function DoneView({
  duration,
  audioUrl,
  onTranscribe,
  onRedo,
}: {
  duration: number;
  audioUrl: string;
  onTranscribe: () => void;
  onRedo: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / (audio.duration || 1)) * 100);
    };
    audio.onended = () => setPlaying(false);
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <MicIcon />
      <div className="text-center">
        <h1 className="lg:text-[60px] md:text-[40px] text-[30px] font-semibold text-gray-900 text-center leading-[120%]">
          Recording done!
        </h1>
        <p className="text-[#000000] text-base font-normal leading-[120%] mt-1">
          Your recording is now ready to be transcribed.
        </p>
      </div>  

      {/* Audio player */}
      <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 h-[48px] !w-96 bg-white shadow-sm my-[26px]">
        <button
          onClick={togglePlay}
          className="text-blue-600 hover:text-blue-700 transition-colors flex-shrink-0"
        >
          {playing ? (
            <Pause className="w-5 h-5 fill-blue-600" strokeWidth={0} />
          ) : (
            <Play className="w-5 h-5 fill-blue-600" strokeWidth={0} />
          )}
        </button>
        <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 flex-shrink-0 tabular-nums">
          {formatTime(currentTime || duration)}
        </span>
      </div>

      <button
        onClick={onTranscribe}
        className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all duration-150 text-white text-[24px] font-medium h-[70px] rounded-[8px] shadow w-72"
      >
        Transcribe
      </button>

      <button
        onClick={onRedo}
        className="text-sm text-gray-500 underline underline-offset-2 hover:text-gray-700 transition-colors"
      >
        Redo recording
      </button>
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
  text,
  onRedo,
}: {
  text: string;
  onRedo: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg">
      <MicIcon />
      <h1 className="text-[2.1rem] font-bold text-gray-900 text-center leading-tight">
        Transcription
      </h1>

      {/* Text box */}
      <div className="relative w-full bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 min-h-[60px]">
        <p className="text-gray-800 text-sm leading-relaxed pr-8">{text}</p>
        <button
          onClick={handleCopy}
          title="Copy"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Copy className="w-4 h-4" />
        </button>
        {copied && (
          <span className="absolute bottom-2 right-3 text-xs text-green-600 font-medium">
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
  const [stage, setStage] = useState<Stage>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
  }, []);

  const startRecording = useCallback(async () => {
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

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
        audioCtx.close();
      };

      mr.start();
      setElapsed(0);
      setIsPaused(false);
      setStage("recording");
      startTimer();
    } catch {
      alert("Microphone access denied or not available.");
    }
  }, [startTimer]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPaused(false);
    setDuration(elapsed);
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") mr.stop();
    setStage("done");
  }, [elapsed]);

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

  const handleTranscribe = useCallback(async () => {
    setStage("transcribing");
    // ── Replace this mock with your Whisper / Claude API call ──
    await new Promise((r) => setTimeout(r, 2000));
    setTranscript("Your transcribed text will appear here.");
    // ───────────────────────────────────────────────────────────
    setStage("transcribed");
  }, []);

  const handleRedo = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPaused(false);
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") mr.stop();
    setElapsed(0);
    setDuration(0);
    setAudioUrl("");
    setTranscript("");
    setStage("idle");
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-85px)] w-full items-center justify-center px-4">
      <div className="container mx-auto flex h-[630px] w-full flex-col items-center justify-center rounded-lg bg-white py-16">
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
        {stage === "done" && (
          <DoneView
            duration={duration}
            audioUrl={audioUrl}
            onTranscribe={handleTranscribe}
            onRedo={handleRedo}
          />
        )}
        {stage === "transcribing" && <TranscribingView />}
        {stage === "transcribed" && (
          <TranscribedView text={transcript} onRedo={handleRedo} />
        )}
      </div>
    </div>
  );
}
