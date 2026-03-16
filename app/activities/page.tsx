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
  Language:  "bg-[#EEF2F9] text-[#6baed6]",
  Cognitive: "bg-[#fdf4ff] text-purple-500",
  Creative:  "bg-[#F0FAF8] text-[#2D8C7A]",
  Social:    "bg-[#fff0f5] text-pink-500",
  Sensory:   "bg-[#f5fff0] text-lime-600",
  Motor:     "bg-[#eff6ff] text-blue-500",
};

const ALL_TAGS = ["All", "Physical", "Language", "Cognitive", "Creative", "Social", "Sensory", "Motor"];

// ── Sub-components ────────────────────────────────────────────────────────────

function ActivityCard({
  emoji, title, desc, tag, reason, isAdded, onAdd, howTo, videoQuery,
}: {
  emoji: string; title: string; desc: string; tag: string;
  reason?: string; isAdded: boolean; onAdd: () => void;
  howTo?: string[]; videoQuery?: string;
}) {
  const [showTips, setShowTips] = useState(false);
  const watchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    videoQuery ?? `${title} for babies and toddlers`
  )}`;

  return (
    <div className="bg-white rounded-2xl border border-[#EDE9F5] overflow-hidden">

      {/* Body */}
      <div className="p-4 flex gap-4 items-start">
        {/* Emoji */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F0FAF8] to-[#D5EDE9] flex items-center justify-center text-3xl flex-shrink-0 shadow-sm">
          {emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[tag] ?? "bg-gray-100 text-gray-500"}`}>
            {tag}
          </span>
          <h3 className="font-extrabold text-[#0F1E29] text-base leading-tight mt-1">{title}</h3>
          <p className="text-[#7A6E8A] text-sm mt-0.5 leading-relaxed">{desc}</p>
          {reason && (
            <span className="inline-flex items-center gap-1 mt-2 bg-gradient-to-r from-[#F0FAF8] to-[#F7F4FC] border border-[#E2DCF0] text-[#2D8C7A] text-[10px] font-bold px-2.5 py-1 rounded-full">
              ✨ {reason}
            </span>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="border-t border-[#EDE9F5] px-4 py-2.5 flex items-center gap-2">
        {howTo?.length ? (
          <button
            onClick={() => setShowTips(v => !v)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors
              ${showTips ? "bg-[#EDF7F5] text-[#2D8C7A]" : "bg-[#EDE9F5] text-[#7A6E8A] hover:text-[#2D8C7A]"}`}
          >
            📋 How to {showTips ? "▲" : "▾"}
          </button>
        ) : null}
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-red-50 text-red-500 font-bold px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors flex items-center gap-1"
        >
          ▶ Watch
        </a>
        <div className="flex-1" />
        <button
          onClick={onAdd}
          disabled={isAdded}
          className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all
            ${isAdded
              ? "bg-[#EDE9F5] text-[#A89EC0] cursor-default"
              : "bg-[#2D8C7A] text-white hover:bg-[#1E6B5A] shadow-sm"
            }`}
        >
          {isAdded ? "✓ Added" : "+ Board"}
        </button>
      </div>

      {/* Expandable tips */}
      {showTips && howTo && (
        <div className="bg-[#FAF8FD] border-t border-[#EDE9F5] px-4 py-4">
          <ol className="space-y-3">
            {howTo.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[#7A6E8A] leading-relaxed">
                <span className="w-5 h-5 rounded-full bg-[#EDF7F5] text-[#2D8C7A] font-extrabold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ol>
        </div>
      )}

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
    <div className="bg-white rounded-2xl border border-[#E2DCF0] p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-[#F0FAF8] flex items-center justify-center text-2xl flex-shrink-0">
          {activity.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-[#0F1E29] text-base">{activity.title}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[activity.tag] ?? "bg-gray-100 text-gray-500"}`}>
              {activity.tag}
            </span>
          </div>
          <p className="text-[#7A6E8A] text-sm mt-0.5">{activity.desc}</p>
        </div>
        <button onClick={onRemove} className="text-[#A89EC0] hover:text-red-400 transition-colors text-xl flex-shrink-0 leading-none">
          ×
        </button>
      </div>

      {/* Progress tapper */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-[#7A6E8A] font-semibold">Weekly progress</span>
          <span className="text-xs font-bold text-[#2D8C7A]">{activity.progress}%</span>
        </div>
        <div className="flex gap-1.5">
          {[25, 50, 75, 100].map(step => (
            <button
              key={step}
              onClick={() => onProgress(activity.progress === step ? Math.max(0, step - 25) : step)}
              className={`flex-1 h-3 rounded-full transition-colors
                ${activity.progress >= step ? "bg-[#2D8C7A]" : "bg-[#EDE9F5] hover:bg-[#E2DCF0]"}`}
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
          className="flex-1 py-2 rounded-xl bg-[#EDE9F5] text-[#7A6E8A] font-bold text-xs hover:bg-[#E2DCF0] transition-colors"
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
    <div className="bg-white rounded-2xl border border-[#EDE9F5] p-4 flex items-start gap-3">
      <div className="w-11 h-11 rounded-2xl bg-[#f5f5f5] flex items-center justify-center text-2xl flex-shrink-0 opacity-70">
        {activity.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-[#7A6E8A] text-base">{activity.title}</p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full opacity-60 ${TAG_COLORS[activity.tag] ?? "bg-gray-100 text-gray-500"}`}>
            {activity.tag}
          </span>
        </div>
        <p className="text-[#A89EC0] text-sm mt-0.5">{activity.desc}</p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={onActivate}
            className="text-xs bg-[#2D8C7A] text-white font-bold px-3 py-1 rounded-full hover:bg-[#1E6B5A] transition-colors"
          >
            Start This Week →
          </button>
          <button
            onClick={onRemove}
            className="text-xs text-[#A89EC0] hover:text-red-400 transition-colors font-semibold"
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
          .map(a => ({ ...a, reason: `Curated for ${profile.name} · ${calcAge(profile.dob)}` }));
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0FAF8] gap-4">
        <span className="text-5xl">🌱</span>
        <p className="text-[#7A6E8A] font-semibold">Profile not found.</p>
        <button onClick={() => router.push("/")} className="text-[#2D8C7A] font-bold hover:underline">
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
    <div className="min-h-screen bg-gradient-to-br from-[#F0FAF8] via-[#F7F4FC] to-[#EEF2F9]">

      {/* Nav */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#E2DCF0] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push(`/dashboard?id=${profile.id}`)}
            className="text-sm text-[#7A6E8A] hover:text-[#2D8C7A] font-semibold transition-colors flex items-center gap-1"
          >
            ← {profile.name}&apos;s Dashboard
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-extrabold text-[#2D8C7A]">Growpace</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5 pb-16">

        {/* Title */}
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F1E29]">Activities</h1>
          <p className="text-[#7A6E8A] text-base mt-0.5">For {profile.name} · {calcAge(profile.dob)}</p>
        </div>

        {/* Tab bar */}
        <div className="bg-white rounded-2xl p-1 border border-[#EDE9F5] flex gap-1">
          {[
            { key: "suggested", label: "✨ Suggested" },
            { key: "library",   label: "📚 Library" },
            { key: "board",     label: `📋 My Board${activeActivities.length > 0 ? ` (${activeActivities.length})` : ""}` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all
                ${tab === t.key ? "bg-[#2D8C7A] text-white shadow-sm" : "text-[#7A6E8A] hover:text-[#2D8C7A]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── SUGGESTED TAB ── */}
        {tab === "suggested" && (
          <div className="space-y-3">

            {/* Personalisation banner */}
            <div className="rounded-2xl bg-gradient-to-r from-[#F0FAF8] to-[#F7F4FC] border border-[#E2DCF0] p-4 flex items-center gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-[#EDF7F5] border-2 border-[#A8D5CC] flex items-center justify-center flex-shrink-0 text-2xl">
                {profile.gender === "boy" ? "👦" : profile.gender === "girl" ? "👧" : "🌈"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-[#0F1E29]">
                  Just for {profile.name} ✨
                </p>
                <p className="text-sm text-[#7A6E8A] mt-0.5">
                  Picked for a {calcAge(profile.dob)} — refreshed every week
                </p>
              </div>
              <button
                onClick={fetchSuggestions}
                disabled={loading}
                className="flex-shrink-0 text-xs text-[#2D8C7A] font-bold hover:underline disabled:opacity-40 transition-opacity"
              >
                ↻ Refresh
              </button>
            </div>

            {aiError === "no_key" && (
              <div className="bg-[#F0FAF8] rounded-2xl p-3 border border-[#E2DCF0] text-center">
                <p className="text-sm text-[#7A6E8A]">
                  Showing curated suggestions ·{" "}
                  <span className="text-[#2D8C7A] font-bold">Add ANTHROPIC_API_KEY in Vercel</span>
                  {" "}for live AI suggestions
                </p>
              </div>
            )}

            {aiError === "failed" && !loading && (
              <div className="bg-[#F0FAF8] rounded-2xl p-4 border border-[#E2DCF0] text-center">
                <p className="text-3xl mb-2">😕</p>
                <p className="text-[#7A6E8A] text-base font-semibold">Couldn&apos;t load suggestions.</p>
                <button onClick={fetchSuggestions} className="mt-2 text-xs text-[#2D8C7A] font-bold hover:underline">
                  Try again
                </button>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <div className="text-4xl animate-bounce mb-3">🤔</div>
                <p className="text-[#7A6E8A] text-base font-semibold">
                  Finding the best activities for {profile.name}…
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
                      ? "bg-[#2D8C7A] text-white"
                      : "bg-white text-[#7A6E8A] border border-[#E2DCF0] hover:border-[#2D8C7A]"
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
                  howTo={a.howTo}
                  videoQuery={a.videoQuery}
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
              <div className="bg-white rounded-2xl border border-[#EDE9F5] p-8 text-center">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-[#0F1E29] font-bold">Your board is empty</p>
                <p className="text-[#7A6E8A] text-base mt-1 mb-4">
                  Browse suggestions or the library to add activities
                </p>
                <button
                  onClick={() => setTab("suggested")}
                  className="text-sm bg-[#2D8C7A] text-white font-bold px-5 py-2.5 rounded-full hover:bg-[#1E6B5A] transition-colors"
                >
                  Browse Suggestions ✨
                </button>
              </div>
            ) : (
              <>
                {/* Active this week */}
                {activeActivities.length > 0 && (
                  <div>
                    <h3 className="text-sm font-extrabold text-[#2D8C7A] mb-2 flex items-center gap-2">
                      🎯 Active This Week
                      <span className="bg-[#EDF7F5] text-[#2D8C7A] text-xs px-2 py-0.5 rounded-full">
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
                    <h3 className="text-sm font-extrabold text-[#7A6E8A] mb-2 flex items-center gap-2">
                      💾 Saved for Later
                      <span className="bg-[#EDE9F5] text-[#7A6E8A] text-xs px-2 py-0.5 rounded-full">
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
                            <p className="text-base font-bold text-[#0F1E29] line-through">{a.title}</p>
                            <p className="text-xs text-green-600 font-semibold mt-0.5">✅ Completed</p>
                          </div>
                          <button
                            onClick={() => removeFromBoard(a.id)}
                            className="text-[#A89EC0] hover:text-red-400 transition-colors text-xl leading-none"
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
      <div className="min-h-screen flex items-center justify-center bg-[#F0FAF8]">
        <div className="text-4xl animate-bounce">🌱</div>
      </div>
    }>
      <Activities />
    </Suspense>
  );
}
