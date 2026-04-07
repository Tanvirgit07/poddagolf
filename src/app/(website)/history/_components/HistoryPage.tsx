"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Direction =
  | "STRAIGHT"
  | "SLIGHT RIGHT"
  | "SLIGHT LEFT"
  | "DRAW"
  | "FADE"
  | "HEAVY LEFT"
  | "HEAVY RIGHT"
  | "N/A";

interface ShotRecord {
  _id: string;
  time: string;
  club: string | null;
  direction: Direction;
  distance: number | null;
  shotType?: string | null;
  position?: string | null;
  scoring?: string | null;
  event?: string | null;
}

// ─── Direction Arrow ──────────────────────────────────────────────────────────
const DIRECTION_META: Record<Direction, { arrow: string; color: string }> = {
  STRAIGHT: { arrow: "↑", color: "#3b82f6" },
  "SLIGHT RIGHT": { arrow: "↗", color: "#3b82f6" },
  "SLIGHT LEFT": { arrow: "↖", color: "#3b82f6" },
  DRAW: { arrow: "↑", color: "#3b82f6" },
  FADE: { arrow: "↑", color: "#3b82f6" },
  "HEAVY LEFT": { arrow: "←", color: "#3b82f6" },
  "HEAVY RIGHT": { arrow: "→", color: "#3b82f6" },
  "N/A": { arrow: "•", color: "#9ca3af" },
};

interface SessionShotApi {
  _id: string;
  club: string;
  distance: number | null;
  direction: string | null;
  shotType?: string | null;
  position?: string | null;
  scoring?: string | null;
  event?: string | null;
  recordedAt: string;
}

interface SessionShotsResponse {
  status: boolean;
  message: string;
  data: SessionShotApi[];
}

function normalizeDirection(direction?: string | null): Direction {
  if (!direction) return "N/A";
  const key = direction.trim().toUpperCase();
  if (key === "STRAIGHT") return "STRAIGHT";
  if (key === "SLIGHT RIGHT") return "SLIGHT RIGHT";
  if (key === "SLIGHT LEFT") return "SLIGHT LEFT";
  if (key === "DRAW") return "DRAW";
  if (key === "FADE") return "FADE";
  if (key === "HEAVY LEFT") return "HEAVY LEFT";
  if (key === "HEAVY RIGHT") return "HEAVY RIGHT";
  return "N/A";
}

function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// ─── Row ──────────────────────────────────────────────────────────────────────
function ShotRow({ shot }: { shot: ShotRecord }) {
  const meta = DIRECTION_META[shot.direction];

  return (
    <div className="grid grid-cols-4 gap-4 px-6 py-5 border border-gray-200 rounded-2xl bg-white">
      {/* Time */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400 font-medium tracking-wide">Time</span>
        <span className="text-[1.05rem] font-bold text-gray-900">{shot.time}</span>
      </div>

      {/* Club */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400 font-medium tracking-wide">Club</span>
        <span className="text-[1.05rem] font-bold text-gray-900">{shot.club ?? "-"}</span>
      </div>

      {/* Direction */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400 font-medium tracking-wide">Direction</span>
        <span className="text-[1.05rem] font-bold text-gray-900 flex items-center gap-1">
          {shot.direction}
          <span style={{ color: meta.color }} className="text-base leading-none">
            {meta.arrow}
          </span>
        </span>
      </div>

      {/* Distance */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400 font-medium tracking-wide">Distance</span>
        <span className="text-[1.05rem] font-bold text-gray-900">
          {shot.distance ?? "-"}
          {shot.distance !== null && (
            <span className="text-sm font-normal text-gray-500 ml-0.5">m</span>
          )}
        </span>
      </div>

      {/* Shot Type */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400">Shot Type</span>
        <span className="font-bold text-gray-900">{shot.shotType ?? "-"}</span>
      </div>

      {/* Position */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400">Position</span>
        <span className="font-bold text-gray-900">{shot.position ?? "-"}</span>
      </div>

      {/* Scoring */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400">Scoring</span>
        <span className="font-bold text-gray-900">{shot.scoring ?? "-"}</span>
      </div>

      {/* Event */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400">Event</span>
        <span className="font-bold text-gray-900">{shot.event ?? "-"}</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const router = useRouter();

  const { data: shots = [], isLoading } = useQuery({
    queryKey: ["session-shots"],
    queryFn: async () => {
      const sessionId =
        localStorage.getItem("recordingSessionId") || "my-round-001";
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/shots/session/${sessionId}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch session shots.");
      }

      const json: SessionShotsResponse = await res.json();
      return json.data.map((item) => ({
        _id: item._id,
        time: formatTime(item.recordedAt),
        club: item.club,
        direction: normalizeDirection(item.direction),
        distance: item.distance,
        shotType: item.shotType,
        position: item.position,
        scoring: item.scoring,
        event: item.event,
      }));
    },
  });

  return (
    <div
      className="min-h-screen w-full px-6 py-8"
      style={{
        backgroundColor: "#F5F2EB",
        fontFamily: "'SF Pro Display', 'Helvetica Neue', sans-serif",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <h1 className="text-[2.4rem] font-bold text-gray-900 mb-6">
          History
        </h1>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-4 gap-4 px-6 py-5 border border-gray-200 rounded-2xl bg-white"
              >
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-28" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-14" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : shots.length === 0 ? (
          <div className="min-h-[55vh] w-full flex items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/70">
            <p className="text-center text-lg font-medium text-gray-600">
              No history found yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {shots.map((shot) => (
              <ShotRow key={shot._id} shot={shot} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}