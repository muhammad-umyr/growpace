"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MdArrowBack, MdClose, MdAdd, MdPhoto } from "react-icons/md";
import {
  getProfiles,
  saveProfile,
  deleteProfile,
  calcAge,
  Profile,
} from "@/lib/store";

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const GENDERS = [
  { value: "boy",  label: "Boy",  emoji: "👦" },
  { value: "girl", label: "Girl", emoji: "👧" },
];

export default function Home() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setProfiles(getProfiles());
    setMounted(true);
  }, []);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPhotoUrl(await fileToBase64(file));
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

    const profile: Profile = {
      id: crypto.randomUUID(),
      name: name.trim(),
      dob,
      gender,
      photo: photoUrl,
      milestones: {},
      milestoneProgress: {},
      journal: [],
      board: [],
      caregivers: [],
      createdAt: new Date().toISOString(),
    };

    saveProfile(profile);
    router.push(`/onboarding?id=${profile.id}`);
  }

  function handleDelete(id: string) {
    deleteProfile(id);
    setProfiles(getProfiles());
    setConfirmDelete(null);
  }

  if (!mounted) return null;

  const hasProfiles = profiles.length > 0;
  const showProfiles = hasProfiles && !showForm;
  const showCreateForm = !hasProfiles || showForm;

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="text-3xl font-extrabold text-[#1F2937]">Growpace</span>
        </div>
        <p className="text-[#1F2937] text-base font-medium">Every child grows at their own pace.</p>
      </div>

      {/* ── Profiles list ── */}
      {showProfiles && (
        <div className="w-full max-w-md space-y-4">
          <h2 className="text-lg font-extrabold text-[#1C1C1E]">Your children</h2>

          <div className="grid grid-cols-2 gap-3">
            {profiles.map(p => {
              const genderEmoji = p.gender === "boy" ? "👦" : p.gender === "girl" ? "👧" : "🌈";
              return (
                <div key={p.id} className="relative group">
                  <button
                    onClick={() => router.push(`/dashboard?id=${p.id}`)}
                    className="w-full bg-white rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-[1.02] transition-all "
                  >
                    <div className="relative w-16 h-16 rounded-full bg-[#F0F0F0] border-4 border-[#222222] overflow-hidden flex items-center justify-center">
                      {p.photo ? (
                        <Image src={p.photo} alt={p.name} fill className="object-cover" unoptimized />
                      ) : (
                        <span className="text-3xl">{genderEmoji}</span>
                      )}
                    </div>
                    <p className="font-extrabold text-[#1C1C1E] text-base">{p.name}</p>
                    <p className="text-[#1F2937] text-sm font-semibold">{calcAge(p.dob)}</p>
                  </button>

                  {/* Delete button */}
                  {confirmDelete === p.id ? (
                    <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center gap-2 border border-red-100">
                      <p className="text-sm font-bold text-[#1C1C1E] text-center px-2">Remove {p.name}?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-xs bg-red-400 text-white font-bold px-3 py-1 rounded-full hover:bg-red-500 transition-colors"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-xs bg-[#E5E5E5] text-[#1F2937] font-bold px-3 py-1 rounded-full hover:bg-[#D9D9D9] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(p.id)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#E5E5E5] text-[#8E8E93] hover:bg-red-100 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center"
                      title="Remove profile"
                    >
                      <MdClose size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3.5 rounded-2xl border-2 border-dashed border-[#007AFF] text-[#007AFF] font-semibold text-sm hover:bg-[#EFF6FF] transition-colors flex items-center justify-center gap-1"
          >
            <MdAdd size={18} /> Add another child
          </button>
        </div>
      )}

      {/* ── Create form ── */}
      {showCreateForm && (
        <div className="w-full max-w-md bg-white rounded-3xl p-8">
          {showForm && hasProfiles && (
            <button
              onClick={() => setShowForm(false)}
              className="text-sm text-[#007AFF] font-semibold mb-4 flex items-center gap-1 transition-colors"
            >
              <MdArrowBack className="inline" size={16} /> Back
            </button>
          )}

          <h1 className="text-2xl font-extrabold text-[#1C1C1E] mb-1">Create a child profile</h1>
          <p className="text-[#1F2937] text-base mb-7">Let&apos;s get to know your little one 🐣</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Photo upload */}
            <div className="flex flex-col items-center gap-3 mb-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative w-24 h-24 rounded-full bg-[#F0F0F0] border-4 border-dashed border-[#222222] hover:border-[#007AFF] transition-colors overflow-hidden"
              >
                {photoUrl ? (
                  <Image src={photoUrl} alt="Child photo" fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-[#1F2937] gap-1">
                    <MdPhoto size={26} />
                    <span className="text-[10px] font-semibold">Add photo</span>
                  </div>
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl(null)}
                  className="text-xs text-[#1F2937] hover:text-red-400 transition-colors"
                >
                  Remove photo
                </button>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-[#1C1C1E] mb-1.5">
                Child&apos;s name <span className="text-[#1F2937]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }}
                placeholder="e.g. Aisha, Liam, Noah…"
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#D9D9D9] bg-[#FAFAFA] focus:outline-none focus:border-[#007AFF] text-[#1C1C1E] placeholder-[#8E8E93] transition-colors"
              />
              {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
            </div>

            {/* Date of birth */}
            <div>
              <label className="block text-sm font-bold text-[#1C1C1E] mb-1.5">
                Date of birth <span className="text-[#1F2937]">*</span>
              </label>
              <input
                type="date"
                value={dob}
                max={new Date().toISOString().split("T")[0]}
                onChange={e => { setDob(e.target.value); setErrors(p => ({ ...p, dob: "" })); }}
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#D9D9D9] bg-[#FAFAFA] focus:outline-none focus:border-[#007AFF] text-[#1C1C1E] transition-colors"
              />
              {errors.dob && <p className="mt-1 text-sm text-red-400">{errors.dob}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-bold text-[#1C1C1E] mb-2">
                Gender <span className="text-[#1F2937]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {GENDERS.map(g => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => { setGender(g.value); setErrors(p => ({ ...p, gender: "" })); }}
                    className={`flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all font-semibold text-sm
                      ${gender === g.value
                        ? "border-[#007AFF] bg-[#EFF6FF] text-[#4B5563] scale-105 shadow-sm"
                        : "border-[#D9D9D9] bg-[#FAFAFA] text-[#1F2937] hover:border-[#007AFF]"
                      }`}
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    {g.label}
                  </button>
                ))}
              </div>
              {errors.gender && <p className="mt-1 text-sm text-red-400">{errors.gender}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#007AFF] hover:bg-[#0071E3] text-white font-semibold text-base transition-colors  mt-2 cursor-pointer"
            >
              Create Profile 🌟
            </button>
          </form>
        </div>
      )}

      <p className="mt-6 text-sm text-[#8E8E93] text-center">
        Your data stays on your device. No account needed to get started.
      </p>
    </div>
  );
}
