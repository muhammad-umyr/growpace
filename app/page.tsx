"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CreateProfile() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPhotoUrl(URL.createObjectURL(file));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Please enter your child's name.";
    if (!dob) errs.dob = "Please enter a date of birth.";
    else {
      const birth = new Date(dob);
      const now = new Date();
      if (birth > now) errs.dob = "Date of birth can't be in the future.";
      const ageYears = (now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (ageYears > 7) errs.dob = "Growpace supports children from birth to age 7.";
    }
    if (!gender) errs.gender = "Please select a gender.";
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const params = new URLSearchParams({ name, dob, gender });
    if (photoUrl) params.set("photo", photoUrl);
    router.push(`/dashboard?${params.toString()}`);
  }

  const genders = [
    { value: "boy", label: "Boy", emoji: "👦" },
    { value: "girl", label: "Girl", emoji: "👧" },
    { value: "other", label: "Other", emoji: "🌈" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8f0] via-[#fef3f8] to-[#f0f8ff] flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="text-4xl">🌱</span>
          <span className="text-3xl font-extrabold text-[#e8834a]">Growpace</span>
        </div>
        <p className="text-[#a07060] text-sm font-medium">Every child grows at their own pace.</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-orange-100/60 p-8">
        <h1 className="text-2xl font-extrabold text-[#3d2c1e] mb-1">Create a child profile</h1>
        <p className="text-[#a07060] text-sm mb-7">Let&apos;s get to know your little one 🐣</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo upload */}
          <div className="flex flex-col items-center gap-3 mb-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative w-24 h-24 rounded-full bg-[#fff0e6] border-4 border-dashed border-[#f4b98a] hover:border-[#e8834a] transition-colors overflow-hidden"
            >
              {photoUrl ? (
                <Image src={photoUrl} alt="Child photo" fill className="object-cover" unoptimized />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[#e8834a] gap-1">
                  <span className="text-2xl">📷</span>
                  <span className="text-[10px] font-semibold">Add photo</span>
                </div>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            {photoUrl && (
              <button type="button" onClick={() => setPhotoUrl(null)} className="text-xs text-[#a07060] hover:text-red-400 transition-colors">
                Remove photo
              </button>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-[#3d2c1e] mb-1.5">
              Child&apos;s name <span className="text-[#e8834a]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }}
              placeholder="e.g. Aisha, Liam, Noah…"
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#f0ddd0] bg-[#fffaf7] focus:outline-none focus:border-[#e8834a] text-[#3d2c1e] placeholder-[#c4a898] transition-colors"
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
          </div>

          {/* Date of birth */}
          <div>
            <label className="block text-sm font-bold text-[#3d2c1e] mb-1.5">
              Date of birth <span className="text-[#e8834a]">*</span>
            </label>
            <input
              type="date"
              value={dob}
              max={new Date().toISOString().split("T")[0]}
              onChange={e => { setDob(e.target.value); setErrors(p => ({ ...p, dob: "" })); }}
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#f0ddd0] bg-[#fffaf7] focus:outline-none focus:border-[#e8834a] text-[#3d2c1e] transition-colors"
            />
            {errors.dob && <p className="mt-1 text-xs text-red-400">{errors.dob}</p>}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-bold text-[#3d2c1e] mb-2">
              Gender <span className="text-[#e8834a]">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {genders.map(g => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => { setGender(g.value); setErrors(p => ({ ...p, gender: "" })); }}
                  className={`flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all font-semibold text-sm
                    ${gender === g.value
                      ? "border-[#e8834a] bg-[#fff3eb] text-[#e8834a] scale-105 shadow-sm"
                      : "border-[#f0ddd0] bg-[#fffaf7] text-[#a07060] hover:border-[#e8834a]"
                    }`}
                >
                  <span className="text-2xl">{g.emoji}</span>
                  {g.label}
                </button>
              ))}
            </div>
            {errors.gender && <p className="mt-1 text-xs text-red-400">{errors.gender}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-[#e8834a] hover:bg-[#d6723b] text-white font-extrabold text-base transition-colors shadow-md shadow-orange-200 mt-2 cursor-pointer"
          >
            Create Profile 🌟
          </button>
        </form>
      </div>

      <p className="mt-6 text-xs text-[#c4a898] text-center">
        Your data stays on your device. No account needed to get started.
      </p>
    </div>
  );
}
