"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ActivityBubbles } from "./ActivityBubbles";
import {
  getProfile,
  saveProfile,
  getBoard,
  getNextMilestones,
  milestoneExpectedAge,
  calcAge,
  calcAgeMonths,
  PROGRESS_STAGES,
  Profile,
  JournalEntry,
  MilestoneDef,
  BoardActivity,
  Caregiver,
  CaregiverRole,
  getDailyEntries,
  getWeeklyCardData,
  getMonthlyCardData,
  getNewMilestones,
  getMilestoneLabel,
  markMilestonesShown,
  markWeeklyCardShown,
  markMonthlyCardShown,
  updateNotificationSettings,
  defaultRecognition,
  MONTHLY_BADGE_LABELS,
  RecognitionMilestoneId,
  WeeklyCardData,
  MonthlyCardData,
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

  // Log progress flyout
  const [logFlyoutId, setLogFlyoutId] = useState<string | null>(null);
  const [flyoutStage, setFlyoutStage] = useState<number | null>(null);
  const [flyoutNote, setFlyoutNote] = useState("");
  const [flyoutPhoto, setFlyoutPhoto] = useState<string | null>(null);
  const flyoutPhotoRef = useRef<HTMLInputElement>(null);

  // Recognition state
  const [dailyMessage, setDailyMessage] = useState<string | null>(null);
  const [weeklyCard, setWeeklyCard] = useState<WeeklyCardData | null>(null);
  const [weeklyMessage, setWeeklyMessage] = useState<string | null>(null);
  const [monthlyCard, setMonthlyCard] = useState<MonthlyCardData | null>(null);
  const [monthlyMessage, setMonthlyMessage] = useState<string | null>(null);
  const [pendingMilestones, setPendingMilestones] = useState<RecognitionMilestoneId[]>([]);
  const [milestoneMessage, setMilestoneMessage] = useState<string | null>(null);
  const [showNotifSettings, setShowNotifSettings] = useState(false);

  useEffect(() => {
    if (!id) { setMounted(true); return; }
    const p = getProfile(id);
    if (!p) { setMounted(true); return; }
    setProfile(p);

    // ── Daily acknowledgment ──────────────────────────────────────────────────
    const dailyEntries = getDailyEntries(p);
    if (dailyEntries.length > 0) {
      const cats = [...new Set(dailyEntries.map(e => e.category))];
      fetch("/api/recognition-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childName: p.name, period: "daily", categories: cats, activityCount: dailyEntries.length }),
      })
        .then(r => r.json())
        .then(d => { if (d.message) setDailyMessage(d.message); })
        .catch(() => {});
    }

    // ── Weekly card ───────────────────────────────────────────────────────────
    const wc = getWeeklyCardData(p);
    if (wc) {
      setWeeklyCard(wc);
      fetch("/api/recognition-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName: p.name, period: "weekly",
          categories: wc.categories, activityCount: wc.activityCount,
          twoWeeksInARow: wc.twoWeeksInARow,
        }),
      })
        .then(r => r.json())
        .then(d => { if (d.message) setWeeklyMessage(d.message); })
        .catch(() => {});
    }

    // ── Monthly card ──────────────────────────────────────────────────────────
    const mc = getMonthlyCardData(p);
    if (mc) {
      setMonthlyCard(mc);
      fetch("/api/recognition-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName: p.name, period: "monthly",
          categories: mc.categories, activityCount: mc.activityCount,
          monthLabel: mc.monthLabel, activeWeeks: mc.activeWeeks,
        }),
      })
        .then(r => r.json())
        .then(d => { if (d.message) setMonthlyMessage(d.message); })
        .catch(() => {});
    }

    // ── Milestones ────────────────────────────────────────────────────────────
    const newMs = getNewMilestones(p);
    if (newMs.length > 0) {
      setPendingMilestones(newMs);
      const total = (p.board ?? []).flatMap(a => a.progressLog ?? []).length;
      fetch("/api/recognition-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childName: p.name, period: "milestone", activityCount: total, categories: [] }),
      })
        .then(r => r.json())
        .then(d => { if (d.message) setMilestoneMessage(d.message); })
        .catch(() => {});
    }

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

  function saveFlyoutProgress() {
    if (!flyoutStage || !logFlyoutId) return;
    const entry = {
      date: new Date().toISOString(),
      progress: flyoutStage,
      note: flyoutNote.trim() || undefined,
      photo: flyoutPhoto ?? undefined,
    };
    const updated = {
      ...profile!,
      board: (profile!.board ?? []).map(a => {
        if (a.id !== logFlyoutId) return a;
        const newLog = [...(a.progressLog ?? []), entry];
        return { ...a, progress: flyoutStage, progressLog: newLog, status: "active" as const };
      }),
    };
    update(updated);
    setLogFlyoutId(null);
    setFlyoutStage(null);
    setFlyoutNote("");
    setFlyoutPhoto(null);
  }

  function handleFlyoutPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFlyoutPhoto(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
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
    <div className="min-h-screen bg-[#F7F7F7]">

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
        <div className="bg-white rounded-3xl p-6 shadow-sm">
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

          <ActivityBubbles profile={profile} />
        </div>

        {/* ── Daily acknowledgment ── quiet one-liner, only if logged today */}
        {dailyMessage && (
          <p className="text-sm text-[#4B5563] italic px-1">{dailyMessage}</p>
        )}

        {/* ── Milestone celebration ── */}
        {pendingMilestones.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1">A moment worth noting</p>
                <p className="font-extrabold text-[#111827] text-base">
                  {getMilestoneLabel(pendingMilestones[0])}
                </p>
                {milestoneMessage
                  ? <p className="text-sm text-[#4B5563] mt-2 leading-relaxed">{milestoneMessage}</p>
                  : <p className="text-sm text-[#94A3B8] mt-2">Loading…</p>
                }
              </div>
              <button
                onClick={() => {
                  const updated = markMilestonesShown(profile, pendingMilestones, pendingMilestones.map(id => ({
                    id: crypto.randomUUID(),
                    type: id as RecognitionMilestoneId,
                    date: new Date().toISOString(),
                    label: getMilestoneLabel(id),
                    message: milestoneMessage ?? undefined,
                  })));
                  update(updated);
                  setPendingMilestones([]);
                }}
                className="text-[#94A3B8] hover:text-[#1F2937] text-xl leading-none flex-shrink-0"
              >×</button>
            </div>
          </div>
        )}

        {/* ── Weekly summary card ── shown Sun/Mon if active last week */}
        {weeklyCard && (
          <div className="bg-white rounded-3xl shadow-sm p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wide">Last week</p>
              <button
                onClick={() => {
                  update(markWeeklyCardShown(profile, weeklyCard.weekKey));
                  setWeeklyCard(null);
                }}
                className="text-[#94A3B8] hover:text-[#1F2937] text-xl leading-none flex-shrink-0"
              >×</button>
            </div>
            <div className="flex gap-3 mb-3 flex-wrap">
              <span className="text-sm font-bold text-[#111827]">{weeklyCard.activityCount} activities</span>
              {weeklyCard.categories.map(c => (
                <span key={c} className="text-xs bg-[#F0F0F0] text-[#4B5563] px-2 py-0.5 rounded-full font-semibold">{c}</span>
              ))}
            </div>
            {weeklyMessage
              ? <p className="text-sm text-[#4B5563] leading-relaxed">{weeklyMessage}</p>
              : <p className="text-sm text-[#94A3B8]">Loading…</p>
            }
            {weeklyCard.twoWeeksInARow && (
              <p className="text-xs text-[#94A3B8] mt-3 italic">Active two weeks in a row.</p>
            )}
          </div>
        )}

        {/* ── Monthly snapshot card ── shown 1st–3rd of month */}
        {monthlyCard && (
          <div className="bg-white rounded-3xl shadow-sm p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-0.5">{monthlyCard.monthLabel}</p>
                <p className="font-extrabold text-[#111827] text-base">{monthlyCard.activityCount} activities across {monthlyCard.categories.length} areas</p>
              </div>
              <button
                onClick={() => {
                  const entries = monthlyCard.badges.map(b => ({
                    id: crypto.randomUUID(),
                    type: b as "active_month" | "well_rounded_month" | "dedicated_month",
                    date: new Date().toISOString(),
                    label: MONTHLY_BADGE_LABELS[b],
                    message: monthlyMessage ?? undefined,
                  }));
                  update(markMonthlyCardShown(profile, monthlyCard.monthKey, entries));
                  setMonthlyCard(null);
                }}
                className="text-[#94A3B8] hover:text-[#1F2937] text-xl leading-none flex-shrink-0"
              >×</button>
            </div>

            {/* Simple category bar chart */}
            <div className="space-y-2 mb-4">
              {Object.entries(monthlyCard.categoryBreakdown).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
                const max = Math.max(...Object.values(monthlyCard.categoryBreakdown));
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-xs text-[#94A3B8] w-20 flex-shrink-0">{cat}</span>
                    <div className="flex-1 h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#58CC02] rounded-full transition-all duration-700"
                        style={{ width: `${(count / max) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#111827] w-4 text-right">{count}</span>
                  </div>
                );
              })}
            </div>

            {monthlyMessage
              ? <p className="text-sm text-[#4B5563] leading-relaxed mb-3">{monthlyMessage}</p>
              : <p className="text-sm text-[#94A3B8] mb-3">Loading…</p>
            }

            {monthlyCard.badges.length > 0 && (
              <div className="flex gap-2 flex-wrap pt-3 border-t border-[#E5E5E5]">
                {monthlyCard.badges.map(b => (
                  <span key={b} className="text-xs bg-[#F5F5F5] border border-[#E5E5E5] text-[#4B5563] px-3 py-1 rounded-full font-semibold">
                    {MONTHLY_BADGE_LABELS[b]}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

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
            <div className="bg-white rounded-3xl shadow-sm p-6 text-center">
              <p className="text-3xl mb-2">🎯</p>
              <p className="text-[#111827] font-bold text-base">No activities yet</p>
              <p className="text-[#1F2937] text-sm mt-1 mb-3">
                Browse the library to find activities for {profile.name}
              </p>
              <button
                onClick={() => router.push(`/activities?id=${profile.id}`)}
                className="text-sm bg-[#58CC02] text-white font-extrabold px-5 py-2.5 rounded-2xl border-b-4 border-[#45A800] hover:bg-[#61D900] active:border-b-0 active:translate-y-[3px] transition-all"
              >
                Explore Activities ✨
              </button>
            </div>
          ) : (
            /* Horizontal snap scroll — one card visible, peek of next */
            <div
              className="overflow-x-auto snap-x snap-mandatory pb-2"
              style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
            >
              <div className="flex gap-3">
              {boardActivities.map(a => {
                const currentStage = PROGRESS_STAGES.find(s => s.value === a.progress);
                const isSaved = a.status === "saved";
                return (
                  <div
                    key={a.id}
                    className={`snap-start flex-shrink-0 w-[85%] bg-white rounded-3xl p-4 shadow-sm ${isSaved ? "opacity-80" : ""}`}
                  >
                    {/* Header row */}
                    <div className="flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${isSaved ? "bg-[#F5F5F5]" : "bg-[#F0F0F0]"}`}>
                        {a.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-[#111827] text-sm">{a.title}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[a.tag] ?? "bg-gray-100 text-gray-500"}`}>
                            {a.tag}
                          </span>
                        </div>
                        <p className="text-[#1F2937] text-xs mt-0.5 line-clamp-2">{a.desc}</p>
                      </div>
                    </div>

                    {/* Progress bar (active only) */}
                    {!isSaved && (
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex gap-1 flex-1">
                          {PROGRESS_STAGES.map(stage => (
                            <div
                              key={stage.value}
                              className={`flex-1 h-3 rounded-full ${a.progress >= stage.value ? "bg-[#58CC02]" : "bg-[#E5E5E5]"}`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-[#94A3B8] whitespace-nowrap">
                          {currentStage ? currentStage.short : "Not started"}
                        </span>
                      </div>
                    )}

                    {/* CTAs */}
                    {isSaved ? (
                      <div className="mt-3 flex flex-col gap-2">
                        <button
                          onClick={() => startActivity(a.id)}
                          className="w-full h-11 flex items-center justify-center rounded-2xl bg-[#58CC02] text-white font-extrabold text-xs border-b-4 border-[#45A800] hover:bg-[#61D900] active:border-b-0 active:translate-y-[3px] transition-all"
                        >
                          Start this activity →
                        </button>
                        <button
                          onClick={() => router.push(`/activity?profileId=${profile.id}&activityId=${a.id}`)}
                          className="w-full h-11 flex items-center justify-center rounded-2xl bg-white text-[#4B5563] font-extrabold text-xs border-2 border-[#E5E5E5] border-b-4 border-b-[#D0D0D0] hover:bg-[#F5F5F5] transition-colors"
                        >
                          Tips &amp; Tricks
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => { setLogFlyoutId(a.id); setFlyoutStage(null); setFlyoutNote(""); setFlyoutPhoto(null); }}
                          className="flex-1 h-11 flex items-center justify-center rounded-2xl bg-[#58CC02] text-white font-extrabold text-xs border-b-4 border-[#45A800] hover:bg-[#61D900] active:border-b-0 active:translate-y-[3px] transition-all"
                        >
                          Log progress
                        </button>
                        <button
                          onClick={() => router.push(`/activity?profileId=${profile.id}&activityId=${a.id}`)}
                          className="flex-1 h-11 flex items-center justify-center rounded-2xl bg-white text-[#4B5563] font-extrabold text-xs border-2 border-[#E5E5E5] border-b-4 border-b-[#D0D0D0] hover:bg-[#F5F5F5] transition-colors"
                        >
                          Tips &amp; Tricks
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add more — last card in the scroll */}
              <div className="snap-start flex-shrink-0 w-[85%] flex items-center justify-center">
                <button
                  onClick={() => router.push(`/activities?id=${profile.id}`)}
                  className="w-full py-8 rounded-3xl border-2 border-dashed border-[#D9D9D9] text-[#94A3B8] font-bold text-sm hover:bg-[#F0F0F0] transition-colors"
                >
                  + Add more activities
                </button>
              </div>
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
            <div className="bg-white rounded-3xl shadow-sm p-6 text-center">
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
                    className="bg-white rounded-3xl shadow-sm overflow-hidden"
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
              className="text-sm bg-[#58CC02] text-white font-extrabold px-3 py-1.5 rounded-2xl border-b-4 border-[#45A800] hover:bg-[#61D900] active:border-b-0 active:translate-y-[2px] transition-all"
            >
              {showJournalForm ? "Cancel" : "+ Add moment"}
            </button>
          </div>

          {showJournalForm && (
            <div className="bg-white rounded-3xl shadow-sm p-4 mb-3 space-y-3">
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
                className="w-full py-2.5 rounded-2xl bg-[#58CC02] hover:bg-[#61D900] disabled:opacity-40 text-white font-extrabold text-base border-b-4 border-[#45A800] active:border-b-0 active:translate-y-[3px] transition-all"
              >
                Save moment
              </button>
            </div>
          )}

          {profile.journal.length === 0 && !showJournalForm ? (
            <div className="bg-white rounded-3xl shadow-sm p-6 text-center">
              <p className="text-4xl mb-2">📝</p>
              <p className="text-[#1F2937] text-base font-semibold">No moments logged yet.</p>
              <p className="text-[#94A3B8] text-sm mt-1">Start capturing {profile.name}&apos;s journey!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {profile.journal.map(entry => (
                <div key={entry.id} className="bg-white rounded-3xl shadow-sm p-4 flex items-start gap-3">
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
            <div className="bg-white rounded-3xl shadow-sm p-5 text-center border-2 border-dashed border-[#D9D9D9]">
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
                  <div key={c.id} className="bg-white rounded-3xl shadow-sm px-4 py-3 flex items-center gap-3">
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

        {/* Recognition history */}
        {(profile.recognition?.history ?? []).length > 0 && (
          <section className="pb-8">
            <h2 className="text-lg font-extrabold text-[#111827] mb-3">✨ Highlights</h2>
            <div className="space-y-2">
              {[...(profile.recognition?.history ?? [])].reverse().map(entry => (
                <div key={entry.id} className="bg-white rounded-3xl shadow-sm px-4 py-3">
                  <p className="text-sm font-bold text-[#111827]">{entry.label}</p>
                  {entry.message && <p className="text-sm text-[#4B5563] mt-1 leading-relaxed">{entry.message}</p>}
                  <p className="text-xs text-[#94A3B8] mt-1">
                    {new Date(entry.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recognition settings */}
        <section className="pb-8">
          <button
            onClick={() => setShowNotifSettings(v => !v)}
            className="text-xs text-[#94A3B8] hover:text-[#4B5563] font-semibold transition-colors w-full text-center"
          >
            {showNotifSettings ? "Hide" : "Recognition settings"}
          </button>
          {showNotifSettings && (
            <div className="mt-3 bg-white rounded-3xl shadow-sm divide-y divide-[#F0F0F0]">
              {([
                { key: "notifyWeekly",    label: "Weekly summary", desc: "Shown Sunday/Monday if you were active last week" },
                { key: "notifyMonthly",   label: "Monthly snapshot", desc: "Shown on the 1st if you were active 2+ weeks" },
                { key: "notifyMilestones",label: "Milestone moments", desc: "Shown when you hit 10, 25, 50, or 100 activities" },
              ] as { key: "notifyWeekly" | "notifyMonthly" | "notifyMilestones"; label: string; desc: string }[]).map(item => {
                const r = profile.recognition ?? defaultRecognition();
                const on = r[item.key];
                return (
                  <div key={item.key} className="px-4 py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-[#111827]">{item.label}</p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => update(updateNotificationSettings(profile, { [item.key]: !on }))}
                      className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative ${on ? "bg-[#58CC02]" : "bg-[#D9D9D9]"}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${on ? "left-5" : "left-0.5"}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      {/* Log Progress Flyout */}
      {logFlyoutId && (() => {
        const activity = (profile.board ?? []).find(a => a.id === logFlyoutId);
        if (!activity) return null;
        const currentStage = PROGRESS_STAGES.find(s => s.value === activity.progress);
        return (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setLogFlyoutId(null)}
            />
            {/* Sheet */}
            <div className="relative w-full max-w-2xl bg-white rounded-t-3xl px-5 pt-5 pb-10 shadow-2xl space-y-4">
              {/* Handle */}
              <div className="w-10 h-1 bg-[#D9D9D9] rounded-full mx-auto mb-1" />

              {/* Activity header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0F0F0] flex items-center justify-center text-xl flex-shrink-0">
                  {activity.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-[#111827] text-base leading-tight">{activity.title}</p>
                  {currentStage && (
                    <p className="text-xs text-[#94A3B8] mt-0.5">Currently: {currentStage.label}</p>
                  )}
                </div>
                <button
                  onClick={() => setLogFlyoutId(null)}
                  className="text-[#94A3B8] hover:text-[#1F2937] text-2xl leading-none flex-shrink-0"
                >×</button>
              </div>

              {/* Stage picker */}
              <div>
                <p className="text-sm font-bold text-[#111827] mb-2">Where are you right now?</p>
                <div className="grid grid-cols-2 gap-2">
                  {PROGRESS_STAGES.map(stage => (
                    <button
                      key={stage.value}
                      onClick={() => setFlyoutStage(stage.value)}
                      className={`px-3 py-3 rounded-xl border-2 text-left transition-all
                        ${flyoutStage === stage.value
                          ? "border-[#58CC02] bg-[#F0FFF0]"
                          : "border-[#D9D9D9] bg-[#FAFAFA] hover:border-[#58CC02]"
                        }`}
                    >
                      <p className="text-sm font-bold text-[#111827]">{stage.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <textarea
                value={flyoutNote}
                onChange={e => setFlyoutNote(e.target.value)}
                placeholder={`Add a note… e.g. ${profile.name} tried for 5 minutes today!`}
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#D9D9D9] bg-[#FAFAFA] focus:outline-none focus:border-[#1F2937] text-[#111827] placeholder-[#94A3B8] text-sm resize-none h-20 transition-colors"
              />

              {/* Photo */}
              {flyoutPhoto ? (
                <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-[#F5F5F5]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={flyoutPhoto} alt="Progress photo" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setFlyoutPhoto(null)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white text-sm flex items-center justify-center"
                  >×</button>
                </div>
              ) : (
                <button
                  onClick={() => flyoutPhotoRef.current?.click()}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-[#D9D9D9] bg-[#FAFAFA] text-[#94A3B8] text-sm font-bold hover:border-[#1F2937] hover:text-[#1F2937] transition-colors flex items-center justify-center gap-2"
                >
                  📷 Add a photo
                </button>
              )}
              <input ref={flyoutPhotoRef} type="file" accept="image/*" className="hidden" onChange={handleFlyoutPhoto} />

              {/* Save */}
              <button
                onClick={saveFlyoutProgress}
                disabled={!flyoutStage}
                className="w-full py-3.5 rounded-2xl bg-[#58CC02] hover:bg-[#61D900] disabled:opacity-40 text-white font-extrabold text-sm border-b-4 border-[#45A800] active:border-b-0 active:translate-y-[3px] transition-all"
              >
                Save update
              </button>
            </div>
          </div>
        );
      })()}

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
