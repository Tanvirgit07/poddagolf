"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { ArrowLeft, Flag, Target, Wind, MapPin } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SessionShotApi {
  _id: string;
  holeNumber: number;
  shotNumber: number;
  club: string | null;
  distance: number | null;
  direction: string | null;
  shotType: string | null;
  position: string | null;
  scoring: string | null;
  event: string | null;
  rawText: string;
  recordedAt: string;
  isValid: boolean;
  strokeCount?: number;
}

interface SummaryApi {
  holeNumber: number;
  totalStrokes: number;
  scoring: string | null;
  isValid: boolean;
  invalidReasons: string[];
}

interface SessionShotsResponse {
  status: boolean;
  message: string;
  data: {
    shots: SessionShotApi[];
    summary: SummaryApi[];
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

const SCORING_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  eagle: { label: "Eagle", color: "#b45309", bg: "#fffbeb" },
  birdie: { label: "Birdie", color: "#15803d", bg: "#f0fdf4" },
  par: { label: "Par", color: "#1d4ed8", bg: "#eff6ff" },
  bogey: { label: "Bogey", color: "#dc2626", bg: "#fef2f2" },
  "double bogey": { label: "Double Bogey", color: "#9f1239", bg: "#fff1f2" },
};

const DIRECTION_META: Record<string, string> = {
  straight: "↑",
  right: "↗",
  left: "↖",
  "slight right": "↗",
  "slight left": "↖",
  "heavy right": "→",
  "heavy left": "←",
  draw: "↑",
  fade: "↑",
};

function groupByHole(shots: SessionShotApi[]) {
  const map = new Map<number, SessionShotApi[]>();
  for (const shot of shots) {
    const existing = map.get(shot.holeNumber) ?? [];
    existing.push(shot);
    map.set(shot.holeNumber, existing);
  }
  return map;
}

// ─── Shot Card ────────────────────────────────────────────────────────────────
function ShotCard({ shot }: { shot: SessionShotApi }) {
  const dirArrow = shot.direction
    ? DIRECTION_META[shot.direction.toLowerCase()] ?? "•"
    : null;

  const scoringInfo = shot.scoring
    ? SCORING_META[shot.scoring.toLowerCase()] ?? null
    : null;

  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center pt-1">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ backgroundColor: "#1a5c38" }}
        >
          {shot.shotNumber}
        </div>

        {shot.strokeCount && (
          <span className="text-[10px] text-gray-400 mt-1">
            x{shot.strokeCount}
          </span>
        )}
      </div>

      <div
        className="flex-1 rounded-xl border border-gray-100 bg-white px-4 py-3 mb-3 shadow-sm"
        style={{ borderLeft: "3px solid #1a5c38" }}
      >
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {shot.club && (
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: "#1a5c38" }}
            >
              {shot.club}
            </span>
          )}
          {shot.shotType && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">
              {shot.shotType}
            </span>
          )}
          {scoringInfo && (
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold capitalize"
              style={{
                color: scoringInfo.color,
                backgroundColor: scoringInfo.bg,
              }}
            >
              {scoringInfo.label}
            </span>
          )}
          <span className="ml-auto text-xs text-gray-400">
            {formatTime(shot.recordedAt)}
          </span>
        </div>

        {(shot.distance || shot.direction || shot.position) && (
          <div className="flex flex-wrap gap-4 text-sm mb-2">
            {shot.distance && (
              <div className="flex items-center gap-1 text-gray-700">
                <Target className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-semibold">{shot.distance}m</span>
              </div>
            )}
            {shot.direction && (
              <div className="flex items-center gap-1 text-gray-700">
                <Wind className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-semibold capitalize">
                  {shot.direction}
                </span>
                <span className="text-gray-500 text-base">{dirArrow}</span>
              </div>
            )}
            {shot.position && (
              <div className="flex items-center gap-1 text-gray-700">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-semibold capitalize">{shot.position}</span>
              </div>
            )}
          </div>
        )}

        {shot.rawText && (
          <p className="text-xs text-gray-400 italic">
            "{shot.rawText}"
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Hole Section ─────────────────────────────────────────────────────────────
function HoleSection({
  holeNumber,
  shots,
  summary,
}: {
  holeNumber: number;
  shots: SessionShotApi[];
  summary?: SummaryApi;
}) {
  const scoringInfo = summary?.scoring
    ? SCORING_META[summary.scoring.toLowerCase()] ?? null
    : null;

  return (
    <div className="mb-7">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white font-bold text-sm"
          style={{ backgroundColor: "#1a5c38" }}
        >
          <Flag className="w-3.5 h-3.5" />
          Hole {holeNumber}
        </div>

        <span className="text-sm text-gray-400">
          {summary?.totalStrokes ?? shots.length} strokes
        </span>

        {scoringInfo && (
          <span
            className="px-3 py-0.5 rounded-full text-xs font-bold"
            style={{
              color: scoringInfo.color,
              backgroundColor: scoringInfo.bg,
            }}
          >
            {scoringInfo.label}
          </span>
        )}

        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="pl-1">
        {shots.map((shot) => (
          <ShotCard key={shot._id} shot={shot} />
        ))}
      </div>
    </div>
  );
}

// ─── Scorecard ────────────────────────────────────────────────────────────────
function ScorecardStrip({
  holeGroups,
  sortedHoles,
  summary,
}: any) {
  const invalidHoles = summary.filter(
    (s: any) => !s.isValid && s.invalidReasons?.length > 0
  );

  return (
    <div className="mb-8 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div
        className="px-5 py-2.5 text-white text-xs font-semibold uppercase"
        style={{ backgroundColor: "#1a5c38" }}
      >
        Scorecard
      </div>

      <div className="flex divide-x divide-gray-100 overflow-x-auto">
        {sortedHoles.map((hole: number) => {
          const holeShots = holeGroups.get(hole)!;
          const sum = summary.find((s: any) => s.holeNumber === hole);
          const isInvalid = sum && !sum.isValid;

          return (
            <div
              key={hole}
              className="flex-1 min-w-[56px] flex flex-col items-center py-3 px-2 relative"
              style={isInvalid ? { backgroundColor: "#fff8f8" } : {}}
            >
              {isInvalid && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-400" />
              )}
              <span className="text-[11px] text-gray-400">H{hole}</span>

              <span
                className="text-xl font-bold"
                style={{ color: isInvalid ? "#dc2626" : "#111827" }}
              >
                {sum?.totalStrokes ?? holeShots.length}
              </span>

              {sum?.scoring ? (
                <span className="text-[10px] text-gray-600 capitalize">
                  {sum.scoring}
                </span>
              ) : (
                <span className="text-[10px] text-gray-300">—</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Invalid Reasons */}
      {invalidHoles.length > 0 && (
        <div className="border-t border-red-100 bg-red-50 px-4 py-3 flex flex-col gap-1.5">
          {invalidHoles.map((s: any) =>
            s.invalidReasons.map((reason: string, i: number) => (
              <div key={`${s.holeNumber}-${i}`} className="flex items-start gap-2">
                <span
                  className="mt-0.5 shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                  style={{ backgroundColor: "#dc2626" }}
                >
                  H{s.holeNumber}
                </span>
                <span className="text-xs text-red-600">{reason}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div>
      {/* Scorecard Skeleton */}
      <div className="mb-8 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-2.5 bg-[#1a5c38]">
          <Skeleton className="h-3 w-20 bg-green-700" />
        </div>
        <div className="flex divide-x divide-gray-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-1 min-w-[56px] flex flex-col items-center py-3 px-2 gap-1">
              <Skeleton className="h-3 w-6" />
              <Skeleton className="h-7 w-8" />
              <Skeleton className="h-2.5 w-10" />
            </div>
          ))}
        </div>
      </div>

      {/* Hole Sections Skeleton */}
      {Array.from({ length: 3 }).map((_, holeIdx) => (
        <div key={holeIdx} className="mb-7">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-4 w-16" />
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="pl-1">
            {Array.from({ length: 3 }).map((_, shotIdx) => (
              <div key={shotIdx} className="flex items-start gap-3 mb-3">
                <Skeleton className="w-7 h-7 rounded-full mt-1 shrink-0" />
                <div className="flex-1 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-4 w-12 ml-auto" />
                  </div>
                  <div className="flex gap-4 mb-2">
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["session-shots"],
    queryFn: async () => {
      const sessionId =
        localStorage.getItem("recordingSessionId") || "my-round-005";

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/shots/round/my-round-005`
      );

      if (!res.ok) throw new Error("Failed");

      const json: SessionShotsResponse = await res.json();
      return json.data;
    },
  });

  const shots = data?.shots || [];
  const summary = data?.summary || [];

  const holeGroups = groupByHole(shots);
  const sortedHoles = Array.from(holeGroups.keys()).sort((a, b) => a - b);

  return (
    <div className="min-h-screen px-5 py-8 bg-[#F5F2EB]">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.push("/")}
          className="mb-6 flex items-center gap-2 bg-white border px-4 py-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-2xl font-bold mb-6">Round History</h1>

        {isLoading ? (
          <PageSkeleton />
        ) : sortedHoles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: "#e8f5ee" }}
            >
              <Flag className="w-7 h-7" style={{ color: "#1a5c38" }} />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">No Round Data Yet</h2>
            <p className="text-sm text-gray-400 max-w-xs">
              You haven't recorded any shots for this round. Start your round and your shots will appear here.
            </p>
          </div>
        ) : (
          <>
            <ScorecardStrip
              holeGroups={holeGroups}
              sortedHoles={sortedHoles}
              summary={summary}
            />

            {sortedHoles.map((hole) => (
              <HoleSection
                key={hole}
                holeNumber={hole}
                shots={holeGroups.get(hole)!}
                summary={summary.find((s) => s.holeNumber === hole)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}