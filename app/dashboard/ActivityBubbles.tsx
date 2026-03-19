"use client";

import { Profile } from "@/lib/store";

// ── Color palette — warm, distinct, consistent ────────────────────────────────

const PALETTE = [
  "#E8956D", // warm orange
  "#7CB8A4", // sage green
  "#E8C16D", // amber
  "#7BAFD4", // soft blue
  "#D48A8A", // dusty rose
  "#8AB87B", // soft green
  "#D4A574", // golden tan
  "#C87BAA", // mauve
  "#7BC8B8", // teal
  "#A8C87B", // lime green
  "#C8A87B", // warm sand
  "#8A9ED4", // periwinkle
  "#D4C87B", // yellow-green
  "#C87B8A", // coral rose
  "#7BC8A0", // mint
];

function hashColor(title: string): string {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (Math.imul(31, h) + title.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

// ── Activity → warm identity descriptor ──────────────────────────────────────

const DESCRIPTOR_MAP: { keywords: string[]; descriptor: string }[] = [
  { keywords: ["tummy time"],          descriptor: "strong mover" },
  { keywords: ["sing lullabies"],      descriptor: "music lover" },
  { keywords: ["music & movement"],    descriptor: "music explorer" },
  { keywords: ["track bright"],        descriptor: "curious watcher" },
  { keywords: ["peek-a-boo"],          descriptor: "social butterfly" },
  { keywords: ["gentle massage"],      descriptor: "grounded soul" },
  { keywords: ["story time"],          descriptor: "budding reader" },
  { keywords: ["reading together"],    descriptor: "book lover" },
  { keywords: ["toy storytelling"],    descriptor: "born storyteller" },
  { keywords: ["stacking blocks"],     descriptor: "little builder" },
  { keywords: ["simple puzzles"],      descriptor: "problem solver" },
  { keywords: ["sound matching"],      descriptor: "sound explorer" },
  { keywords: ["water exploration"],   descriptor: "water explorer" },
  { keywords: ["sand & water"],        descriptor: "sensory explorer" },
  { keywords: ["playdough"],           descriptor: "hands-on creator" },
  { keywords: ["drawing & coloring"],  descriptor: "young artist" },
  { keywords: ["finger painting"],     descriptor: "creative explorer" },
  { keywords: ["outdoor play"],        descriptor: "outdoor adventurer" },
  { keywords: ["nature walk"],         descriptor: "nature explorer" },
  { keywords: ["i spy outdoors"],      descriptor: "keen observer" },
  { keywords: ["obstacle course"],     descriptor: "little athlete" },
  { keywords: ["yoga for kids"],       descriptor: "mindful mover" },
  { keywords: ["pretend play"],        descriptor: "imaginative spirit" },
  { keywords: ["kitchen helper"],      descriptor: "little chef" },
  { keywords: ["emotion cards"],       descriptor: "empathetic heart" },
  { keywords: ["simple board games"],  descriptor: "game enthusiast" },
  { keywords: ["counting games"],      descriptor: "curious mind" },
  { keywords: ["simple maths"],        descriptor: "little mathematician" },
  { keywords: ["letter hunt"],         descriptor: "word explorer" },
  { keywords: ["balance bike"],        descriptor: "little rider" },
  { keywords: ["target practice"],     descriptor: "focused achiever" },
  { keywords: ["cutting practice"],    descriptor: "careful crafter" },
  { keywords: ["mini garden"],         descriptor: "little gardener" },
  { keywords: ["make a mini movie"],   descriptor: "young filmmaker" },
  { keywords: ["bubble play"],         descriptor: "wonder seeker" },
];

function getDescriptor(title: string): string {
  const lower = title.toLowerCase();
  const match = DESCRIPTOR_MAP.find(d => d.keywords.some(k => lower.includes(k)));
  return match?.descriptor ?? "curious explorer";
}

// ── Tagline builder ───────────────────────────────────────────────────────────

function buildTagline(childName: string, topActivities: string[]): string {
  const descriptors = topActivities.map(getDescriptor);
  // Deduplicate
  const unique = [...new Set(descriptors)].slice(0, 3);
  if (unique.length === 0) return "";
  if (unique.length === 1) return `${childName} is becoming a ${unique[0]}.`;
  const last = unique.pop()!;
  return `${childName} is becoming a ${unique.join(", a ")}, and ${last}.`;
}

// ── Bubble computation ────────────────────────────────────────────────────────

interface BubbleData {
  title: string;
  sessions: number;
  radius: number;
  opacity: number;
  color: string;
  x: number;
  y: number;
  showLabel: boolean;
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ≈ 2.3999 rad (137.5°)
const VIEW_W = 400;
const VIEW_H = 260;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2;
const CENTER_R = 18;
const MIN_R = 22;
const MAX_R = 54;
const LABEL_MIN_R = 30;
const MAX_BUBBLES = 10;

function computeBubbles(profile: Profile): BubbleData[] {
  // Count sessions per activity title
  const sessionMap: Record<string, number> = {};
  for (const a of profile.board ?? []) {
    const count = (a.progressLog ?? []).length + (a.status === "done" ? 1 : 0);
    if (count > 0) sessionMap[a.title] = (sessionMap[a.title] ?? 0) + count;
  }

  const entries = Object.entries(sessionMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_BUBBLES);

  if (entries.length === 0) return [];

  const maxSessions = entries[0][1];

  return entries.map(([title, sessions], i) => {
    const t = Math.pow(sessions / maxSessions, 0.55);
    const radius = MIN_R + t * (MAX_R - MIN_R);
    const opacity = 0.38 + t * 0.62;
    const color = hashColor(title);

    // Place on golden-angle spiral; first bubble closest to center
    const spiralR = (CENTER_R + radius + 10) + Math.sqrt(i) * 52;
    const angle = i * GOLDEN_ANGLE;
    const x = CX + spiralR * Math.cos(angle);
    const y = CY + spiralR * Math.sin(angle);

    return { title, sessions, radius, opacity, color, x, y, showLabel: radius >= LABEL_MIN_R };
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ActivityBubbles({ profile }: { profile: Profile }) {
  const bubbles = computeBubbles(profile);
  const totalSessions = bubbles.reduce((s, b) => s + b.sessions, 0);

  // Top 3 activities for tagline (by session count)
  const topActivities = bubbles.slice(0, 3).map(b => b.title);
  const tagline = buildTagline(profile.name, topActivities);

  return (
    <div className="mt-5">
      <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-2">
        {profile.name}&apos;s World
      </p>

      {bubbles.length === 0 ? (
        <p className="text-sm text-[#94A3B8] py-6 text-center leading-relaxed">
          Log activities to see {profile.name}&apos;s world grow.
        </p>
      ) : (
        <>
          <div className="w-full overflow-hidden rounded-2xl">
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              className="w-full"
              style={{ maxHeight: 220 }}
            >
              {/* Activity bubbles */}
              {bubbles.map((b) => (
                <g key={b.title}>
                  <circle
                    cx={b.x}
                    cy={b.y}
                    r={b.radius}
                    fill={b.color}
                    opacity={b.opacity}
                  />
                  {b.showLabel && (
                    <text
                      x={b.x}
                      y={b.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={b.radius > 40 ? 9 : 8}
                      fontWeight="700"
                      fill="#ffffff"
                      opacity={Math.min(1, b.opacity + 0.2)}
                      style={{ fontFamily: "inherit" }}
                    >
                      {b.title.length > 14 ? b.title.slice(0, 13) + "…" : b.title}
                    </text>
                  )}
                </g>
              ))}

              {/* Center anchor circle */}
              <circle cx={CX} cy={CY} r={CENTER_R} fill="#1F2937" opacity={0.9} />
              <text
                x={CX}
                y={CY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={10}
                fontWeight="800"
                fill="#ffffff"
                style={{ fontFamily: "inherit" }}
              >
                {totalSessions}
              </text>
            </svg>
          </div>

          {tagline && (
            <p className="text-sm text-[#4B5563] mt-3 leading-relaxed italic">
              {tagline}
            </p>
          )}
        </>
      )}
    </div>
  );
}
