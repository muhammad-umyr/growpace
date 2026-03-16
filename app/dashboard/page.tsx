"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import {
  getProfile,
  saveProfile,
  getBoard,
  getNextMilestones,
  milestoneExpectedAge,
  calcAge,
  calcAgeMonths,
  calcProgressPercent,
  Profile,
  JournalEntry,
  MilestoneDef,
  BoardActivity,
} from "@/lib/store";

const TAG_COLORS: Record<string, string> = {
  Physical:  "bg-[#f0fbf4] text-green-600",
  Language:  "bg-[#f0f8ff] text-[#6baed6]",
  Cognitive: "bg-[#fdf4ff] text-purple-500",
  Creative:  "bg-[#fff8f0] text-[#e8834a]",
  Social:    "bg-[#fff0f5] text-pink-500",
  Sensory:   "bg-[#f5fff0] text-lime-600",
  Motor:     "bg-[#eff6ff] text-blue-500",
};

const JOURNAL_EMOJIS = ["🌟", "💪", "😊", "🎉", "❤️", "📝", "🏆", "🌈"];

function Dashboard() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [journalEmoji, setJournalEmoji] = useState("🌟");
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);

  useEffect(() => {
    if (id) setProfile(getProfile(id));
    setMounted(true);
  }, [id]);

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

  const age = calcAge(profile.dob);
  const ageMonths = calcAgeMonths(profile.dob);
  const progress = calcProgressPercent(profile.dob);
  const genderEmoji = profile.gender === "boy" ? "👦" : profile.gender === "girl" ? "👧" : "🌈";

  const board = getBoard(profile);
  const activeActivities = board.filter(a => a.status === "active");
  const nextMilestones = getNextMilestones(profile, 3);

  function update(updated: Profile) {
    setProfile(updated);
    saveProfile(updated);
  }

  function markMilestoneAccomplished(milestoneId: string) {
    const next = { ...profile!.milestones, [milestoneId]: true };
    const nextProgress = { ...profile!.milestoneProgress };
    delete nextProgress[milestoneId];
    update({ ...profile!, milestones: next, milestoneProgress: nextProgress });
    setExpandedMilestone(null);
  }

  function saveMilestoneStage(milestoneId: string, stageId: string) {
    update({
      ...profile!,
      milestoneProgress: { ...(profile!.milestoneProgress ?? {}), [milestoneId]: stageId },
    });
    setExpandedMilestone(null);
  }

  function addMilestoneToBoard(m: MilestoneDef) {
    const already = (profile!.board ?? []).some(a => a.id === `milestone-${m.id}`);
    if (already) return;
    const activity: BoardActivity = {
      id: `milestone-${m.id}`,
      title: m.label,
      emoji: m.emoji,
      desc: m.tip,
      tag: m.tag,
      status: "saved",
      addedAt: new Date().toISOString(),
      progress: 0,
      source: "library",
    };
    update({ ...profile!, board: [...(profile!.board ?? []), activity] });
  }

  function addJournalEntry() {
    if (!journalText.trim()) return;
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      text: journalText.trim(),
      date: new Date().toISOString(),
      emoji: journalEmoji,
    };
    update({ ...profile!, journal: [entry, ...profile!.journal] });
    setJournalText("");
    setShowJournalForm(false);
  }

  function deleteJournalEntry(entryId: string) {
    update({ ...profile!, journal: profile!.journal.filter(e => e.id !== entryId) });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8f0] via-[#fef3f8] to-[#f0f8ff]">

      {/* Nav */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <span className="text-xl font-extrabold text-[#e8834a]">Growpace</span>
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/report?id=${profile.id}`)}
              className="text-sm text-[#a07060] hover:text-[#e8834a] font-semibold transition-colors"
            >
              📄 Report
            </button>
            <button
              onClick={() => router.push("/")}
              className="text-sm text-[#a07060] hover:text-[#e8834a] font-semibold transition-colors"
            >
              + Add Child
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Profile card */}
        <div className="bg-white rounded-3xl p-6">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 rounded-full bg-[#fff0e6] border-4 border-[#f4b98a] overflow-hidden flex-shrink-0 flex items-center justify-center">
              {profile.photo ? (
                <Image src={profile.photo} alt={profile.name} fill className="object-cover" unoptimized />
              ) : (
                <span className="text-4xl">{genderEmoji}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold text-[#3d2c1e] truncate">{profile.name}</h1>
              <p className="text-[#e8834a] font-semibold text-base mt-0.5">{age}</p>
              <p className="text-[#c4a898] text-sm mt-0.5">
                Born {new Date(profile.dob).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>

          {/* Journey progress bar */}
          <div className="mt-5">
            <div className="flex justify-between text-sm text-[#a07060] mb-1.5 font-semibold">
              <span>Birth</span>
              <span className="text-[#e8834a]">{progress}% of journey</span>
              <span>Age 7</span>
            </div>
            <div className="h-3 bg-[#f5ebe0] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#f4b98a] to-[#e8834a] rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Weekly Activities */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold text-[#3d2c1e]">🎯 This Week&apos;s Activities</h2>
            <button
              onClick={() => router.push(`/activities?id=${profile.id}`)}
              className="text-sm text-[#e8834a] font-bold hover:underline transition-colors"
            >
              View all →
            </button>
          </div>

          {activeActivities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-orange-50 p-6 text-center">
              <p className="text-3xl mb-2">🎯</p>
              <p className="text-[#3d2c1e] font-bold text-base">No active activities this week</p>
              <p className="text-[#a07060] text-sm mt-1 mb-3">
                Browse the library to find activities for {profile.name}
              </p>
              <button
                onClick={() => router.push(`/activities?id=${profile.id}`)}
                className="text-sm bg-[#e8834a] text-white font-bold px-5 py-2 rounded-full hover:bg-[#d6723b] transition-colors"
              >
                Explore Activities ✨
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeActivities.map(a => (
                <div key={a.id} className="bg-white rounded-2xl p-4 border border-orange-50">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#fff8f0] flex items-center justify-center text-2xl flex-shrink-0">
                      {a.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-[#3d2c1e] text-base">{a.title}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[a.tag] ?? "bg-gray-100 text-gray-500"}`}>
                          {a.tag}
                        </span>
                      </div>
                      <p className="text-[#a07060] text-sm mt-0.5">{a.desc}</p>
                      {/* Mini progress bar */}
                      <div className="flex gap-1 mt-2">
                        {[25, 50, 75, 100].map(step => (
                          <div
                            key={step}
                            className={`flex-1 h-1.5 rounded-full ${a.progress >= step ? "bg-[#e8834a]" : "bg-[#f5ebe0]"}`}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-[#c4a898] mt-0.5">{a.progress}% complete</p>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => router.push(`/activities?id=${profile.id}`)}
                className="w-full py-2.5 rounded-2xl border-2 border-dashed border-[#f4b98a] text-[#e8834a] font-bold text-sm hover:bg-[#fff8f0] transition-colors"
              >
                + Add more activities
              </button>
            </div>
          )}
        </section>

        {/* What's next */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold text-[#3d2c1e]">🎯 What&apos;s next for {profile.name}</h2>
            <button
              onClick={() => router.push(`/onboarding?id=${profile.id}`)}
              className="text-sm text-[#a07060] hover:text-[#e8834a] font-semibold transition-colors"
            >
              Edit ✏️
            </button>
          </div>

          {nextMilestones.length === 0 ? (
            <div className="bg-white rounded-2xl border border-orange-50 p-6 text-center">
              <p className="text-4xl mb-2">🏆</p>
              <p className="text-[#3d2c1e] font-extrabold">All milestones reached!</p>
              <p className="text-[#a07060] text-sm mt-1">
                {profile.name} is absolutely thriving. Keep it up!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {nextMilestones.map((m, i) => {
                const isOverdue = m.minMonths <= ageMonths;
                const isExpanded = expandedMilestone === m.id;
                const savedStage = (profile!.milestoneProgress ?? {})[m.id];
                const onBoard = (profile!.board ?? []).some(a => a.id === `milestone-${m.id}`);
                return (
                  <div
                    key={m.id}
                    className="bg-white rounded-2xl border border-orange-50 overflow-hidden"
                  >
                    <div className="p-4 flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#fff3e8] to-[#fde8d8] flex items-center justify-center text-3xl flex-shrink-0 shadow-sm">
                        {m.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-[#3d2c1e] text-base leading-tight">{m.label}</h3>
                          {isOverdue ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-500">Around their age</span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f0f8ff] text-[#6baed6]">Coming up</span>
                          )}
                        </div>
                        <p className="text-[#c4a898] text-sm mt-0.5">Expected {milestoneExpectedAge(m.minMonths)}</p>
                        <p className="text-[#7a5c4a] text-sm mt-2 leading-relaxed">{m.tip}</p>
                        {savedStage && !isExpanded && (() => {
                          const stage = m.stages.find(s => s.id === savedStage);
                          return stage ? (
                            <div className="mt-2 bg-amber-50 rounded-xl p-2.5">
                              <p className="text-[10px] font-bold text-amber-600 mb-1">📍 {stage.label}</p>
                              <p className="text-[10px] text-amber-700 leading-relaxed">{stage.nextTip}</p>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </div>

                    {/* Stage picker — shown when expanded */}
                    {isExpanded && (
                      <div className="px-4 pb-3">
                        <p className="text-sm font-bold text-[#3d2c1e] mb-2">Where is {profile!.name} right now?</p>
                        <div className="space-y-2">
                          {m.stages.map((stage, si) => (
                            <button
                              key={stage.id}
                              onClick={() => saveMilestoneStage(m.id, stage.id)}
                              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all
                                ${savedStage === stage.id
                                  ? "border-amber-400 bg-amber-50"
                                  : "border-[#f0ddd0] bg-[#fffaf7] hover:border-amber-300"
                                }`}
                            >
                              <span className="text-sm font-extrabold text-amber-400 mt-0.5 flex-shrink-0">{si + 1}</span>
                              <span className="text-sm font-semibold leading-tight text-[#3d2c1e]">{stage.label}</span>
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setExpandedMilestone(null)}
                          className="mt-2 text-sm text-[#c4a898] hover:text-[#a07060] font-semibold w-full text-center"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* 3 CTAs */}
                    <div className="border-t border-[#f5ebe0] px-3 py-2.5 grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => setExpandedMilestone(isExpanded ? null : m.id)}
                        className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors text-center"
                      >
                        <span className="text-[10px] font-bold text-amber-600 leading-tight">In progress</span>
                      </button>
                      <button
                        onClick={() => addMilestoneToBoard(m)}
                        className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl transition-colors text-center
                          ${onBoard ? "bg-[#f0f8ff] opacity-60 cursor-default" : "bg-[#f0f8ff] hover:bg-blue-100"}`}
                      >
                        <span className="text-[10px] font-bold text-blue-500 leading-tight">
                          {onBoard ? "On board" : "Add to board"}
                        </span>
                      </button>
                      <button
                        onClick={() => markMilestoneAccomplished(m.id)}
                        className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl bg-[#f0fbf4] hover:bg-green-100 transition-colors text-center"
                      >
                        <span className="text-[10px] font-bold text-green-600 leading-tight">Accomplished!</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Growth Journal */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold text-[#3d2c1e]">📔 Growth Journal</h2>
            <button
              onClick={() => setShowJournalForm(v => !v)}
              className="text-sm bg-[#e8834a] text-white font-bold px-3 py-1.5 rounded-full hover:bg-[#d6723b] transition-colors"
            >
              {showJournalForm ? "Cancel" : "+ Add moment"}
            </button>
          </div>

          {showJournalForm && (
            <div className="bg-white rounded-2xl border border-orange-50 p-4 mb-3 space-y-3">
              {/* Emoji picker */}
              <div className="flex gap-2 flex-wrap">
                {JOURNAL_EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => setJournalEmoji(e)}
                    className={`w-9 h-9 rounded-full text-xl flex items-center justify-center transition-all
                      ${journalEmoji === e ? "bg-[#fff3eb] scale-110 shadow-sm" : "hover:bg-[#fff8f0]"}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <textarea
                value={journalText}
                onChange={e => setJournalText(e.target.value)}
                placeholder={`What did ${profile.name} do today? A first word, a big step, a funny moment…`}
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#f0ddd0] bg-[#fffaf7] focus:outline-none focus:border-[#e8834a] text-[#3d2c1e] placeholder-[#c4a898] text-base resize-none h-24 transition-colors"
              />
              <button
                onClick={addJournalEntry}
                disabled={!journalText.trim()}
                className="w-full py-2.5 rounded-2xl bg-[#e8834a] hover:bg-[#d6723b] disabled:opacity-40 text-white font-bold text-base transition-colors"
              >
                Save moment
              </button>
            </div>
          )}

          {profile.journal.length === 0 && !showJournalForm ? (
            <div className="bg-white rounded-2xl border border-orange-50 p-6 text-center">
              <p className="text-4xl mb-2">📝</p>
              <p className="text-[#a07060] text-base font-semibold">No moments logged yet.</p>
              <p className="text-[#c4a898] text-sm mt-1">Start capturing {profile.name}&apos;s journey!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {profile.journal.map(entry => (
                <div key={entry.id} className="bg-white rounded-2xl border border-orange-50 p-4 flex items-start gap-3">
                  <span className="text-2xl mt-0.5 flex-shrink-0">{entry.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#3d2c1e] text-base font-medium leading-relaxed">{entry.text}</p>
                    <p className="text-[#c4a898] text-sm mt-1">
                      {new Date(entry.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteJournalEntry(entry.id)}
                    className="text-[#c4a898] hover:text-red-400 transition-colors text-xl flex-shrink-0 leading-none"
                    title="Delete entry"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick insights */}
        <section className="grid grid-cols-2 gap-3 pb-8">
          <div className="bg-[#fff8f0] rounded-2xl p-4 border border-orange-100">
            <p className="text-2xl mb-1">💬</p>
            <p className="text-sm font-bold text-[#3d2c1e]">Language</p>
            <p className="text-sm text-[#a07060] mt-0.5">On track for age</p>
          </div>
          <div className="bg-[#f0fbf4] rounded-2xl p-4 border border-green-100">
            <p className="text-2xl mb-1">🏃</p>
            <p className="text-sm font-bold text-[#3d2c1e]">Motor Skills</p>
            <p className="text-sm text-[#a07060] mt-0.5">Developing well</p>
          </div>
          <div className="bg-[#f0f8ff] rounded-2xl p-4 border border-blue-100">
            <p className="text-2xl mb-1">🤝</p>
            <p className="text-sm font-bold text-[#3d2c1e]">Social</p>
            <p className="text-sm text-[#a07060] mt-0.5">Ready to explore</p>
          </div>
          <div className="bg-[#fdf4ff] rounded-2xl p-4 border border-purple-100">
            <p className="text-2xl mb-1">🧠</p>
            <p className="text-sm font-bold text-[#3d2c1e]">Cognitive</p>
            <p className="text-sm text-[#a07060] mt-0.5">Growing fast</p>
          </div>
        </section>

      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fff8f0]">
        <div className="text-4xl animate-bounce">🌱</div>
      </div>
    }>
      <Dashboard />
    </Suspense>
  );
}
