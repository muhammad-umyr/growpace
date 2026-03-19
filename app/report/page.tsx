"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { MdArrowBack, MdCheck } from "react-icons/md";
import {
  getProfile,
  getMilestonesForOnboarding,
  calcAge,
  calcAgeMonths,
  calcProgressPercent,
  Profile,
} from "@/lib/store";

function Report() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (id) setProfile(getProfile(id));
    setMounted(true);
  }, [id]);

  if (!mounted) return null;

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F2F7] gap-4">
        <span className="text-5xl">🌱</span>
        <p className="text-[#1F2937] font-semibold">Profile not found.</p>
        <button onClick={() => router.push("/")} className="text-[#1F2937] font-bold hover:underline">
          Go back home
        </button>
      </div>
    );
  }

  const ageMonths = calcAgeMonths(profile.dob);
  const milestones = getMilestonesForOnboarding(ageMonths);
  const doneCount = milestones.filter(m => profile.milestones[m.id]).length;
  const progress = calcProgressPercent(profile.dob);
  const milestonePercent = milestones.length > 0
    ? Math.round((doneCount / milestones.length) * 100)
    : 0;
  const genderEmoji = profile.gender === "boy" ? "👦" : profile.gender === "girl" ? "👧" : "🌈";

  return (
    <div className="min-h-screen bg-[#F2F2F7]">

      {/* Toolbar — hidden when printing */}
      <div className="print:hidden bg-white/90 backdrop-blur-md border-b border-[#E5E5EA] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-sm text-[#007AFF] font-semibold transition-colors flex items-center gap-1"
          >
            <MdArrowBack className="inline" size={16} /> Back
          </button>
          <button
            onClick={() => window.print()}
            className="text-sm bg-[#007AFF] text-white font-semibold px-4 py-2 rounded-full hover:bg-[#111111] transition-colors"
          >
            🖨️ Print / Save PDF
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5 pb-12">

        {/* Header card */}
        <div className="bg-white rounded-3xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-2xl font-extrabold text-[#1F2937]">Growpace</span>
          </div>
          <p className="text-[#1F2937] text-base mb-6">Development Progress Report</p>

          <div className="relative w-24 h-24 rounded-full bg-[#F0F0F0] border-4 border-[#222222] overflow-hidden mx-auto mb-4 flex items-center justify-center">
            {profile.photo ? (
              <Image src={profile.photo} alt={profile.name} fill className="object-cover" unoptimized />
            ) : (
              <span className="text-5xl">{genderEmoji}</span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold text-[#1C1C1E]">{profile.name}</h1>
          <p className="text-[#1F2937] font-semibold mt-1">{calcAge(profile.dob)}</p>
          <p className="text-[#8E8E93] text-base">
            Born {new Date(profile.dob).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          <p className="text-sm text-[#8E8E93] mt-3 border-t border-[#E5E5E5] pt-3">
            Report generated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Journey progress */}
        <div className="bg-white rounded-3xl p-6">
          <h2 className="text-lg font-extrabold text-[#1C1C1E] mb-4">Journey Progress</h2>
          <div className="flex justify-between text-sm text-[#1F2937] mb-2 font-semibold">
            <span>Birth</span>
            <span className="text-[#1F2937]">{progress}% of journey to age 7</span>
            <span>Age 7</span>
          </div>
          <div className="h-4 bg-[#E5E5E5] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#34C759] rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-extrabold text-[#1C1C1E]">Milestones</h2>
            <span className="text-sm font-bold text-[#1F2937]">{doneCount}/{milestones.length} reached</span>
          </div>

          {/* Milestone progress bar */}
          <div className="h-2 bg-[#E5E5E5] rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-[#34C759] rounded-full"
              style={{ width: `${milestonePercent}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {milestones.map(m => (
              <div
                key={m.id}
                className={`flex items-center gap-2 p-2.5 rounded-xl
                  ${profile.milestones[m.id] ? "bg-[#F0F0F0]" : "bg-[#fafafa]"}`}
              >
                <span className="text-lg flex-shrink-0">{m.emoji}</span>
                <span className={`text-sm font-semibold flex-1 leading-tight
                  ${profile.milestones[m.id] ? "text-[#1C1C1E]" : "text-[#8E8E93]"}`}>
                  {m.label}
                </span>
                {profile.milestones[m.id] && (
                  <MdCheck className="text-[#34C759] flex-shrink-0" size={16} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Journal highlights */}
        {profile.journal.length > 0 && (
          <div className="bg-white rounded-3xl p-6">
            <h2 className="text-lg font-extrabold text-[#1C1C1E] mb-4">
              Journal Highlights
              <span className="text-base font-semibold text-[#1F2937] ml-2">
                ({profile.journal.length} {profile.journal.length === 1 ? "entry" : "entries"})
              </span>
            </h2>
            <div className="space-y-3">
              {profile.journal.slice(0, 5).map(entry => (
                <div key={entry.id} className="flex items-start gap-3 p-3 bg-[#FAFAFA] rounded-2xl">
                  <span className="text-2xl flex-shrink-0">{entry.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-[#1C1C1E] text-base leading-relaxed">{entry.text}</p>
                    <p className="text-[#8E8E93] text-sm mt-1">
                      {new Date(entry.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
              {profile.journal.length > 5 && (
                <p className="text-sm text-[#8E8E93] text-center pt-1">
                  + {profile.journal.length - 5} more entries in the app
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-[#8E8E93]">Generated by Growpace · growpace.vercel.app</p>
        </div>

      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7]">
        <div className="text-4xl animate-bounce">🌱</div>
      </div>
    }>
      <Report />
    </Suspense>
  );
}
