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
  PROGRESS_STAGES,
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
  Physical:  "bg-[#EDF3F0] text-[#202837]",
  Language:  "bg-[#EEEDF8] text-[#202837]",
  Cognitive: "bg-[#EEEDF8] text-[#202837]",
  Creative:  "bg-[#EDF3F0] text-[#AA6646]",
  Social:    "bg-[#EEEDF8] text-[#202837]",
  Sensory:   "bg-[#EDF3F0] text-[#202837]",
  Motor:     "bg-[#EEEDF8] text-[#202837]",
};

const ALL_TAGS = ["All", "Physical", "Language", "Cognitive", "Creative", "Social", "Sensory", "Motor"];

// ── Sub-components ────────────────────────────────────────────────────────────

function ActivityCard({
  emoji, image, title, desc, tag, reason, isAdded, onAdd, howTo, videoQuery,
}: {
  emoji: string; image?: string; title: string; desc: string; tag: string;
  reason?: string; isAdded: boolean; onAdd: () => void;
  howTo?: string[]; videoQuery?: string;
}) {
  const [showTips, setShowTips] = useState(false);
  const watchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    videoQuery ?? `${title} for babies and toddlers`
  )}`;

  return (
    <div className="bg-white rounded-2xl border border-[#E4E2F2] overflow-hidden">

      {/* Body */}
      <div className="p-4 flex gap-4 items-start">
        {/* Thumbnail */}
        {image ? (
          <div className="w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm bg-[#F4F3FC]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        ) : (
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#F4F3FC] to-[#D4DFDD] flex items-center justify-center text-5xl flex-shrink-0 shadow-sm">
            {emoji}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[tag] ?? "bg-gray-100 text-gray-500"}`}>
            {tag}
          </span>
          <h3 className="font-extrabold text-[#0A1338] text-base leading-tight mt-1">{title}</h3>
          <p className="text-[#202837] text-sm mt-0.5 leading-relaxed">{desc}</p>
          {reason && (
            <span className="inline-flex items-center gap-1 mt-2 bg-gradient-to-r from-[#F4F3FC] to-[#EEEDF8] border border-[#D4DFDD] text-[#202837] text-[10px] font-bold px-2.5 py-1 rounded-full">
              ✨ {reason}
            </span>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="border-t border-[#E4E2F2] px-4 py-2.5 flex items-center gap-2">
        {howTo?.length ? (
          <button
            onClick={() => setShowTips(v => !v)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors
              ${showTips ? "bg-[#EDF3F0] text-[#202837]" : "bg-[#E4E2F2] text-[#202837] hover:text-[#202837]"}`}
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
              ? "bg-[#E4E2F2] text-[#8FA4A6] cursor-default"
              : "bg-[#202837] text-white hover:bg-[#141D28] shadow-sm"
            }`}
        >
          {isAdded ? "✓ Added" : "+ Board"}
        </button>
      </div>

      {/* Expandable tips */}
      {showTips && howTo && (
        <div className="bg-[#F7F7FB] border-t border-[#E4E2F2] px-4 py-4">
          <ol className="space-y-3">
            {howTo.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[#202837] leading-relaxed">
                <span className="w-5 h-5 rounded-full bg-[#EDF3F0] text-[#202837] font-extrabold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
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
  activity, profileId, onDone, onPause, onRemove,
}: {
  activity: BoardActivity;
  profileId: string;
  onDone: () => void;
  onPause: () => void;
  onRemove: () => void;
}) {
  const router = useRouter();
  const currentStage = PROGRESS_STAGES.find(s => s.value === activity.progress);

  return (
    <div className="bg-white rounded-2xl border border-[#D4DFDD] p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-[#EEEDF8] flex items-center justify-center text-2xl flex-shrink-0">
          {activity.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-[#0A1338] text-base">{activity.title}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[activity.tag] ?? "bg-gray-100 text-gray-500"}`}>
              {activity.tag}
            </span>
          </div>
          <p className="text-[#202837] text-sm mt-0.5">{activity.desc}</p>
        </div>
        <button onClick={onRemove} className="text-[#8FA4A6] hover:text-red-400 transition-colors text-xl flex-shrink-0 leading-none">
          ×
        </button>
      </div>

      {/* Contextual progress */}
      <div className="bg-[#F7F7FB] rounded-xl px-3 py-2.5 flex items-center justify-between gap-3">
        <div className="flex gap-1.5 flex-1">
          {PROGRESS_STAGES.map(stage => (
            <div
              key={stage.value}
              className={`flex-1 h-1.5 rounded-full transition-colors ${activity.progress >= stage.value ? "bg-[#B2ADEB]" : "bg-[#E4E2F2]"}`}
            />
          ))}
        </div>
        <span className="text-xs font-bold text-[#202837] whitespace-nowrap flex-shrink-0">
          {currentStage ? currentStage.short : "Not started"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => router.push(`/activity?profileId=${profileId}&activityId=${activity.id}`)}
          className="flex-1 h-12 flex items-center justify-center rounded-xl bg-[#EEEDF8] text-[#202837] font-bold text-xs hover:bg-[#E4E2F2] transition-colors border border-[#D4DFDD]"
        >
          Log a progress update
        </button>
        <button
          onClick={onDone}
          className="h-12 px-3 flex items-center justify-center rounded-xl bg-[#EDF3F0] text-[#202837] font-bold text-xs hover:bg-[#D4DFDD] transition-colors border border-[#D4DFDD]"
        >
          ✅ Done
        </button>
        <button
          onClick={onPause}
          className="h-12 px-3 flex items-center justify-center rounded-xl bg-[#E4E2F2] text-[#202837] font-bold text-xs hover:bg-[#D4DFDD] transition-colors"
        >
          ⏸ Later
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
    <div className="bg-white rounded-2xl border border-[#E4E2F2] p-4 flex items-start gap-3">
      <div className="w-11 h-11 rounded-2xl bg-[#f5f5f5] flex items-center justify-center text-2xl flex-shrink-0 opacity-70">
        {activity.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-[#202837] text-base">{activity.title}</p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full opacity-60 ${TAG_COLORS[activity.tag] ?? "bg-gray-100 text-gray-500"}`}>
            {activity.tag}
          </span>
        </div>
        <p className="text-[#8FA4A6] text-sm mt-0.5">{activity.desc}</p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={onActivate}
            className="text-xs bg-[#202837] text-white font-bold px-3 py-1 rounded-full hover:bg-[#141D28] transition-colors"
          >
            Start This Week →
          </button>
          <button
            onClick={onRemove}
            className="text-xs text-[#8FA4A6] hover:text-red-400 transition-colors font-semibold"
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
        setAiError(data.detail ?? "failed");
      }
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "failed");
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#EEEDF8] gap-4">
        <span className="text-5xl">🌱</span>
        <p className="text-[#202837] font-semibold">Profile not found.</p>
        <button onClick={() => router.push("/")} className="text-[#202837] font-bold hover:underline">
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
      progressLog: [],
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

  function removeFromBoard(activityId: string) {
    update({ ...profile!, board: board.filter(a => a.id !== activityId) });
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F3FC] via-[#EEEDF8] to-[#EDF3F0]">

      {/* Nav */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#D4DFDD] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push(`/dashboard?id=${profile.id}`)}
            className="text-sm text-[#202837] hover:text-[#202837] font-semibold transition-colors flex items-center gap-1"
          >
            ← {profile.name}&apos;s Dashboard
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-extrabold text-[#202837]">Growpace</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5 pb-16">

        {/* Title */}
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A1338]">Activities</h1>
          <p className="text-[#202837] text-base mt-0.5">For {profile.name} · {calcAge(profile.dob)}</p>
        </div>

        {/* Tab bar */}
        <div className="bg-white rounded-2xl p-1 border border-[#E4E2F2] flex gap-1">
          {[
            { key: "suggested", label: "✨ Suggested" },
            { key: "library",   label: "📚 Library" },
            { key: "board",     label: `📋 My Board${activeActivities.length > 0 ? ` (${activeActivities.length})` : ""}` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all
                ${tab === t.key ? "bg-[#202837] text-white shadow-sm" : "text-[#202837] hover:text-[#202837]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── SUGGESTED TAB ── */}
        {tab === "suggested" && (
          <div className="space-y-3">

            {/* Personalisation banner */}
            <div className="rounded-2xl bg-gradient-to-r from-[#F4F3FC] to-[#EEEDF8] border border-[#D4DFDD] p-4 flex items-center gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-[#EDF3F0] border-2 border-[#B2ADEB] flex items-center justify-center flex-shrink-0 text-2xl">
                {profile.gender === "boy" ? "👦" : profile.gender === "girl" ? "👧" : "🌈"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-[#0A1338]">
                  Just for {profile.name} ✨
                </p>
                <p className="text-sm text-[#202837] mt-0.5">
                  Picked for a {calcAge(profile.dob)} — refreshed every week
                </p>
              </div>
              <button
                onClick={fetchSuggestions}
                disabled={loading}
                className="flex-shrink-0 text-xs text-[#202837] font-bold hover:underline disabled:opacity-40 transition-opacity"
              >
                ↻ Refresh
              </button>
            </div>

            {aiError === "no_key" && (
              <div className="bg-[#EEEDF8] rounded-2xl p-3 border border-[#D4DFDD] text-center">
                <p className="text-sm text-[#202837]">
                  Showing curated suggestions ·{" "}
                  <span className="text-[#202837] font-bold">Add ANTHROPIC_API_KEY in Vercel</span>
                  {" "}for live AI suggestions
                </p>
              </div>
            )}

            {aiError && aiError !== "no_key" && !loading && (
              <div className="bg-[#EEEDF8] rounded-2xl p-4 border border-[#D4DFDD] text-center">
                <p className="text-3xl mb-2">😕</p>
                <p className="text-[#202837] text-base font-semibold">Couldn&apos;t load suggestions.</p>
                {aiError !== "failed" && (
                  <p className="text-[10px] text-[#8FA4A6] mt-1 font-mono break-all">{aiError}</p>
                )}
                <button onClick={fetchSuggestions} className="mt-2 text-xs text-[#202837] font-bold hover:underline">
                  Try again
                </button>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <div className="text-4xl animate-bounce mb-3">🤔</div>
                <p className="text-[#202837] text-base font-semibold">
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
                      ? "bg-[#202837] text-white"
                      : "bg-white text-[#202837] border border-[#D4DFDD] hover:border-[#202837]"
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
                  image={a.image}
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
              <div className="bg-white rounded-2xl border border-[#E4E2F2] p-8 text-center">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-[#0A1338] font-bold">Your board is empty</p>
                <p className="text-[#202837] text-base mt-1 mb-4">
                  Browse suggestions or the library to add activities
                </p>
                <button
                  onClick={() => setTab("suggested")}
                  className="text-sm bg-[#202837] text-white font-bold px-5 py-2.5 rounded-full hover:bg-[#141D28] transition-colors"
                >
                  Browse Suggestions ✨
                </button>
              </div>
            ) : (
              <>
                {/* Active this week */}
                {activeActivities.length > 0 && (
                  <div>
                    <h3 className="text-sm font-extrabold text-[#202837] mb-2 flex items-center gap-2">
                      🎯 Active This Week
                      <span className="bg-[#EDF3F0] text-[#202837] text-xs px-2 py-0.5 rounded-full">
                        {activeActivities.length}
                      </span>
                    </h3>
                    <div className="space-y-3">
                      {activeActivities.map(a => (
                        <ActiveCard
                          key={a.id}
                          activity={a}
                          profileId={profile.id}
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
                    <h3 className="text-sm font-extrabold text-[#202837] mb-2 flex items-center gap-2">
                      💾 Saved for Later
                      <span className="bg-[#E4E2F2] text-[#202837] text-xs px-2 py-0.5 rounded-full">
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
                    <h3 className="text-sm font-extrabold text-[#202837] mb-2 flex items-center gap-2">
                      ✅ Completed
                      <span className="bg-[#FDF3EE] text-[#AA6646] text-xs px-2 py-0.5 rounded-full">
                        {doneActivities.length}
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {doneActivities.map(a => (
                        <div
                          key={a.id}
                          className="bg-white rounded-2xl p-4 border border-[#EDF3F0] flex items-center gap-3 opacity-70"
                        >
                          <span className="text-2xl">{a.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-bold text-[#0A1338] line-through">{a.title}</p>
                            <p className="text-xs text-[#AA6646] font-semibold mt-0.5">✅ Completed</p>
                          </div>
                          <button
                            onClick={() => removeFromBoard(a.id)}
                            className="text-[#8FA4A6] hover:text-red-400 transition-colors text-xl leading-none"
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
      <div className="min-h-screen flex items-center justify-center bg-[#EEEDF8]">
        <div className="text-4xl animate-bounce">🌱</div>
      </div>
    }>
      <Activities />
    </Suspense>
  );
}
