"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect, useCallback } from "react";
import {
  getProfile,
  saveProfile,
  getBoard,
  calcAge,
  calcAgeMonths,
  ALL_ACTIVITIES,
  Profile,
  BoardActivity,
} from "@/lib/store";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AISuggestion {
  title: string;
  emoji: string;
  desc: string;
  tag: string;
  reason: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TAG_COLORS: Record<string, string> = {
  Physical:  "bg-[#f0fbf4] text-green-600",
  Language:  "bg-[#f0f8ff] text-[#6baed6]",
  Cognitive: "bg-[#fdf4ff] text-purple-500",
  Creative:  "bg-[#fff8f0] text-[#e8834a]",
  Social:    "bg-[#fff0f5] text-pink-500",
  Sensory:   "bg-[#f5fff0] text-lime-600",
  Motor:     "bg-[#eff6ff] text-blue-500",
};

const ALL_TAGS = ["All", "Physical", "Language", "Cognitive", "Creative", "Social", "Sensory", "Motor"];

// ── Sub-components ────────────────────────────────────────────────────────────

function ActivityCard({
  emoji, title, desc, tag, reason, isAdded, onAdd,
}: {
  emoji: string; title: string; desc: string; tag: string;
  reason?: string; isAdded: boolean; onAdd: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-50 flex items-start gap-4">
      <div className="w-12 h-12 rounded-2xl bg-[#fff8f0] flex items-center justify-center text-2xl flex-shrink-0">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-[#3d2c1e] text-sm">{title}</p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[tag] ?? "bg-gray-100 text-gray-500"}`}>
            {tag}
          </span>
        </div>
        <p className="text-[#a07060] text-xs mt-0.5">{desc}</p>
        {reason && (
          <p className="text-[#c4a898] text-[10px] mt-1 italic">💡 {reason}</p>
        )}
      </div>
      <button
        onClick={onAdd}
        disabled={isAdded}
        className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all
          ${isAdded
            ? "bg-[#f5ebe0] text-[#c4a898] cursor-default"
            : "bg-[#e8834a] text-white hover:bg-[#d6723b] shadow-sm"
          }`}
      >
        {isAdded ? "Added ✓" : "+ Board"}
      </button>
    </div>
  );
}

function ActiveCard({
  activity, onProgress, onDone, onPause, onRemove,
}: {
  activity: BoardActivity;
  onProgress: (p: number) => void;
  onDone: () => void;
  onPause: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-[#fff8f0] flex items-center justify-center text-2xl flex-shrink-0">
          {activity.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-[#3d2c1e] text-sm">{activity.title}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[activity.tag] ?? "bg-gray-100 text-gray-500"}`}>
              {activity.tag}
            </span>
          </div>
          <p className="text-[#a07060] text-xs mt-0.5">{activity.desc}</p>
        </div>
        <button onClick={onRemove} className="text-[#c4a898] hover:text-red-400 transition-colors text-xl flex-shrink-0 leading-none">
          ×
        </button>
      </div>

      {/* Progress tapper */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-[#a07060] font-semibold">Weekly progress</span>
          <span className="text-xs font-bold text-[#e8834a]">{activity.progress}%</span>
        </div>
        <div className="flex gap-1.5">
          {[25, 50, 75, 100].map(step => (
            <button
              key={step}
              onClick={() => onProgress(activity.progress === step ? Math.max(0, step - 25) : step)}
              className={`flex-1 h-3 rounded-full transition-colors
                ${activity.progress >= step ? "bg-[#e8834a]" : "bg-[#f5ebe0] hover:bg-[#f0ddd0]"}`}
              title={`${step}%`}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onDone}
          className="flex-1 py-2 rounded-xl bg-green-50 text-green-600 font-bold text-xs hover:bg-green-100 transition-colors border border-green-100"
        >
          ✅ Mark Done
        </button>
        <button
          onClick={onPause}
          className="flex-1 py-2 rounded-xl bg-[#f5ebe0] text-[#a07060] font-bold text-xs hover:bg-[#f0ddd0] transition-colors"
        >
          ⏸ Save for Later
        </button>
      </div>
    </div>
  );
}

function SavedCard({
  activity, onActivate, onRemove,
}: {
  activity: BoardActivity; onActivate: () => void; onRemove: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-50 p-4 flex items-start gap-3">
      <div className="w-11 h-11 rounded-2xl bg-[#f5f5f5] flex items-center justify-center text-2xl flex-shrink-0 opacity-70">
        {activity.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-[#a07060] text-sm">{activity.title}</p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full opacity-60 ${TAG_COLORS[activity.tag] ?? "bg-gray-100 text-gray-500"}`}>
            {activity.tag}
          </span>
        </div>
        <p className="text-[#c4a898] text-xs mt-0.5">{activity.desc}</p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={onActivate}
            className="text-xs bg-[#e8834a] text-white font-bold px-3 py-1 rounded-full hover:bg-[#d6723b] transition-colors"
          >
            Start This Week →
          </button>
          <button
            onClick={onRemove}
            className="text-xs text-[#c4a898] hover:text-red-400 transition-colors font-semibold"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function Activities() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<"suggested" | "library" | "board">("suggested");

  // AI suggestions
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Library filter
  const [filterTag, setFilterTag] = useState("All");

  // Track titles already on board for instant UI feedback
  const [addedTitles, setAddedTitles] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (id) {
      const p = getProfile(id);
      setProfile(p);
      if (p) setAddedTitles(new Set(getBoard(p).map(a => a.title)));
    }
    setMounted(true);
  }, [id]);

  const fetchSuggestions = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    setAiError(null);
    try {
      const ageMonths = calcAgeMonths(profile.dob);
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name, ageMonths, gender: profile.gender }),
      });
      const data = await res.json();

      if (data.error === "no_key") {
        setAiError("no_key");
        // Fall back to curated age-matched suggestions
        const fallback = ALL_ACTIVITIES
          .filter(a => ageMonths >= a.minMonths && ageMonths <= a.maxMonths)
          .sort((a, b) => {
            const am = (a.minMonths + a.maxMonths) / 2;
            const bm = (b.minMonths + b.maxMonths) / 2;
            return Math.abs(am - ageMonths) - Math.abs(bm - ageMonths);
          })
          .slice(0, 6)
          .map(a => ({ ...a, reason: "Curated for this age group" }));
        setSuggestions(fallback);
      } else if (data.activities?.length > 0) {
        setSuggestions(data.activities);
      } else {
        setAiError("failed");
      }
    } catch {
      setAiError("failed");
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (mounted && profile && tab === "suggested" && suggestions.length === 0) {
      fetchSuggestions();
    }
  }, [mounted, profile, tab, fetchSuggestions, suggestions.length]);

  if (!mounted) return null;

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff8f0] gap-4">
        <span className="text-5xl">🌱</span>
        <p className="text-[#a07060] font-semibold">Profile not found.</p>
        <button onClick={() => router.push("/")} className="text-[#e8834a] font-bold hover:underline">
          Go back home
        </button>
      </div>
    );
  }

  const board = getBoard(profile);
  const activeActivities  = board.filter(a => a.status === "active");
  const savedActivities   = board.filter(a => a.status === "saved");
  const doneActivities    = board.filter(a => a.status === "done");

  const libraryActivities = ALL_ACTIVITIES.filter(
    a => filterTag === "All" || a.tag === filterTag
  );

  // ── Mutations ──────────────────────────────────────────────────────────────

  function update(updated: Profile) {
    setProfile(updated);
    saveProfile(updated);
    setAddedTitles(new Set(getBoard(updated).map(a => a.title)));
  }

  function addToBoard(title: string, emoji: string, desc: string, tag: string, source: "library" | "ai") {
    if (addedTitles.has(title)) return;
    const activity: BoardActivity = {
      id: crypto.randomUUID(),
      title, emoji, desc, tag,
      status: "saved",
      addedAt: new Date().toISOString(),
      progress: 0,
      source,
    };
    update({ ...profile!, board: [...board, activity] });
  }

  function setStatus(activityId: string, status: BoardActivity["status"]) {
    const updated = board.map(a =>
      a.id === activityId
        ? { ...a, status, ...(status === "active" ? { activatedAt: new Date().toISOString() } : {}) }
        : a
    );
    update({ ...profile!, board: updated });
  }

  function setProgress(activityId: string, progress: number) {
    update({ ...profile!, board: board.map(a => a.id === activityId ? { ...a, progress } : a) });
  }

  function removeFromBoard(activityId: string) {
    update({ ...profile!, board: board.filter(a => a.id !== activityId) });
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8f0] via-[#fef3f8] to-[#f0f8ff]">

      {/* Nav */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push(`/dashboard?id=${profile.id}`)}
            className="text-sm text-[#a07060] hover:text-[#e8834a] font-semibold transition-colors flex items-center gap-1"
          >
            ← {profile.name}&apos;s Dashboard
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🌱</span>
            <span className="text-lg font-extrabold text-[#e8834a]">Growpace</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5 pb-16">

        {/* Title */}
        <div>
          <h1 className="text-2xl font-extrabold text-[#3d2c1e]">Activities</h1>
          <p className="text-[#a07060] text-sm mt-0.5">For {profile.name} · {calcAge(profile.dob)}</p>
        </div>

        {/* Tab bar */}
        <div className="bg-white rounded-2xl p-1 shadow-sm border border-orange-50 flex gap-1">
          {[
            { key: "suggested", label: "✨ Suggested" },
            { key: "library",   label: "📚 Library" },
            { key: "board",     label: `📋 My Board${activeActivities.length > 0 ? ` (${activeActivities.length})` : ""}` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all
                ${tab === t.key ? "bg-[#e8834a] text-white shadow-sm" : "text-[#a07060] hover:text-[#e8834a]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── SUGGESTED TAB ── */}
        {tab === "suggested" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-gradient-to-r from-[#e8834a] to-[#f4b98a] text-white font-bold px-3 py-1 rounded-full">
                  ✨ AI Personalised
                </span>
                <span className="text-xs text-[#a07060]">for {calcAge(profile.dob)}</span>
              </div>
              <button
                onClick={fetchSuggestions}
                disabled={loading}
                className="text-xs text-[#e8834a] font-bold hover:underline disabled:opacity-40 transition-opacity"
              >
                ↻ Refresh
              </button>
            </div>

            {aiError === "no_key" && (
              <div className="bg-[#fff8f0] rounded-2xl p-3 border border-orange-100 text-center">
                <p className="text-xs text-[#a07060]">
                  Showing curated suggestions ·{" "}
                  <span className="text-[#e8834a] font-bold">Add ANTHROPIC_API_KEY in Vercel</span>
                  {" "}for live AI suggestions
                </p>
              </div>
            )}

            {aiError === "failed" && !loading && (
              <div className="bg-[#fff8f0] rounded-2xl p-4 border border-orange-100 text-center">
                <p className="text-3xl mb-2">😕</p>
                <p className="text-[#a07060] text-sm font-semibold">Couldn&apos;t load suggestions.</p>
                <button onClick={fetchSuggestions} className="mt-2 text-xs text-[#e8834a] font-bold hover:underline">
                  Try again
                </button>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <div className="text-4xl animate-bounce mb-3">🤔</div>
                <p className="text-[#a07060] text-sm font-semibold">
                  Generating ideas for {profile.name}…
                </p>
              </div>
            )}

            {!loading && suggestions.map((s, i) => (
              <ActivityCard
                key={i}
                emoji={s.emoji}
                title={s.title}
                desc={s.desc}
                tag={s.tag}
                reason={s.reason}
                isAdded={addedTitles.has(s.title)}
                onAdd={() => addToBoard(s.title, s.emoji, s.desc, s.tag, "ai")}
              />
            ))}
          </div>
        )}

        {/* ── LIBRARY TAB ── */}
        {tab === "library" && (
          <div className="space-y-4">
            {/* Filter pills */}
            <div className="flex gap-2 flex-wrap">
              {ALL_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all
                    ${filterTag === tag
                      ? "bg-[#e8834a] text-white"
                      : "bg-white text-[#a07060] border border-orange-100 hover:border-[#e8834a]"
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {libraryActivities.map((a, i) => (
                <ActivityCard
                  key={i}
                  emoji={a.emoji}
                  title={a.title}
                  desc={a.desc}
                  tag={a.tag}
                  isAdded={addedTitles.has(a.title)}
                  onAdd={() => addToBoard(a.title, a.emoji, a.desc, a.tag, "library")}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── MY BOARD TAB ── */}
        {tab === "board" && (
          <div className="space-y-5">
            {board.length === 0 ? (
              <div className="bg-white rounded-2xl border border-orange-50 p-8 text-center">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-[#3d2c1e] font-bold">Your board is empty</p>
                <p className="text-[#a07060] text-sm mt-1 mb-4">
                  Browse suggestions or the library to add activities
                </p>
                <button
                  onClick={() => setTab("suggested")}
                  className="text-sm bg-[#e8834a] text-white font-bold px-5 py-2.5 rounded-full hover:bg-[#d6723b] transition-colors"
                >
                  Browse Suggestions ✨
                </button>
              </div>
            ) : (
              <>
                {/* Active this week */}
                {activeActivities.length > 0 && (
                  <div>
                    <h3 className="text-sm font-extrabold text-[#e8834a] mb-2 flex items-center gap-2">
                      🎯 Active This Week
                      <span className="bg-[#fff0e6] text-[#e8834a] text-xs px-2 py-0.5 rounded-full">
                        {activeActivities.length}
                      </span>
                    </h3>
                    <div className="space-y-3">
                      {activeActivities.map(a => (
                        <ActiveCard
                          key={a.id}
                          activity={a}
                          onProgress={p => setProgress(a.id, p)}
                          onDone={() => setStatus(a.id, "done")}
                          onPause={() => setStatus(a.id, "saved")}
                          onRemove={() => removeFromBoard(a.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Saved for later */}
                {savedActivities.length > 0 && (
                  <div>
                    <h3 className="text-sm font-extrabold text-[#a07060] mb-2 flex items-center gap-2">
                      💾 Saved for Later
                      <span className="bg-[#f5ebe0] text-[#a07060] text-xs px-2 py-0.5 rounded-full">
                        {savedActivities.length}
                      </span>
                    </h3>
                    <div className="space-y-3">
                      {savedActivities.map(a => (
                        <SavedCard
                          key={a.id}
                          activity={a}
                          onActivate={() => setStatus(a.id, "active")}
                          onRemove={() => removeFromBoard(a.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed */}
                {doneActivities.length > 0 && (
                  <div>
                    <h3 className="text-sm font-extrabold text-green-600 mb-2 flex items-center gap-2">
                      ✅ Completed
                      <span className="bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded-full">
                        {doneActivities.length}
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {doneActivities.map(a => (
                        <div
                          key={a.id}
                          className="bg-white rounded-2xl p-4 border border-green-50 flex items-center gap-3 opacity-70"
                        >
                          <span className="text-2xl">{a.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#3d2c1e] line-through">{a.title}</p>
                            <p className="text-xs text-green-600 font-semibold mt-0.5">✅ Completed</p>
                          </div>
                          <button
                            onClick={() => removeFromBoard(a.id)}
                            className="text-[#c4a898] hover:text-red-400 transition-colors text-xl leading-none"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

export default function ActivitiesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fff8f0]">
        <div className="text-4xl animate-bounce">🌱</div>
      </div>
    }>
      <Activities />
    </Suspense>
  );
}
