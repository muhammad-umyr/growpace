"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import {
  getProfile,
  saveProfile,
  getBoard,
  PROGRESS_STAGES,
  ProgressEntry,
} from "@/lib/store";

const TAG_COLORS: Record<string, string> = {
  Physical:  "bg-[#EDF3F0] text-[#202837]",
  Language:  "bg-[#EEEDF8] text-[#202837]",
  Cognitive: "bg-[#EEEDF8] text-[#202837]",
  Creative:  "bg-[#EDF3F0] text-[#AA6646]",
  Social:    "bg-[#EEEDF8] text-[#202837]",
  Sensory:   "bg-[#EDF3F0] text-[#202837]",
  Motor:     "bg-[#EEEDF8] text-[#202837]",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ActivityDetail() {
  const params = useSearchParams();
  const router = useRouter();
  const profileId = params.get("profileId");
  const activityId = params.get("activityId");

  const [profile, setProfile] = useState<ReturnType<typeof getProfile>>(null);
  const [mounted, setMounted] = useState(false);
  const [note, setNote] = useState("");
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [showLogForm, setShowLogForm] = useState(false);

  useEffect(() => {
    if (profileId) setProfile(getProfile(profileId));
    setMounted(true);
  }, [profileId]);

  if (!mounted) return null;

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#EEEDF8] gap-4">
        <p className="text-[#202837] font-semibold">Profile not found.</p>
        <button onClick={() => router.push("/")} className="text-[#202837] font-bold hover:underline">Go home</button>
      </div>
    );
  }

  const board = getBoard(profile);
  const activity = board.find(a => a.id === activityId);

  if (!activity) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#EEEDF8] gap-4">
        <p className="text-[#202837] font-semibold">Activity not found.</p>
        <button onClick={() => router.back()} className="text-[#202837] font-bold hover:underline">← Go back</button>
      </div>
    );
  }

  function updateActivity(patch: Partial<typeof activity>) {
    const updatedBoard = board.map(a => a.id === activityId ? { ...a, ...patch } : a);
    const updated = { ...profile!, board: updatedBoard };
    setProfile(updated);
    saveProfile(updated);
  }

  function logProgress() {
    if (!selectedStage) return;
    const entry: ProgressEntry = {
      date: new Date().toISOString(),
      progress: selectedStage,
      note: note.trim() || undefined,
    };
    const newLog = [...(activity!.progressLog ?? []), entry];
    updateActivity({ progress: selectedStage, progressLog: newLog });
    setNote("");
    setSelectedStage(null);
    setShowLogForm(false);
  }

  function markDone() {
    updateActivity({ status: "done", progress: 100 });
    router.back();
  }

  function saveForLater() {
    updateActivity({ status: "saved" });
    router.back();
  }

  const currentStage = PROGRESS_STAGES.find(s => s.value === activity.progress);

  // Build full timeline: addedAt + activatedAt + all log entries
  type TimelineItem = { date: string; label: string; note?: string; isKey?: boolean };
  const timeline: TimelineItem[] = [
    { date: activity.addedAt, label: "Added to board", isKey: true },
    ...(activity.activatedAt ? [{ date: activity.activatedAt, label: "Started this week", isKey: true }] : []),
    ...(activity.progressLog ?? []).map(e => ({
      date: e.date,
      label: PROGRESS_STAGES.find(s => s.value === e.progress)?.label ?? `${e.progress}%`,
      note: e.note,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F3FC] via-[#EEEDF8] to-[#EDF3F0]">

      {/* Nav */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#D4DFDD] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-sm text-[#202837] font-semibold hover:text-[#0A1338] transition-colors flex items-center gap-1"
          >
            ← Back
          </button>
          <span className="text-base font-extrabold text-[#202837]">Growpace</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5 pb-16">

        {/* Activity header */}
        <div className="bg-white rounded-2xl border border-[#E4E2F2] p-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F4F3FC] to-[#D4DFDD] flex items-center justify-center text-4xl flex-shrink-0">
              {activity.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[activity.tag] ?? "bg-gray-100 text-gray-500"}`}>
                {activity.tag}
              </span>
              <h1 className="font-extrabold text-[#0A1338] text-xl leading-tight mt-1">{activity.title}</h1>
              <p className="text-[#202837] text-sm mt-1 leading-relaxed">{activity.desc}</p>
            </div>
          </div>
        </div>

        {/* Current progress */}
        <div className="bg-white rounded-2xl border border-[#E4E2F2] p-5">
          <h2 className="text-base font-extrabold text-[#0A1338] mb-4">Progress</h2>
          <div className="flex gap-2">
            {PROGRESS_STAGES.map(stage => {
              const reached = activity.progress >= stage.value;
              const isCurrent = activity.progress === stage.value;
              return (
                <div key={stage.value} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className={`w-full h-2 rounded-full transition-colors ${reached ? "bg-[#202837]" : "bg-[#E4E2F2]"}`} />
                  <span className={`text-[10px] font-bold text-center leading-tight ${isCurrent ? "text-[#0A1338]" : reached ? "text-[#A6BFB6]" : "text-[#D4DFDD]"}`}>
                    {stage.short}
                  </span>
                </div>
              );
            })}
          </div>
          {currentStage && (
            <p className="mt-3 text-sm font-semibold text-[#202837]">
              Currently: <span className="text-[#0A1338] font-extrabold">{currentStage.label}</span>
            </p>
          )}
          {!activity.progress && (
            <p className="mt-3 text-sm text-[#8FA4A6]">No progress logged yet — tap below to get started.</p>
          )}
        </div>

        {/* Log progress update */}
        <div className="bg-white rounded-2xl border border-[#E4E2F2] overflow-hidden">
          <button
            onClick={() => setShowLogForm(v => !v)}
            className="w-full px-5 py-4 flex items-center justify-between text-left"
          >
            <span className="text-base font-extrabold text-[#0A1338]">Log a progress update</span>
            <span className="text-[#202837] text-lg">{showLogForm ? "▲" : "▾"}</span>
          </button>
          {showLogForm && (
            <div className="px-5 pb-5 space-y-3 border-t border-[#E4E2F2] pt-4">
              <p className="text-sm font-bold text-[#0A1338]">Where are you right now?</p>
              <div className="grid grid-cols-2 gap-2">
                {PROGRESS_STAGES.map(stage => (
                  <button
                    key={stage.value}
                    onClick={() => setSelectedStage(stage.value)}
                    className={`px-3 py-3 rounded-xl border-2 text-left transition-all
                      ${selectedStage === stage.value
                        ? "border-[#202837] bg-[#EEEDF8]"
                        : "border-[#D4DFDD] bg-[#F7F7FB] hover:border-[#A6BFB6]"
                      }`}
                  >
                    <p className="text-sm font-bold text-[#0A1338]">{stage.label}</p>
                  </button>
                ))}
              </div>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add a note… (optional) e.g. She tried for 5 minutes today!"
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#D4DFDD] bg-[#F7F7FB] focus:outline-none focus:border-[#202837] text-[#0A1338] placeholder-[#8FA4A6] text-sm resize-none h-20 transition-colors"
              />
              <button
                onClick={logProgress}
                disabled={!selectedStage}
                className="w-full py-3 rounded-2xl bg-[#202837] hover:bg-[#141D28] disabled:opacity-40 text-white font-bold text-sm transition-colors"
              >
                Save update
              </button>
            </div>
          )}
        </div>

        {/* Timeline */}
        {timeline.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E4E2F2] p-5">
            <h2 className="text-base font-extrabold text-[#0A1338] mb-4">Timeline</h2>
            <div className="space-y-0">
              {timeline.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  {/* Line + dot */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-0.5 ${item.isKey ? "bg-[#202837]" : "bg-[#B2ADEB]"}`} />
                    {idx < timeline.length - 1 && <div className="w-0.5 bg-[#E4E2F2] flex-1 my-1" />}
                  </div>
                  {/* Content */}
                  <div className="pb-4 flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#0A1338]">{item.label}</p>
                    <p className="text-xs text-[#8FA4A6] mt-0.5">{formatDate(item.date)}</p>
                    {item.note && (
                      <p className="mt-1.5 text-sm text-[#202837] bg-[#F7F7FB] rounded-xl px-3 py-2 leading-relaxed">
                        "{item.note}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={markDone}
            className="flex-1 py-3 rounded-2xl bg-[#202837] hover:bg-[#141D28] text-white font-bold text-sm transition-colors"
          >
            ✅ Mark as Done
          </button>
          <button
            onClick={saveForLater}
            className="flex-1 py-3 rounded-2xl bg-white border border-[#E4E2F2] text-[#202837] font-bold text-sm hover:bg-[#EEEDF8] transition-colors"
          >
            ⏸ Save for Later
          </button>
        </div>

      </main>
    </div>
  );
}

export default function ActivityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#EEEDF8]">
        <div className="text-4xl animate-bounce">🌱</div>
      </div>
    }>
      <ActivityDetail />
    </Suspense>
  );
}
