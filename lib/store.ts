// ── Types ────────────────────────────────────────────────────────────────────

export interface BoardActivity {
  id: string;
  title: string;
  emoji: string;
  desc: string;
  tag: string;
  status: "saved" | "active" | "done";
  addedAt: string;
  activatedAt?: string;
  progress: number; // 0 | 25 | 50 | 75 | 100
  source: "library" | "ai";
}

export interface JournalEntry {
  id: string;
  text: string;
  date: string; // ISO string
  emoji: string;
}

export interface Profile {
  id: string;
  name: string;
  dob: string; // YYYY-MM-DD
  gender: string;
  photo: string | null; // base64 data URL
  milestones: Record<string, boolean>;
  journal: JournalEntry[];
  board: BoardActivity[];
  createdAt: string;
}

// ── Milestone definitions ────────────────────────────────────────────────────

export interface MilestoneDef {
  id: string;
  emoji: string;
  label: string;
  minMonths: number; // typically expected from this age
}

export const ALL_MILESTONES: MilestoneDef[] = [
  { id: "smile",       emoji: "😊", label: "First social smile",     minMonths: 1  },
  { id: "head_up",     emoji: "💪", label: "Holds head up",           minMonths: 2  },
  { id: "tracks",      emoji: "👀", label: "Tracks objects with eyes",minMonths: 2  },
  { id: "babbles",     emoji: "🗣️", label: "Babbles & coos",          minMonths: 3  },
  { id: "sits",        emoji: "🪑", label: "Sits without support",    minMonths: 6  },
  { id: "crawls",      emoji: "🐾", label: "Crawls",                  minMonths: 8  },
  { id: "waves",       emoji: "👋", label: "Waves bye-bye",           minMonths: 9  },
  { id: "first_words", emoji: "💬", label: "First words",             minMonths: 10 },
  { id: "walks",       emoji: "🚶", label: "Walking",                 minMonths: 12 },
  { id: "spoon",       emoji: "🥄", label: "Uses spoon",              minMonths: 15 },
  { id: "two_words",   emoji: "🗨️", label: "2-word phrases",          minMonths: 18 },
  { id: "runs",        emoji: "🏃", label: "Running",                 minMonths: 18 },
  { id: "sings",       emoji: "🎵", label: "Sings simple songs",      minMonths: 24 },
  { id: "potty",       emoji: "🚽", label: "Toilet training begun",   minMonths: 24 },
  { id: "scissors",    emoji: "✂️", label: "Using scissors",          minMonths: 36 },
  { id: "sharing",     emoji: "🤝", label: "Sharing with peers",      minMonths: 36 },
  { id: "draws",       emoji: "🎨", label: "Draws shapes",            minMonths: 36 },
  { id: "letters",     emoji: "🔡", label: "Recognises letters",      minMonths: 42 },
  { id: "reads",       emoji: "📖", label: "Reads simple words",      minMonths: 60 },
  { id: "writes_name", emoji: "✏️", label: "Writes own name",         minMonths: 60 },
  { id: "bike",        emoji: "🚲", label: "Rides a bike",            minMonths: 60 },
];

/** Returns milestones expected up to 6 months ahead of current age */
export function getMilestonesForAge(ageMonths: number): MilestoneDef[] {
  return ALL_MILESTONES.filter(m => m.minMonths <= ageMonths + 6);
}

// ── Activity definitions ─────────────────────────────────────────────────────

export interface ActivityDef {
  emoji: string;
  title: string;
  desc: string;
  tag: string;
  minMonths: number;
  maxMonths: number;
}

export const ALL_ACTIVITIES: ActivityDef[] = [
  // 0–6 months
  { emoji: "🤸", title: "Tummy time",          desc: "Build neck & shoulder strength",       tag: "Physical",  minMonths: 0,  maxMonths: 5  },
  { emoji: "🎵", title: "Sing lullabies",       desc: "Soothes and builds language",          tag: "Language",  minMonths: 0,  maxMonths: 11 },
  { emoji: "👀", title: "Track bright toys",    desc: "Strengthens visual tracking",          tag: "Cognitive", minMonths: 1,  maxMonths: 5  },
  { emoji: "🔔", title: "Sound matching",       desc: "Match sounds to objects or animals",   tag: "Language",  minMonths: 2,  maxMonths: 36 },
  { emoji: "🤲", title: "Gentle massage",       desc: "Skin-to-skin bonding & body awareness",tag: "Sensory",   minMonths: 0,  maxMonths: 11 },
  // 6–12 months
  { emoji: "🙈", title: "Peek-a-boo",           desc: "Teaches object permanence",            tag: "Cognitive", minMonths: 5,  maxMonths: 17 },
  { emoji: "🧱", title: "Stacking blocks",      desc: "Develops hand-eye coordination",       tag: "Motor",     minMonths: 8,  maxMonths: 29 },
  { emoji: "📚", title: "Story time",           desc: "Read 2 short books today",             tag: "Language",  minMonths: 6,  maxMonths: 83 },
  { emoji: "🫧", title: "Bubble play",          desc: "Blow and chase bubbles together",      tag: "Sensory",   minMonths: 6,  maxMonths: 48 },
  { emoji: "🌊", title: "Water exploration",    desc: "Pouring, splashing, sink & float",     tag: "Sensory",   minMonths: 8,  maxMonths: 48 },
  // 12–24 months
  { emoji: "🏃", title: "Outdoor play",         desc: "30 min of active movement",            tag: "Physical",  minMonths: 12, maxMonths: 83 },
  { emoji: "🌿", title: "Nature walk",          desc: "Explore the outdoors together",        tag: "Sensory",   minMonths: 12, maxMonths: 83 },
  { emoji: "🧸", title: "Toy storytelling",     desc: "Act out stories with stuffed animals", tag: "Social",    minMonths: 18, maxMonths: 60 },
  { emoji: "🎨", title: "Finger painting",      desc: "Great for fine motor skills",          tag: "Creative",  minMonths: 18, maxMonths: 83 },
  { emoji: "🧪", title: "Sand & water play",    desc: "Sensory exploration",                  tag: "Sensory",   minMonths: 18, maxMonths: 59 },
  { emoji: "🎭", title: "Pretend play",          desc: "Boosts imagination & social skills",   tag: "Social",    minMonths: 18, maxMonths: 83 },
  { emoji: "🖐️", title: "Playdough",            desc: "Squish, roll, and shape dough",        tag: "Motor",     minMonths: 18, maxMonths: 72 },
  { emoji: "🎠", title: "Obstacle course",      desc: "Crawl under, climb over, jump!",       tag: "Physical",  minMonths: 18, maxMonths: 72 },
  // 24–36 months
  { emoji: "✏️", title: "Drawing & coloring",  desc: "Develops creativity & fine motor",     tag: "Creative",  minMonths: 24, maxMonths: 83 },
  { emoji: "🚴", title: "Balance bike",         desc: "Build coordination & confidence",      tag: "Physical",  minMonths: 24, maxMonths: 60 },
  { emoji: "🫶", title: "Emotion cards",        desc: "Name feelings from picture cards",     tag: "Social",    minMonths: 24, maxMonths: 60 },
  { emoji: "🎸", title: "Music & movement",     desc: "Dance and play with instruments",      tag: "Creative",  minMonths: 12, maxMonths: 83 },
  // 30–48 months
  { emoji: "🔢", title: "Counting games",       desc: "Fun number recognition",               tag: "Cognitive", minMonths: 30, maxMonths: 83 },
  { emoji: "🍳", title: "Kitchen helper",       desc: "Simple tasks like stirring & pouring", tag: "Motor",     minMonths: 30, maxMonths: 83 },
  { emoji: "🧩", title: "Simple puzzles",       desc: "Builds problem-solving skills",        tag: "Cognitive", minMonths: 18, maxMonths: 59 },
  // 36–60 months
  { emoji: "🎲", title: "Simple board games",   desc: "Teaches turn-taking & patience",       tag: "Social",    minMonths: 36, maxMonths: 83 },
  { emoji: "🌱", title: "Mini garden",          desc: "Plant seeds and watch them grow",      tag: "Cognitive", minMonths: 36, maxMonths: 83 },
  { emoji: "🔍", title: "I spy outdoors",       desc: "Find colours, shapes & animals outside",tag: "Cognitive",minMonths: 24, maxMonths: 72 },
  { emoji: "🎯", title: "Target practice",      desc: "Bean bags, hoops, or ring toss",       tag: "Physical",  minMonths: 36, maxMonths: 83 },
  { emoji: "✂️", title: "Cutting practice",     desc: "Snip paper with child-safe scissors",  tag: "Motor",     minMonths: 36, maxMonths: 72 },
  // 48–84 months
  { emoji: "🔡", title: "Letter hunt",          desc: "Spot letters on signs & books",        tag: "Language",  minMonths: 42, maxMonths: 83 },
  { emoji: "📖", title: "Reading together",     desc: "Read a chapter book aloud",            tag: "Language",  minMonths: 60, maxMonths: 83 },
  { emoji: "🧮", title: "Simple maths games",   desc: "Add and subtract with objects",        tag: "Cognitive", minMonths: 54, maxMonths: 83 },
  { emoji: "🎬", title: "Make a mini movie",    desc: "Act out & film a short story",         tag: "Creative",  minMonths: 54, maxMonths: 83 },
  { emoji: "🤸", title: "Yoga for kids",        desc: "Simple poses with animal names",       tag: "Physical",  minMonths: 36, maxMonths: 83 },
];

/** Returns 3 age-appropriate activities, rotating weekly */
export function getActivitiesForAge(ageMonths: number): ActivityDef[] {
  const matching = ALL_ACTIVITIES.filter(
    a => ageMonths >= a.minMonths && ageMonths <= a.maxMonths
  );
  const week = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
  return [...matching]
    .sort((a, b) => hashStr(a.title + week) - hashStr(b.title + week))
    .slice(0, 3);
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

// ── localStorage helpers ─────────────────────────────────────────────────────

const KEY = "growpace_profiles";

export function getProfiles(): Profile[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}

export function getProfile(id: string): Profile | null {
  return getProfiles().find(p => p.id === id) ?? null;
}

export function saveProfile(profile: Profile): void {
  const list = getProfiles();
  const i = list.findIndex(p => p.id === profile.id);
  if (i >= 0) list[i] = profile;
  else list.push(profile);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function deleteProfile(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(getProfiles().filter(p => p.id !== id)));
}

// ── Board helpers ─────────────────────────────────────────────────────────────

export function getBoard(profile: Profile): BoardActivity[] {
  return profile.board || [];
}

export function updateBoard(profile: Profile, board: BoardActivity[]): Profile {
  return { ...profile, board };
}

// ── Shared helpers ───────────────────────────────────────────────────────────

export function calcAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date();
  const totalMonths =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  const days = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} old`;
  if (totalMonths < 12) return `${totalMonths} month${totalMonths !== 1 ? "s" : ""} old`;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (months === 0) return `${years} year${years !== 1 ? "s" : ""} old`;
  return `${years}y ${months}m old`;
}

export function calcAgeMonths(dob: string): number {
  const birth = new Date(dob);
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
}

export function calcProgressPercent(dob: string): number {
  const birth = new Date(dob);
  const now = new Date();
  const ageMs = now.getTime() - birth.getTime();
  const maxMs = 7 * 365.25 * 24 * 60 * 60 * 1000;
  return Math.min(Math.round((ageMs / maxMs) * 100), 100);
}
