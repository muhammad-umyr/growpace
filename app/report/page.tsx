"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#EEEDF8] gap-4">
        <span className="text-5xl">🌱</span>
        <p className="text-[#202837] font-semibold">Profile not found.</p>
        <button onClick={() => router.push("/")} className="text-[#202837] font-bold hover:underline">
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
    <div className="min-h-screen bg-gradient-to-br from-[#F4F3FC] via-[#EEEDF8] to-[#EDF3F0]">

      {/* Toolbar — hidden when printing */}
      <div className="print:hidden bg-white border-b border-[#D4DFDD] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-sm text-[#202837] hover:text-[#202837] font-semibold transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={() => window.print()}
            className="text-sm bg-[#202837] text-white font-bold px-4 py-2 rounded-full hover:bg-[#141D28] transition-colors"
          >
            🖨️ Print / Save PDF
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5 pb-12">

        {/* Header card */}
        <div className="bg-white rounded-3xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-2xl font-extrabold text-[#202837]">Growpace</span>
          </div>
          <p className="text-[#202837] text-base mb-6">Development Progress Report</p>

          <div className="relative w-24 h-24 rounded-full bg-[#EDF3F0] border-4 border-[#B2ADEB] overflow-hidden mx-auto mb-4 flex items-center justify-center">
            {profile.photo ? (
              <Image src={profile.photo} alt={profile.name} fill className="object-cover" unoptimized />
            ) : (
              <span className="text-5xl">{genderEmoji}</span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold text-[#0A1338]">{profile.name}</h1>
          <p className="text-[#202837] font-semibold mt-1">{calcAge(profile.dob)}</p>
          <p className="text-[#8FA4A6] text-base">
            Born {new Date(profile.dob).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          <p className="text-sm text-[#8FA4A6] mt-3 border-t border-[#E4E2F2] pt-3">
            Report generated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Journey progress */}
        <div className="bg-white rounded-3xl p-6">
          <h2 className="text-lg font-extrabold text-[#0A1338] mb-4">Journey Progress</h2>
          <div className="flex justify-between text-sm text-[#202837] mb-2 font-semibold">
            <span>Birth</span>
            <span className="text-[#202837]">{progress}% of journey to age 7</span>
            <span>Age 7</span>
          </div>
          <div className="h-4 bg-[#E4E2F2] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#B2ADEB] to-[#202837] rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-extrabold text-[#0A1338]">Milestones</h2>
            <span className="text-sm font-bold text-[#202837]">{doneCount}/{milestones.length} reached</span>
          </div>

          {/* Milestone progress bar */}
          <div className="h-2 bg-[#E4E2F2] rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-[#B2ADEB] to-[#202837] rounded-full"
              style={{ width: `${milestonePercent}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {milestones.map(m => (
              <div
                key={m.id}
                className={`flex items-center gap-2 p-2.5 rounded-xl
                  ${profile.milestones[m.id] ? "bg-[#EEEDF8]" : "bg-[#fafafa]"}`}
              >
                <span className="text-lg flex-shrink-0">{m.emoji}</span>
                <span className={`text-sm font-semibold flex-1 leading-tight
                  ${profile.milestones[m.id] ? "text-[#0A1338]" : "text-[#8FA4A6]"}`}>
                  {m.label}
                </span>
                {profile.milestones[m.id] && (
                  <span className="text-[#AA6646] text-xs font-bold flex-shrink-0">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Journal highlights */}
        {profile.journal.length > 0 && (
          <div className="bg-white rounded-3xl p-6">
            <h2 className="text-lg font-extrabold text-[#0A1338] mb-4">
              Journal Highlights
              <span className="text-base font-semibold text-[#202837] ml-2">
                ({profile.journal.length} {profile.journal.length === 1 ? "entry" : "entries"})
              </span>
            </h2>
            <div className="space-y-3">
              {profile.journal.slice(0, 5).map(entry => (
                <div key={entry.id} className="flex items-start gap-3 p-3 bg-[#F7F7FB] rounded-2xl">
                  <span className="text-2xl flex-shrink-0">{entry.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-[#0A1338] text-base leading-relaxed">{entry.text}</p>
                    <p className="text-[#8FA4A6] text-sm mt-1">
                      {new Date(entry.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
              {profile.journal.length > 5 && (
                <p className="text-sm text-[#8FA4A6] text-center pt-1">
                  + {profile.journal.length - 5} more entries in the app
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-[#8FA4A6]">Generated by Growpace · growpace.vercel.app</p>
        </div>

      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#EEEDF8]">
        <div className="text-4xl animate-bounce">🌱</div>
      </div>
    }>
      <Report />
    </Suspense>
  );
}
