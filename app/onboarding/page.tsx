"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import {
  getProfile,
  saveProfile,
  getMilestonesForOnboarding,
  calcAge,
  calcAgeMonths,
  Profile,
  MilestoneDef,
} from "@/lib/store";

// Age groups — milestones are bucketed by their minMonths
const GROUPS = [
  { label: "Birth – 3 months",  min: 0,  max: 3  },
  { label: "3 – 6 months",      min: 4,  max: 6  },
  { label: "6 – 12 months",     min: 7,  max: 11 },
  { label: "1 – 2 years",       min: 12, max: 23 },
  { label: "2 – 3 years",       min: 24, max: 35 },
  { label: "3 – 5 years",       min: 36, max: 59 },
  { label: "5 – 7 years",       min: 60, max: 83 },
];

function Onboarding() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (id) {
      const p = getProfile(id);
      setProfile(p);
      if (p) setChecked({ ...p.milestones });
    }
    setMounted(true);
  }, [id]);

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

  const ageMonths = calcAgeMonths(profile.dob);
  const allMilestones = getMilestonesForOnboarding(ageMonths);
  const checkedCount = allMilestones.filter(m => checked[m.id]).length;
  const genderEmoji = profile.gender === "boy" ? "👦" : profile.gender === "girl" ? "👧" : "🌈";

  const visibleGroups = GROUPS
    .map(g => ({
      ...g,
      milestones: allMilestones.filter(m => m.minMonths >= g.min && m.minMonths <= g.max),
    }))
    .filter(g => g.milestones.length > 0);

  function toggle(m: MilestoneDef) {
    const next = { ...checked, [m.id]: !checked[m.id] };
    setChecked(next);
    // Save immediately so progress isn't lost
    const updated: Profile = { ...profile!, milestones: next };
    setProfile(updated);
    saveProfile(updated);
  }

  function finish() {
    router.push(`/dashboard?id=${profile!.id}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FAF8] via-[#F7F4FC] to-[#EEF2F9] pb-32">

      {/* Header */}
      <div className="max-w-lg mx-auto px-4 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="text-3xl">🌱</span>
          <span className="text-2xl font-extrabold text-[#2D8C7A]">Growpace</span>
        </div>

        {/* Child avatar + name */}
        <div className="flex flex-col items-center gap-2 mb-5">
          <div className="w-16 h-16 rounded-full bg-[#EDF7F5] border-4 border-[#A8D5CC] flex items-center justify-center text-4xl shadow-sm">
            {genderEmoji}
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F1E29]">
            Let&apos;s get to know {profile.name}
          </h1>
          <p className="text-[#7A6E8A] text-base leading-relaxed max-w-xs">
            Tap every milestone {profile.name} has already reached.
            This personalises their dashboard so we can focus on what&apos;s next.
          </p>
        </div>

        {/* Progress summary */}
        {checkedCount > 0 && (
          <div className="inline-flex items-center gap-2 bg-[#EDF7F5] border border-[#A8D5CC] text-[#2D8C7A] font-bold text-base px-4 py-2 rounded-full">
            🎉 {checkedCount} milestone{checkedCount !== 1 ? "s" : ""} reached so far!
          </div>
        )}
      </div>

      {/* Milestone groups */}
      <div className="max-w-lg mx-auto px-4 space-y-8">
        {visibleGroups.map(group => (
          <div key={group.label}>
            {/* Group header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-[#E2DCF0]" />
              <span className="text-xs font-extrabold text-[#A89EC0] uppercase tracking-wide">
                {group.label}
              </span>
              <div className="flex-1 h-px bg-[#E2DCF0]" />
            </div>

            {/* Milestone grid */}
            <div className="grid grid-cols-2 gap-3">
              {group.milestones.map(m => {
                const isChecked = !!checked[m.id];
                return (
                  <button
                    key={m.id}
                    onClick={() => toggle(m)}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-150 text-center
                      ${isChecked
                        ? "bg-gradient-to-br from-[#F0FAF8] to-[#D5EDE9] border-[#2D8C7A] scale-[1.02]"
                        : "bg-white border-[#E2DCF0] hover:border-[#A8D5CC]"
                      }`}
                  >
                    {/* Checkmark badge */}
                    {isChecked && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#2D8C7A] flex items-center justify-center">
                        <span className="text-white text-[10px] font-extrabold">✓</span>
                      </div>
                    )}

                    <span className={`text-4xl transition-all ${isChecked ? "scale-110" : ""}`}>
                      {m.emoji}
                    </span>
                    <span className={`text-sm font-bold leading-tight ${isChecked ? "text-[#2D8C7A]" : "text-[#7A6E8A]"}`}>
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Skip hint */}
        <p className="text-center text-sm text-[#A89EC0] pb-2">
          Not sure? That&apos;s okay — you can always update these from {profile.name}&apos;s dashboard.
        </p>
      </div>

      {/* Sticky footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-[#E2DCF0] px-4 py-4 z-20">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <div className="flex-1">
            {checkedCount > 0 ? (
              <p className="text-base font-bold text-[#0F1E29]">
                {checkedCount} reached ·{" "}
                <span className="text-[#7A6E8A] font-normal">
                  {allMilestones.length - checkedCount} still to come
                </span>
              </p>
            ) : (
              <p className="text-base text-[#7A6E8A]">{calcAge(profile.dob)} old</p>
            )}
          </div>
          <button
            onClick={finish}
            className="bg-[#2D8C7A] hover:bg-[#1E6B5A] text-white font-extrabold px-6 py-3 rounded-2xl transition-colors shadow-md shadow-teal-200 text-sm"
          >
            {checkedCount > 0 ? "See what's next →" : "Skip for now →"}
          </button>
        </div>
      </div>

    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F0FAF8]">
        <div className="text-4xl animate-bounce">🌱</div>
      </div>
    }>
      <Onboarding />
    </Suspense>
  );
}
