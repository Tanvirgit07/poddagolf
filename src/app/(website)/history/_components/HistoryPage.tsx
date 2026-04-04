"use client";

import React from "react";

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
  id: number;
  time: string;
  club: string;
  direction: Direction;
  distance: number;
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const HISTORY: ShotRecord[] = [
  { id: 1, time: "09:42 AM", club: "7 IRON",   direction: "SLIGHT RIGHT", distance: 145 },
  { id: 2, time: "09:38 AM", club: "DRIVER",   direction: "STRAIGHT",     distance: 212 },
  { id: 3, time: "04:15 PM", club: "5 WOOD",   direction: "DRAW",         distance: 212 },
  { id: 4, time: "04:10 PM", club: "P-WEDGE",  direction: "HEAVY LEFT",   distance: 92  },
  { id: 5, time: "03:55 PM", club: "9 IRON",   direction: "FADE",         distance: 128 },
  { id: 6, time: "03:40 PM", club: "3 IRON",   direction: "SLIGHT LEFT",  distance: 175 },
];

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
  return (
    <div
      className="min-h-screen w-full px-6 py-8"
      style={{
        backgroundColor: "#F5F2EB",
        fontFamily: "'SF Pro Display', 'Helvetica Neue', sans-serif",
      }}
    >
      <div className="container mx-auto">
        <h1 className="text-[2.4rem] font-bold text-gray-900 mb-6">History</h1>

        <div className="flex flex-col gap-3">
          {HISTORY.map((shot) => (
            <ShotRow key={shot.id} shot={shot} />
          ))}
        </div>
      </div>
    </div>
  );
}