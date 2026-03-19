"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect, useRef } from "react";
import {
  MdArrowBack,
  MdClose,
  MdCheck,
  MdExpandMore,
  MdExpandLess,
  MdPhoto,
  MdAutoAwesome,
  MdPause,
  MdCheckCircle,
} from "react-icons/md";
import {
  getProfile,
  saveProfile,
  getBoard,
  calcAgeMonths,
  ALL_ACTIVITIES,
  PROGRESS_STAGES,
  ProgressEntry,
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

interface ActivityDetails {
  benefits?: string[];
  generalTips?: string[];
  risks?: string | null;
  howTo?: string[];
}

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
  const [logPhoto, setLogPhoto] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // AI-generated details
  const [details, setDetails] = useState<ActivityDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    if (profileId) setProfile(getProfile(profileId));
    setMounted(true);
  }, [profileId]);

  if (!mounted) return null;

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F2F7] gap-4">
        <p className="text-[#1F2937] font-semibold">Profile not found.</p>
        <button onClick={() => router.push("/")} className="text-[#1F2937] font-bold hover:underline">Go home</button>
      </div>
    );
  }

  const board = getBoard(profile);
  const activity = board.find(a => a.id === activityId);

  if (!activity) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F2F7] gap-4">
        <p className="text-[#1F2937] font-semibold">Activity not found.</p>
        <button onClick={() => router.back()} className="text-[#1F2937] font-bold hover:underline">← Go back</button>
      </div>
    );
  }

  // Look up static activity def for howTo + videoQuery fallback
  const activityDef = ALL_ACTIVITIES.find(a => a.title === activity.title);
  const videoQuery = activityDef?.videoQuery ?? `${activity.title} for babies and toddlers`;
  const watchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(videoQuery)}`;
  const ageMonths = calcAgeMonths(profile.dob);

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
      photo: logPhoto ?? undefined,
    };
    const newLog = [...(activity!.progressLog ?? []), entry];
    updateActivity({ progress: selectedStage, progressLog: newLog, status: "active" });
    setNote("");
    setSelectedStage(null);
    setLogPhoto(null);
    setShowLogForm(false);
  }

  function handleLogPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogPhoto(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function markDone() {
    updateActivity({ status: "done", progress: 100 });
    router.back();
  }

  function saveForLater() {
    updateActivity({ status: "saved" });
    router.back();
  }

  async function fetchDetails() {
    if (details || detailsLoading) return;
    setDetailsLoading(true);
    try {
      const res = await fetch("/api/activity-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: activity!.title, desc: activity!.desc, tag: activity!.tag, ageMonths }),
      });
      const data = await res.json();
      if (!data.error) setDetails(data);
    } catch {
      // silently fail — sections just won't show
    } finally {
      setDetailsLoading(false);
    }
  }

  const currentStage = PROGRESS_STAGES.find(s => s.value === activity.progress);

  type TimelineItem = { date: string; label: string; note?: string; photo?: string; isKey?: boolean };
  const timeline: TimelineItem[] = [
    { date: activity.addedAt, label: "Added to board", isKey: true },
    ...(activity.activatedAt ? [{ date: activity.activatedAt, label: "Started", isKey: true }] : []),
    ...(activity.progressLog ?? []).map(e => ({
      date: e.date,
      label: PROGRESS_STAGES.find(s => s.value === e.progress)?.label ?? `${e.progress}%`,
      note: e.note,
      photo: e.photo,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Merge AI details with static def's howTo as fallback
  const howToSteps = details?.howTo ?? activityDef?.howTo ?? [];
  const benefits = details?.benefits ?? [];
  const generalTips = details?.generalTips ?? [];
  const risks = details?.risks;

  return (
    <div className="min-h-screen bg-[#F2F2F7]">

      {/* Nav */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#E5E5EA] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-sm text-[#007AFF] font-semibold transition-colors flex items-center gap-1"
          >
            <MdArrowBack className="inline" size={16} /> Back
          </button>
          <span className="text-base font-extrabold text-[#1F2937]">Growpace</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5 pb-16">

        {/* Activity header */}
        <div className="bg-white rounded-2xl overflow-hidden">
          {activityDef?.image && (
            <div className="w-full h-44 bg-[#F5F5F5] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activityDef.image}
                alt={activity.title}
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          )}
          <div className="p-5">
            <div className="flex items-start gap-4">
              {!activityDef?.image && (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F5F5F5] to-[#D9D9D9] flex items-center justify-center text-4xl flex-shrink-0">
                  {activity.emoji}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[activity.tag] ?? "bg-gray-100 text-gray-500"}`}>
                  {activity.tag}
                </span>
                <h1 className="font-extrabold text-[#1C1C1E] text-xl leading-tight mt-1">{activity.title}</h1>
                <p className="text-[#1F2937] text-sm mt-1 leading-relaxed">{activity.desc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current progress */}
        <div className="bg-white rounded-2xl p-5">
          <h2 className="text-base font-extrabold text-[#1C1C1E] mb-4">Progress</h2>
          <div className="flex gap-2">
            {PROGRESS_STAGES.map(stage => {
              const reached = activity.progress >= stage.value;
              const isCurrent = activity.progress === stage.value;
              return (
                <div key={stage.value} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className={`w-full h-2 rounded-full transition-colors ${reached ? "bg-[#34C759]" : "bg-[#E5E5E5]"}`} />
                  <span className={`text-[10px] font-bold text-center leading-tight ${isCurrent ? "text-[#1C1C1E]" : reached ? "text-[#AAAAAA]" : "text-[#D9D9D9]"}`}>
                    {stage.short}
                  </span>
                </div>
              );
            })}
          </div>
          {currentStage && (
            <p className="mt-3 text-sm font-semibold text-[#1F2937]">
              Currently: <span className="text-[#1C1C1E] font-extrabold">{currentStage.label}</span>
            </p>
          )}
          {!activity.progress && (
            <p className="mt-3 text-sm text-[#8E8E93]">No progress logged yet — tap below to get started.</p>
          )}
        </div>

        {/* Log progress update */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowLogForm(v => !v)}
            className="w-full px-5 py-4 flex items-center justify-between text-left"
          >
            <span className="text-base font-extrabold text-[#1C1C1E]">Log a progress update</span>
            <span className="text-[#1F2937]">{showLogForm ? <MdExpandLess size={22} /> : <MdExpandMore size={22} />}</span>
          </button>
          {showLogForm && (
            <div className="px-5 pb-5 space-y-4 border-t border-[#E5E5E5] pt-4">
              <p className="text-sm font-bold text-[#1C1C1E]">Where are you right now?</p>
              <div className="grid grid-cols-2 gap-2">
                {PROGRESS_STAGES.map(stage => (
                  <button
                    key={stage.value}
                    onClick={() => setSelectedStage(stage.value)}
                    className={`px-3 py-3 rounded-xl border-2 text-left transition-all
                      ${selectedStage === stage.value
                        ? "border-[#007AFF] bg-[#EFF6FF]"
                        : "border-[#D9D9D9] bg-[#FAFAFA] hover:border-[#007AFF]"
                      }`}
                  >
                    <p className="text-sm font-bold text-[#1C1C1E]">{stage.label}</p>
                  </button>
                ))}
              </div>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add a note… (optional) e.g. She tried for 5 minutes today!"
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#D9D9D9] bg-[#FAFAFA] focus:outline-none focus:border-[#007AFF] text-[#1C1C1E] placeholder-[#8E8E93] text-sm resize-none h-20 transition-colors"
              />

              {/* Photo upload */}
              <div>
                {logPhoto ? (
                  <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-[#F5F5F5]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logPhoto} alt="Progress photo" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setLogPhoto(null)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white text-sm flex items-center justify-center hover:bg-black/70"
                    >
                      <MdClose size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    className="w-full py-3 rounded-2xl border-2 border-dashed border-[#D9D9D9] bg-[#FAFAFA] text-[#8E8E93] text-sm font-bold hover:border-[#222222] hover:text-[#1F2937] transition-colors flex items-center justify-center gap-2"
                  >
                    <MdPhoto size={18} /> Add a photo
                  </button>
                )}
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogPhoto} />
              </div>

              <button
                onClick={logProgress}
                disabled={!selectedStage}
                className="w-full py-3 rounded-2xl bg-[#1F2937] hover:bg-[#111111] disabled:opacity-40 text-white font-bold text-sm transition-colors"
              >
                Save update
              </button>
            </div>
          )}
        </div>

        {/* Benefits */}
        {(benefits.length > 0 || detailsLoading) && (
          <div className="bg-white rounded-2xl p-5">
            <h2 className="text-base font-extrabold text-[#1C1C1E] mb-3">🌱 Why this activity helps</h2>
            {detailsLoading && benefits.length === 0 ? (
              <p className="text-sm text-[#8E8E93]">Loading…</p>
            ) : (
              <ul className="space-y-2">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#1F2937] leading-relaxed">
                    <MdCheck className="text-[#34C759] mt-0.5 flex-shrink-0" size={16} />
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* How to */}
        {(howToSteps.length > 0 || detailsLoading) && (
          <div className="bg-white rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-extrabold text-[#1C1C1E]">📋 How to do it</h2>
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors"
              >
                ▶ Watch on YouTube
              </a>
            </div>
            {detailsLoading && howToSteps.length === 0 ? (
              <p className="text-sm text-[#8E8E93]">Loading…</p>
            ) : (
              <ol className="space-y-3">
                {howToSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#1F2937] leading-relaxed">
                    <span className="w-6 h-6 rounded-full bg-[#F0F0F0] text-[#1F2937] font-extrabold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {/* General tips */}
        {(generalTips.length > 0 || detailsLoading) && (
          <div className="bg-[#F0F0F0] rounded-2xl border border-[#D9D9D9] p-5">
            <h2 className="text-base font-extrabold text-[#1C1C1E] mb-3">💡 General tips</h2>
            {detailsLoading && generalTips.length === 0 ? (
              <p className="text-sm text-[#8E8E93]">Loading…</p>
            ) : (
              <ul className="space-y-2">
                {generalTips.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#1F2937] leading-relaxed">
                    <span className="text-[#4B5563] font-extrabold mt-0.5">→</span>
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Risks */}
        {risks && (
          <div className="bg-[#FFF4ED] rounded-2xl border border-[#F4C9A4] p-4 flex items-start gap-3">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <div>
              <p className="text-sm font-extrabold text-[#AA6646] mb-0.5">Safety note</p>
              <p className="text-sm text-[#AA6646] leading-relaxed">{risks}</p>
            </div>
          </div>
        )}

        {/* Load AI details button — shown once, if not yet fetched */}
        {!details && !detailsLoading && (
          <button
            onClick={fetchDetails}
            className="w-full py-3 rounded-2xl bg-white border border-[#E5E5E5] text-[#1F2937] font-bold text-sm hover:bg-[#F0F0F0] transition-colors flex items-center justify-center gap-2"
          >
            <MdAutoAwesome size={16} /> Load benefits, tips &amp; safety info
          </button>
        )}

        {detailsLoading && !details && (
          <div className="text-center py-4">
            <div className="text-3xl animate-bounce mb-2">🌱</div>
            <p className="text-sm text-[#8E8E93] font-semibold">Fetching activity details…</p>
          </div>
        )}

        {/* Timeline */}
        {timeline.length > 0 && (
          <div className="bg-white rounded-2xl p-5">
            <h2 className="text-base font-extrabold text-[#1C1C1E] mb-4">Timeline</h2>
            <div className="space-y-0">
              {timeline.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-0.5 ${item.isKey ? "bg-[#34C759]" : "bg-[#34C759]"}`} />
                    {idx < timeline.length - 1 && <div className="w-0.5 bg-[#E5E5E5] flex-1 my-1" />}
                  </div>
                  <div className="pb-4 flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#1C1C1E]">{item.label}</p>
                    <p className="text-xs text-[#8E8E93] mt-0.5">{formatDate(item.date)}</p>
                    {item.note && (
                      <p className="mt-1.5 text-sm text-[#1F2937] bg-[#FAFAFA] rounded-xl px-3 py-2 leading-relaxed">
                        &quot;{item.note}&quot;
                      </p>
                    )}
                    {item.photo && (
                      <div className="mt-2 w-full h-36 rounded-xl overflow-hidden bg-[#F5F5F5]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.photo} alt="Progress photo" className="w-full h-full object-cover" />
                      </div>
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
            className="flex-1 py-3 rounded-2xl bg-[#007AFF] hover:bg-[#0071E3] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <MdCheckCircle size={18} /> Mark as Done
          </button>
          <button
            onClick={saveForLater}
            className="flex-1 py-3 rounded-2xl bg-white border border-[#E5E5E5] text-[#1F2937] font-bold text-sm hover:bg-[#F0F0F0] transition-colors flex items-center justify-center gap-2"
          >
            <MdPause size={18} /> Save for Later
          </button>
        </div>

      </main>
    </div>
  );
}

export default function ActivityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7]">
        <div className="text-4xl animate-bounce">🌱</div>
      </div>
    }>
      <ActivityDetail />
    </Suspense>
  );
}
