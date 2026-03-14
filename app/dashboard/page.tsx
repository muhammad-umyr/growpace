"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";

function calcAge(dob: string) {
  const birth = new Date(dob);
  const now = new Date();
  const totalMonths =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const days = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));

  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} old`;
  if (totalMonths < 12) return `${totalMonths} month${totalMonths !== 1 ? "s" : ""} old`;
  if (months === 0) return `${years} year${years !== 1 ? "s" : ""} old`;
  return `${years}y ${months}m old`;
}

function calcProgressPercent(dob: string) {
  const birth = new Date(dob);
  const now = new Date();
  const ageMs = now.getTime() - birth.getTime();
  const maxMs = 7 * 365.25 * 24 * 60 * 60 * 1000;
  return Math.min(Math.round((ageMs / maxMs) * 100), 100);
}

const weeklyActivities = [
  { emoji: "🎨", title: "Finger painting", desc: "Great for fine motor skills", tag: "Creative" },
  { emoji: "📚", title: "Story time", desc: "Read 2 short books today", tag: "Language" },
  { emoji: "🏃", title: "Outdoor play", desc: "30 min of active movement", tag: "Physical" },
];

const milestones = [
  { emoji: "🗣️", label: "First words", done: true },
  { emoji: "🚶", label: "Walking", done: true },
  { emoji: "✂️", label: "Using scissors", done: false },
  { emoji: "🔡", label: "Recognises letters", done: false },
  { emoji: "🤝", label: "Sharing with peers", done: false },
  { emoji: "🎵", label: "Sings simple songs", done: true },
];

const timelineEvents = [
  { month: "Birth", emoji: "👶", note: "Welcome to the world!" },
  { month: "3 mo", emoji: "😊", note: "First social smile" },
  { month: "6 mo", emoji: "🍽️", note: "Started solid foods" },
  { month: "12 mo", emoji: "🚶", note: "First steps" },
  { month: "Now", emoji: "⭐", note: "Current stage", current: true },
];

function Dashboard() {
  const params = useSearchParams();
  const router = useRouter();
  const name = params.get("name") || "Your Child";
  const dob = params.get("dob") || "";
  const gender = params.get("gender") || "";
  const photo = params.get("photo") || null;

  const age = dob ? calcAge(dob) : "Age unknown";
  const progress = dob ? calcProgressPercent(dob) : 0;

  const genderEmoji = gender === "boy" ? "👦" : gender === "girl" ? "👧" : "🌈";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8f0] via-[#fef3f8] to-[#f0f8ff]">
      {/* Top nav */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <span className="text-xl font-extrabold text-[#e8834a]">Growpace</span>
          </div>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-[#a07060] hover:text-[#e8834a] font-semibold transition-colors"
          >
            + Add Child
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Profile card */}
        <div className="bg-white rounded-3xl shadow-lg shadow-orange-100/50 p-6">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative w-20 h-20 rounded-full bg-[#fff0e6] border-4 border-[#f4b98a] overflow-hidden flex-shrink-0 flex items-center justify-center">
              {photo ? (
                <Image src={photo} alt={name} fill className="object-cover" unoptimized />
              ) : (
                <span className="text-4xl">{genderEmoji}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold text-[#3d2c1e] truncate">{name}</h1>
              <p className="text-[#e8834a] font-semibold text-sm mt-0.5">{age}</p>
              {dob && (
                <p className="text-[#c4a898] text-xs mt-0.5">
                  Born {new Date(dob).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              )}
            </div>
          </div>

          {/* Journey progress bar */}
          {dob && (
            <div className="mt-5">
              <div className="flex justify-between text-xs text-[#a07060] mb-1.5 font-semibold">
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
          )}
        </div>

        {/* Weekly Activities */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold text-[#3d2c1e]">🎯 This Week&apos;s Activities</h2>
            <span className="text-xs bg-[#fff0e6] text-[#e8834a] font-bold px-3 py-1 rounded-full">AI suggested</span>
          </div>
          <div className="space-y-3">
            {weeklyActivities.map((a, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm shadow-orange-50 flex items-start gap-4 border border-orange-50">
                <div className="w-12 h-12 rounded-2xl bg-[#fff8f0] flex items-center justify-center text-2xl flex-shrink-0">
                  {a.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-[#3d2c1e] text-sm">{a.title}</p>
                    <span className="text-[10px] bg-[#f0f8ff] text-[#6baed6] font-bold px-2 py-0.5 rounded-full">{a.tag}</span>
                  </div>
                  <p className="text-[#a07060] text-xs mt-0.5">{a.desc}</p>
                </div>
                <button className="w-7 h-7 rounded-full border-2 border-[#f0ddd0] hover:border-[#e8834a] hover:bg-[#fff3eb] transition-colors flex items-center justify-center text-sm flex-shrink-0">
                  ✓
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Milestones */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold text-[#3d2c1e]">🏆 Milestones</h2>
            <span className="text-xs text-[#a07060] font-semibold">
              {milestones.filter(m => m.done).length}/{milestones.length} reached
            </span>
          </div>
          <div className="bg-white rounded-2xl shadow-sm shadow-orange-50 border border-orange-50 overflow-hidden">
            {milestones.map((m, i) => (
              <div key={i} className={`flex items-center gap-4 px-5 py-3.5 ${i < milestones.length - 1 ? "border-b border-orange-50" : ""}`}>
                <span className="text-xl w-7 text-center">{m.emoji}</span>
                <span className={`flex-1 text-sm font-semibold ${m.done ? "text-[#3d2c1e]" : "text-[#c4a898]"}`}>{m.label}</span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${m.done ? "bg-[#e8834a] text-white" : "bg-[#f5ebe0] text-[#c4a898]"}`}>
                  {m.done ? "✓" : "·"}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Progress Timeline */}
        <section>
          <h2 className="text-lg font-extrabold text-[#3d2c1e] mb-3">📅 Progress Timeline</h2>
          <div className="bg-white rounded-2xl shadow-sm shadow-orange-50 border border-orange-50 p-5">
            <div className="relative">
              {/* Line */}
              <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-[#f5ebe0]" />
              <div className="space-y-5">
                {timelineEvents.map((ev, i) => (
                  <div key={i} className="flex items-start gap-4 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 z-10
                      ${ev.current ? "bg-[#e8834a] shadow-md shadow-orange-200" : "bg-[#fff8f0] border-2 border-[#f5ebe0]"}`}>
                      {ev.emoji}
                    </div>
                    <div className="pt-1.5">
                      <p className={`text-xs font-bold ${ev.current ? "text-[#e8834a]" : "text-[#c4a898]"}`}>{ev.month}</p>
                      <p className="text-sm text-[#3d2c1e] font-semibold">{ev.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Quick insights */}
        <section className="grid grid-cols-2 gap-3 pb-8">
          <div className="bg-[#fff8f0] rounded-2xl p-4 border border-orange-100">
            <p className="text-2xl mb-1">💬</p>
            <p className="text-xs font-bold text-[#3d2c1e]">Language</p>
            <p className="text-xs text-[#a07060] mt-0.5">On track for age</p>
          </div>
          <div className="bg-[#f0fbf4] rounded-2xl p-4 border border-green-100">
            <p className="text-2xl mb-1">🏃</p>
            <p className="text-xs font-bold text-[#3d2c1e]">Motor Skills</p>
            <p className="text-xs text-[#a07060] mt-0.5">Developing well</p>
          </div>
          <div className="bg-[#f0f8ff] rounded-2xl p-4 border border-blue-100">
            <p className="text-2xl mb-1">🤝</p>
            <p className="text-xs font-bold text-[#3d2c1e]">Social</p>
            <p className="text-xs text-[#a07060] mt-0.5">Ready to explore</p>
          </div>
          <div className="bg-[#fdf4ff] rounded-2xl p-4 border border-purple-100">
            <p className="text-2xl mb-1">🧠</p>
            <p className="text-xs font-bold text-[#3d2c1e]">Cognitive</p>
            <p className="text-xs text-[#a07060] mt-0.5">Growing fast</p>
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
