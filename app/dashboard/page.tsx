"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect, useRef } from "react";
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
  PROGRESS_STAGES,
  Profile,
  JournalEntry,
  MilestoneDef,
  BoardActivity,
  Caregiver,
  CaregiverRole,
} from "@/lib/store";

const TAG_COLORS: Record<string, string> = {
  Physical:  "bg-[#EDF3F0] text-[#1F2937]",
  Language:  "bg-[#F0F0F0] text-[#1F2937]",
  Cognitive: "bg-[#F0F0F0] text-[#1F2937]",
  Creative:  "bg-[#EDF3F0] text-[#AA6646]",
  Social:    "bg-[#F0F0F0] text-[#1F2937]",
  Sensory:   "bg-[#EDF3F0] text-[#1F2937]",
  Motor:     "bg-[#F0F0F0] text-[#1F2937]",
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
  const [showAddCaregiver, setShowAddCaregiver] = useState(false);
  const [caregiverName, setCaregiverName] = useState("");
  const [caregiverRole, setCaregiverRole] = useState<CaregiverRole>("nanny");
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) setProfile(getProfile(id));
    setMounted(true);
  }, [id]);

  if (!mounted) return null;

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F0F0] gap-4">
        <span className="text-5xl">🌱</span>
        <p className="text-[#1F2937] font-semibold">Profile not found.</p>
        <button onClick={() => router.push("/")} className="text-[#1F2937] font-bold hover:underline">
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
  const boardActivities = board.filter(a => a.status !== "done");
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
      progressLog: [],
      source: "library",
    };
    update({ ...profile!, board: [...(profile!.board ?? []), activity] });
  }

  function startActivity(activityId: string) {
    const updated = { ...profile!, board: (profile!.board ?? []).map(a =>
      a.id === activityId ? { ...a, status: "active" as const, activatedAt: new Date().toISOString() } : a
    )};
    update(updated);
  }

  function addCaregiver() {
    if (!caregiverName.trim()) return;
    const caregiver: Caregiver = {
      id: crypto.randomUUID(),
      name: caregiverName.trim(),
      role: caregiverRole,
    };
    update({ ...profile!, caregivers: [...(profile!.caregivers ?? []), caregiver] });
    setCaregiverName("");
    setCaregiverRole("nanny");
    setShowAddCaregiver(false);
  }

  function removeCaregiver(id: string) {
    update({ ...profile!, caregivers: (profile!.caregivers ?? []).filter(c => c.id !== id) });
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

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update({ ...profile!, photo: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F5F5] to-[#EBEBEB]">

      {/* Nav */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#D9D9D9] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-[#1F2937]">Growpace</span>
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/report?id=${profile.id}`)}
              className="text-sm text-[#1F2937] hover:text-[#1F2937] font-semibold transition-colors"
            >
              📄 Report
            </button>
            <button
              onClick={() => setShowAddCaregiver(true)}
              className="text-sm text-[#1F2937] hover:text-[#1F2937] font-semibold transition-colors"
            >
              👥 Add Partner
            </button>
            <button
              onClick={() => router.push("/")}
              className="text-sm text-[#1F2937] hover:text-[#1F2937] font-semibold transition-colors"
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
            <button
              onClick={() => photoInputRef.current?.click()}
              className="relative w-20 h-20 rounded-full bg-[#F0F0F0] border-4 border-[#222222] overflow-hidden flex-shrink-0 flex items-center justify-center group"
            >
              {profile.photo ? (
                <Image src={profile.photo} alt={profile.name} fill className="object-cover" unoptimized />
              ) : (
                <span className="text-4xl">{genderEmoji}</span>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <span className="text-white text-xl">📷</span>
              </div>
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold text-[#111827] truncate">{profile.name}</h1>
              <p className="text-[#1F2937] font-semibold text-base mt-0.5">{age}</p>
              <p className="text-[#94A3B8] text-sm mt-0.5">
                Born {new Date(profile.dob).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>

          {/* Journey progress bar */}
          <div className="mt-5">
            <div className="flex justify-between text-sm text-[#1F2937] mb-1.5 font-semibold">
              <span>Birth</span>
              <span className="text-[#1F2937]">{progress}% of journey</span>
              <span>Age 7</span>
            </div>
            <div className="h-3 bg-[#E5E5E5] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#222222] to-[#1F2937] rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current Activities */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold text-[#111827]">🎯 Current Activities</h2>
            <button
              onClick={() => router.push(`/activities?id=${profile.id}`)}
              className="text-sm text-[#1F2937] font-bold hover:underline transition-colors"
            >
              View all →
            </button>
          </div>

          {boardActivities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 text-center">
              <p className="text-3xl mb-2">🎯</p>
              <p className="text-[#111827] font-bold text-base">No activities yet</p>
              <p className="text-[#1F2937] text-sm mt-1 mb-3">
                Browse the library to find activities for {profile.name}
              </p>
              <button
                onClick={() => router.push(`/activities?id=${profile.id}`)}
                className="text-sm bg-[#1F2937] text-white font-bold px-5 py-2 rounded-full hover:bg-[#111111] transition-colors"
              >
                Explore Activities ✨
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {boardActivities.map(a => {
                const currentStage = PROGRESS_STAGES.find(s => s.value === a.progress);
                const isSaved = a.status === "saved";
                return (
                  <div key={a.id} className={`bg-white rounded-2xl p-4 border ${isSaved ? "border-dashed border-[#D9D9D9] opacity-80" : "border-[#E5E5E5]"}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${isSaved ? "bg-[#F5F5F5]" : "bg-[#F0F0F0]"}`}>
                        {a.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-[#111827] text-base">{a.title}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[a.tag] ?? "bg-gray-100 text-gray-500"}`}>
                            {a.tag}
                          </span>
                          {isSaved && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F5F5] text-[#94A3B8]">
                              Saved
                            </span>
                          )}
                        </div>
                        <p className="text-[#1F2937] text-sm mt-0.5">{a.desc}</p>
                        {!isSaved && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex gap-1 flex-1">
                              {PROGRESS_STAGES.map(stage => (
                                <div
                                  key={stage.value}
                                  className={`flex-1 h-1.5 rounded-full ${a.progress >= stage.value ? "bg-[#222222]" : "bg-[#E5E5E5]"}`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] font-bold text-[#1F2937] whitespace-nowrap">
                              {currentStage ? currentStage.short : "Not started"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {isSaved ? (
                      <button
                        onClick={() => startActivity(a.id)}
                        className="mt-3 w-full h-10 flex items-center justify-center rounded-xl bg-[#1F2937] text-white font-bold text-xs hover:bg-[#111111] transition-colors"
                      >
                        Start this activity →
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push(`/activity?profileId=${profile.id}&activityId=${a.id}`)}
                        className="mt-3 w-full h-12 flex items-center justify-center rounded-xl bg-[#F0F0F0] text-[#1F2937] font-bold text-xs hover:bg-[#E5E5E5] transition-colors border border-[#D9D9D9]"
                      >
                        Log a progress update
                      </button>
                    )}
                  </div>
                );
              })}
              <button
                onClick={() => router.push(`/activities?id=${profile.id}`)}
                className="w-full py-2.5 rounded-2xl border-2 border-dashed border-[#AAAAAA] text-[#1F2937] font-bold text-sm hover:bg-[#F0F0F0] transition-colors"
              >
                + Add more activities
              </button>
            </div>
          )}
        </section>

        {/* What's next */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold text-[#111827]">🎯 What&apos;s next for {profile.name}</h2>
            <button
              onClick={() => router.push(`/onboarding?id=${profile.id}`)}
              className="text-sm text-[#1F2937] hover:text-[#1F2937] font-semibold transition-colors"
            >
              Edit ✏️
            </button>
          </div>

          {nextMilestones.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 text-center">
              <p className="text-4xl mb-2">🏆</p>
              <p className="text-[#111827] font-extrabold">All milestones reached!</p>
              <p className="text-[#1F2937] text-sm mt-1">
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
                    className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden"
                  >
                    {m.image && (
                      <div className="w-full h-40 bg-[#F5F5F5] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.image}
                          alt={m.label}
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-[#111827] text-base leading-tight">{m.label}</h3>
                        {isOverdue ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FDF3EE] text-[#AA6646]">Around their age</span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0F0F0] text-[#1F2937]">Coming up</span>
                        )}
                      </div>
                      <p className="text-[#94A3B8] text-sm mt-0.5">Expected {milestoneExpectedAge(m.minMonths)}</p>
                      <p className="text-[#1F2937] text-sm mt-2 leading-relaxed">{m.tip}</p>
                      {savedStage && !isExpanded && (() => {
                        const stage = m.stages.find(s => s.id === savedStage);
                        return stage ? (
                          <div className="mt-3 bg-[#F0F0F0] rounded-xl p-3">
                            <p className="text-[10px] font-bold text-[#4B5563] mb-1.5">📍 Currently at: {stage.label}</p>
                            <p className="text-xs font-bold text-[#374151] mb-1.5">💡 Tip to reach the next stage</p>
                            <p className="text-sm text-[#374151] leading-relaxed">{stage.nextTip}</p>
                          </div>
                        ) : null;
                      })()}
                    </div>

                    {/* Stage picker — shown when expanded */}
                    {isExpanded && (
                      <div className="px-4 pb-3">
                        <p className="text-sm font-bold text-[#111827] mb-2">Where is {profile!.name} right now?</p>
                        <div className="space-y-2">
                          {m.stages.map((stage, si) => (
                            <button
                              key={stage.id}
                              onClick={() => saveMilestoneStage(m.id, stage.id)}
                              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all
                                ${savedStage === stage.id
                                  ? "border-[#222222] bg-[#EBEBEB]"
                                  : "border-[#D9D9D9] bg-[#FAFAFA] hover:border-[#AAAAAA]"
                                }`}
                            >
                              <span className="text-sm font-extrabold text-[#1F2937] mt-0.5 flex-shrink-0">{si + 1}</span>
                              <span className="text-sm font-semibold leading-tight text-[#111827]">{stage.label}</span>
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setExpandedMilestone(null)}
                          className="mt-2 text-sm text-[#94A3B8] hover:text-[#1F2937] font-semibold w-full text-center"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* 3 CTAs */}
                    <div className="border-t border-[#E5E5E5] px-3 py-2.5 grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => setExpandedMilestone(isExpanded ? null : m.id)}
                        className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl bg-[#EBEBEB] hover:bg-[#E0E0E0] transition-colors text-center"
                      >
                        <span className="text-[10px] font-bold text-[#4B5563] leading-tight">In progress</span>
                      </button>
                      <button
                        onClick={() => addMilestoneToBoard(m)}
                        className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl transition-colors text-center
                          ${onBoard ? "bg-[#F0F0F0] opacity-60 cursor-default" : "bg-[#F0F0F0] hover:bg-[#E0E0E0]"}`}
                      >
                        <span className="text-[10px] font-bold text-[#1F2937] leading-tight">
                          {onBoard ? "On board" : "Add to board"}
                        </span>
                      </button>
                      <button
                        onClick={() => markMilestoneAccomplished(m.id)}
                        className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl bg-[#FDF3EE] hover:bg-[#F5E5D5] transition-colors text-center"
                      >
                        <span className="text-[10px] font-bold text-[#AA6646] leading-tight">Accomplished!</span>
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
            <h2 className="text-lg font-extrabold text-[#111827]">📔 Growth Journal</h2>
            <button
              onClick={() => setShowJournalForm(v => !v)}
              className="text-sm bg-[#1F2937] text-white font-bold px-3 py-1.5 rounded-full hover:bg-[#111111] transition-colors"
            >
              {showJournalForm ? "Cancel" : "+ Add moment"}
            </button>
          </div>

          {showJournalForm && (
            <div className="bg-white rounded-2xl border border-[#E5E5E5] p-4 mb-3 space-y-3">
              {/* Emoji picker */}
              <div className="flex gap-2 flex-wrap">
                {JOURNAL_EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => setJournalEmoji(e)}
                    className={`w-9 h-9 rounded-full text-xl flex items-center justify-center transition-all
                      ${journalEmoji === e ? "bg-[#F0F0F0] scale-110 shadow-sm" : "hover:bg-[#F0F0F0]"}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <textarea
                value={journalText}
                onChange={e => setJournalText(e.target.value)}
                placeholder={`What did ${profile.name} do today? A first word, a big step, a funny moment…`}
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#D9D9D9] bg-[#FAFAFA] focus:outline-none focus:border-[#1F2937] text-[#111827] placeholder-[#94A3B8] text-base resize-none h-24 transition-colors"
              />
              <button
                onClick={addJournalEntry}
                disabled={!journalText.trim()}
                className="w-full py-2.5 rounded-2xl bg-[#1F2937] hover:bg-[#111111] disabled:opacity-40 text-white font-bold text-base transition-colors"
              >
                Save moment
              </button>
            </div>
          )}

          {profile.journal.length === 0 && !showJournalForm ? (
            <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 text-center">
              <p className="text-4xl mb-2">📝</p>
              <p className="text-[#1F2937] text-base font-semibold">No moments logged yet.</p>
              <p className="text-[#94A3B8] text-sm mt-1">Start capturing {profile.name}&apos;s journey!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {profile.journal.map(entry => (
                <div key={entry.id} className="bg-white rounded-2xl border border-[#E5E5E5] p-4 flex items-start gap-3">
                  <span className="text-2xl mt-0.5 flex-shrink-0">{entry.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#111827] text-base font-medium leading-relaxed">{entry.text}</p>
                    <p className="text-[#94A3B8] text-sm mt-1">
                      {new Date(entry.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteJournalEntry(entry.id)}
                    className="text-[#94A3B8] hover:text-red-400 transition-colors text-xl flex-shrink-0 leading-none"
                    title="Delete entry"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Care Team */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold text-[#111827]">👥 Care Team</h2>
            <button
              onClick={() => setShowAddCaregiver(true)}
              className="text-sm text-[#1F2937] font-bold hover:underline transition-colors"
            >
              + Add person
            </button>
          </div>

          {(profile.caregivers ?? []).length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-[#D9D9D9] p-5 text-center">
              <p className="text-2xl mb-1">🤝</p>
              <p className="text-[#111827] font-bold text-sm">No one added yet</p>
              <p className="text-[#94A3B8] text-xs mt-1">Add a nanny, teacher, trainer, or partner</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(profile.caregivers ?? []).map(c => {
                const roleIcon: Record<CaregiverRole, string> = { nanny: "🧑‍🍼", teacher: "📚", trainer: "🏋️", partner: "❤️" };
                const roleLabel: Record<CaregiverRole, string> = { nanny: "Nanny", teacher: "Teacher", trainer: "Trainer", partner: "Partner" };
                return (
                  <div key={c.id} className="bg-white rounded-2xl border border-[#E5E5E5] px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F0F0F0] flex items-center justify-center text-xl flex-shrink-0">
                      {roleIcon[c.role]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#111827] text-sm">{c.name}</p>
                      <p className="text-[#94A3B8] text-xs">{roleLabel[c.role]}</p>
                    </div>
                    <button
                      onClick={() => removeCaregiver(c.id)}
                      className="text-[#D9D9D9] hover:text-red-400 transition-colors text-xl leading-none"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      {/* Add Caregiver Modal */}
      {showAddCaregiver && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm px-4 pb-8">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#111827]">Who are you adding?</h3>
              <button onClick={() => setShowAddCaregiver(false)} className="text-[#94A3B8] text-2xl leading-none hover:text-[#1F2937]">×</button>
            </div>

            {/* Role picker */}
            <div className="grid grid-cols-2 gap-2">
              {(["nanny", "teacher", "trainer", "partner"] as CaregiverRole[]).map(role => {
                const icon: Record<CaregiverRole, string> = { nanny: "🧑‍🍼", teacher: "📚", trainer: "🏋️", partner: "❤️" };
                const label: Record<CaregiverRole, string> = { nanny: "Nanny", teacher: "Teacher", trainer: "Trainer", partner: "Partner" };
                return (
                  <button
                    key={role}
                    onClick={() => setCaregiverRole(role)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 font-bold text-sm transition-all
                      ${caregiverRole === role
                        ? "border-[#222222] bg-[#F0F0F0] text-[#111827]"
                        : "border-[#E5E5E5] bg-white text-[#94A3B8] hover:border-[#222222]"}`}
                  >
                    <span className="text-xl">{icon[role]}</span>
                    {label[role]}
                  </button>
                );
              })}
            </div>

            {/* Name input */}
            <div>
              <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wide">Their name</label>
              <input
                type="text"
                value={caregiverName}
                onChange={e => setCaregiverName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addCaregiver()}
                placeholder={caregiverRole === "partner" ? "e.g. Sarah" : "e.g. Maria"}
                className="mt-1.5 w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-4 py-3 text-[#111827] font-semibold text-base focus:outline-none focus:border-[#222222]"
                autoFocus
              />
            </div>

            <button
              onClick={addCaregiver}
              disabled={!caregiverName.trim()}
              className="w-full h-12 rounded-2xl bg-[#1F2937] text-white font-bold text-base disabled:opacity-40 hover:bg-[#111111] transition-colors"
            >
              Add to care team
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F0F0F0]">
        <div className="text-4xl animate-bounce">🌱</div>
      </div>
    }>
      <Dashboard />
    </Suspense>
  );
}
