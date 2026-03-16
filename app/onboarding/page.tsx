"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect, useRef } from "react";
import Image from "next/image";
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
  const photoInputRef = useRef<HTMLInputElement>(null);

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

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const updated = { ...profile!, photo: reader.result as string };
      setProfile(updated);
      saveProfile(updated);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F3FC] via-[#EEEDF8] to-[#EDF3F0] pb-32">

      {/* Header */}
      <div className="max-w-lg mx-auto px-4 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="text-2xl font-extrabold text-[#202837]">Growpace</span>
        </div>

        {/* Child avatar + name */}
        <div className="flex flex-col items-center gap-2 mb-5">
          <button
            onClick={() => photoInputRef.current?.click()}
            className="relative w-16 h-16 rounded-full bg-[#EDF3F0] border-4 border-[#B2ADEB] flex items-center justify-center text-4xl group overflow-hidden"
          >
            {profile.photo ? (
              <Image src={profile.photo} alt={profile.name} fill className="object-cover" unoptimized />
            ) : (
              <span>{genderEmoji}</span>
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              <span className="text-white text-lg">📷</span>
            </div>
          </button>
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          <h1 className="text-2xl font-extrabold text-[#0A1338]">
            Let&apos;s get to know {profile.name}
          </h1>
          <p className="text-[#202837] text-base leading-relaxed max-w-xs">
            Tap every milestone {profile.name} has already reached.
            This personalises their dashboard so we can focus on what&apos;s next.
          </p>
        </div>

        {/* Progress summary */}
        {checkedCount > 0 && (
          <div className="inline-flex items-center gap-2 bg-[#F0EEFA] border border-[#B2ADEB] text-[#7A74C0] font-bold text-base px-4 py-2 rounded-full">
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
              <div className="flex-1 h-px bg-[#D4DFDD]" />
              <span className="text-xs font-extrabold text-[#8FA4A6] uppercase tracking-wide">
                {group.label}
              </span>
              <div className="flex-1 h-px bg-[#D4DFDD]" />
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
                        ? "bg-gradient-to-br from-[#F4F3FC] to-[#D4DFDD] border-[#B2ADEB] scale-[1.02]"
                        : "bg-white border-[#D4DFDD] hover:border-[#A6BFB6]"
                      }`}
                  >
                    {/* Checkmark badge */}
                    {isChecked && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#B2ADEB] flex items-center justify-center">
                        <span className="text-white text-[10px] font-extrabold">✓</span>
                      </div>
                    )}

                    <span className={`text-4xl transition-all ${isChecked ? "scale-110" : ""}`}>
                      {m.emoji}
                    </span>
                    <span className={`text-sm font-bold leading-tight ${isChecked ? "text-[#202837]" : "text-[#202837]"}`}>
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Skip hint */}
        <p className="text-center text-sm text-[#8FA4A6] pb-2">
          Not sure? That&apos;s okay — you can always update these from {profile.name}&apos;s dashboard.
        </p>
      </div>

      {/* Sticky footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-[#D4DFDD] px-4 py-4 z-20">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <div className="flex-1">
            {checkedCount > 0 ? (
              <p className="text-base font-bold text-[#0A1338]">
                {checkedCount} reached ·{" "}
                <span className="text-[#202837] font-normal">
                  {allMilestones.length - checkedCount} still to come
                </span>
              </p>
            ) : (
              <p className="text-base text-[#202837]">{calcAge(profile.dob)} old</p>
            )}
          </div>
          <button
            onClick={finish}
            className="bg-[#202837] hover:bg-[#141D28] text-white font-extrabold px-6 py-3 rounded-2xl transition-colors shadow-md shadow-[#B2ADEB]/30 text-sm"
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
      <div className="min-h-screen flex items-center justify-center bg-[#EEEDF8]">
        <div className="text-4xl animate-bounce">🌱</div>
      </div>
    }>
      <Onboarding />
    </Suspense>
  );
}
