"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ────────────────────────────────────────────────────────────────────
type Direction =
  | "STRAIGHT"
  | "SLIGHT RIGHT"
  | "SLIGHT LEFT"
  | "DRAW"
  | "FADE"
  | "HEAVY LEFT"
  | "HEAVY RIGHT";

interface ShotRecord {
  _id: string;
  time: string;
  club: string;
  direction: Direction;
  distance: number;
}

// ─── Direction Arrow ──────────────────────────────────────────────────────────
const DIRECTION_META: Record<Direction, { arrow: string; color: string }> = {
  STRAIGHT:     { arrow: "↑",  color: "#3b82f6" },
  "SLIGHT RIGHT": { arrow: "↗", color: "#3b82f6" },
  "SLIGHT LEFT":  { arrow: "↖", color: "#3b82f6" },
  DRAW:         { arrow: "↑",  color: "#3b82f6" },
  FADE:         { arrow: "↑",  color: "#3b82f6" },
  "HEAVY LEFT": { arrow: "←",  color: "#3b82f6" },
  "HEAVY RIGHT":{ arrow: "→",  color: "#3b82f6" },
};

interface SessionShotApi {
  _id: string;
  club: string;
  distance: number;
  direction: string;
  recordedAt: string;
}

interface SessionShotsResponse {
  status: boolean;
  message: string;
  data: SessionShotApi[];
}

function normalizeDirection(direction: string): Direction {
  const key = direction.trim().toUpperCase();
  if (key === "STRAIGHT") return "STRAIGHT";
  if (key === "SLIGHT RIGHT") return "SLIGHT RIGHT";
  if (key === "SLIGHT LEFT") return "SLIGHT LEFT";
  if (key === "DRAW") return "DRAW";
  if (key === "FADE") return "FADE";
  if (key === "HEAVY LEFT") return "HEAVY LEFT";
  if (key === "HEAVY RIGHT") return "HEAVY RIGHT";
  return "STRAIGHT";
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
        <span className="text-[1.05rem] font-bold text-gray-900">{shot.club}</span>
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
          {shot.distance}
          <span className="text-sm font-normal text-gray-500 ml-0.5">m</span>
        </span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const { data: shots = [], isLoading } = useQuery({
    queryKey: ["session-shots"],
    queryFn: async () => {
      const sessionId = localStorage.getItem("recordingSessionId") || "my-round-001";
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
        <h1 className="text-[2.4rem] font-bold text-gray-900 mb-6">History</h1>

        <div className="flex flex-col gap-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
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
              ))
            : shots.map((shot) => <ShotRow key={shot._id} shot={shot} />)}
        </div>
      </div>
    </div>
  );
}
