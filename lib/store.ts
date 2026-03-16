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
  minMonths: number;
  tip: string; // actionable advice to help the child reach this milestone
}

export const ALL_MILESTONES: MilestoneDef[] = [
  { id: "smile",       emoji: "😊", label: "First social smile",      minMonths: 1,  tip: "Respond to every coo and expression — lots of face-to-face time and smiling back is what triggers it." },
  { id: "head_up",     emoji: "💪", label: "Holds head up",            minMonths: 2,  tip: "Daily tummy time is the key — even 2–3 minutes several times a day rapidly builds the neck strength needed." },
  { id: "tracks",      emoji: "👀", label: "Tracks objects with eyes", minMonths: 2,  tip: "Hold a bright toy about 25 cm from their face and move it slowly side to side for them to follow with their eyes." },
  { id: "babbles",     emoji: "🗣️", label: "Babbles & coos",           minMonths: 3,  tip: "Talk back using their sounds — if they say 'ba ba', you echo 'ba ba!' This turn-taking encourages more." },
  { id: "sits",        emoji: "🪑", label: "Sits without support",     minMonths: 6,  tip: "Practice supported sitting with cushions around them and let them reach for toys to build core balance." },
  { id: "crawls",      emoji: "🐾", label: "Crawls",                   minMonths: 8,  tip: "Place a favourite toy just out of reach during tummy time to give them a reason to move towards it." },
  { id: "waves",       emoji: "👋", label: "Waves bye-bye",            minMonths: 9,  tip: "Wave and say 'bye-bye' consistently every time someone leaves — repetition over weeks is what works." },
  { id: "first_words", emoji: "💬", label: "First words",              minMonths: 10, tip: "Name everything you see and do together. The more varied language they hear, the sooner words come." },
  { id: "walks",       emoji: "🚶", label: "Walking",                  minMonths: 12, tip: "Encourage cruising along furniture and offer your hands for support — avoid baby walkers, which can delay walking." },
  { id: "spoon",       emoji: "🥄", label: "Uses spoon",               minMonths: 15, tip: "Start with thick foods like yogurt or mashed potato and let them explore freely. Expect mess — it's part of learning!" },
  { id: "two_words",   emoji: "🗨️", label: "2-word phrases",           minMonths: 18, tip: "Expand their single words — when they say 'ball', respond 'big ball!' or 'kick ball!' to model combinations." },
  { id: "runs",        emoji: "🏃", label: "Running",                  minMonths: 18, tip: "Active play like chasing a rolling ball, dancing, and climbing gentle slopes builds the coordination needed." },
  { id: "sings",       emoji: "🎵", label: "Sings simple songs",       minMonths: 24, tip: "Sing the same 2–3 songs repeatedly every day. Repetition is how they learn the words — 'Twinkle Twinkle' is perfect." },
  { id: "potty",       emoji: "🚽", label: "Toilet training begun",    minMonths: 24, tip: "Look for readiness signs: staying dry for 2+ hours, showing interest in the toilet, or telling you when they're wet." },
  { id: "scissors",    emoji: "✂️", label: "Using scissors",           minMonths: 36, tip: "Start with playdough — squeezing scissors to cut it builds exactly the hand strength needed before moving to paper." },
  { id: "sharing",     emoji: "🤝", label: "Sharing with peers",       minMonths: 36, tip: "Play turn-taking games with blocks or balls and use consistent language: 'My turn, now your turn.'" },
  { id: "draws",       emoji: "🎨", label: "Draws shapes",             minMonths: 36, tip: "Let them scribble freely first, then draw a face together — 'circle for the head, two dots for eyes' is a great start." },
  { id: "letters",     emoji: "🔡", label: "Recognises letters",       minMonths: 42, tip: "Point out letters everywhere on signs, packaging, and books. Always start with the letters in their own name." },
  { id: "reads",       emoji: "📖", label: "Reads simple words",       minMonths: 60, tip: "Pair simple words with pictures they know well. Start with their name, family names, and labels on familiar objects." },
  { id: "writes_name", emoji: "✏️", label: "Writes own name",          minMonths: 60, tip: "Trace their name in sand or salt first — chunky crayons help build the pencil grip they need to write independently." },
  { id: "bike",        emoji: "🚲", label: "Rides a bike",             minMonths: 60, tip: "Lower the seat so both feet rest flat on the ground, then let them walk the bike before attempting to glide." },
];

/** Returns milestones expected up to 3 months ahead — used on the onboarding screen */
export function getMilestonesForOnboarding(ageMonths: number): MilestoneDef[] {
  return ALL_MILESTONES.filter(m => m.minMonths <= ageMonths + 3);
}

/** Returns the next N unchecked milestones for the child's age — drives the dashboard */
export function getNextMilestones(profile: Profile, count = 3): MilestoneDef[] {
  const ageMonths = calcAgeMonths(profile.dob);
  return ALL_MILESTONES
    .filter(m => !profile.milestones[m.id] && m.minMonths <= ageMonths + 6)
    .sort((a, b) => a.minMonths - b.minMonths)
    .slice(0, count);
}

/** Human-readable expected age string for a milestone */
export function milestoneExpectedAge(minMonths: number): string {
  if (minMonths < 12) return `around ${minMonths} month${minMonths !== 1 ? "s" : ""}`;
  const years = Math.floor(minMonths / 12);
  const months = minMonths % 12;
  if (months === 0) return `around ${years} year${years !== 1 ? "s" : ""}`;
  return `around ${years}y ${months}m`;
}

// ── Activity definitions ─────────────────────────────────────────────────────

export interface ActivityDef {
  emoji: string;
  title: string;
  desc: string;
  tag: string;
  minMonths: number;
  maxMonths: number;
  howTo?: string[];      // step-by-step tips shown inline
  videoQuery?: string;   // YouTube search query (falls back to title if omitted)
}

export const ALL_ACTIVITIES: ActivityDef[] = [
  // 0–6 months
  {
    emoji: "🤸", title: "Tummy time", desc: "Build neck & shoulder strength",
    tag: "Physical", minMonths: 0, maxMonths: 5,
    videoQuery: "tummy time newborn baby how to",
    howTo: [
      "Place baby face-down on a firm, flat surface while fully awake and supervised — never during sleep.",
      "Get down to their level: make eye contact, hold a toy in front of them, or place a mirror to encourage them to lift their head.",
      "Start with just 2–3 minutes, 2–3 times a day. Gradually increase as they grow stronger — aim for 30 min total by 3 months.",
    ],
  },
  {
    emoji: "🎵", title: "Sing lullabies", desc: "Soothes and builds language",
    tag: "Language", minMonths: 0, maxMonths: 11,
    videoQuery: "lullabies for babies songs",
    howTo: [
      "Choose 2–3 favourite songs and repeat them — familiarity helps babies feel secure and builds memory.",
      "Sing slowly and clearly, exaggerating vowel sounds. Babies tune into the rhythm and pitch of your voice.",
      "Use during nappy changes, feeding, or bath time to create a calming routine.",
    ],
  },
  {
    emoji: "👀", title: "Track bright toys", desc: "Strengthens visual tracking",
    tag: "Cognitive", minMonths: 1, maxMonths: 5,
    videoQuery: "visual tracking activity newborn baby development",
    howTo: [
      "Hold a high-contrast toy (black and white patterns or bright red) about 20–30 cm from baby's face — that's their ideal focus distance.",
      "Move it slowly from side to side, pausing when they fix their gaze on it.",
      "Try a torch shone on the ceiling in a dim room — babies love tracking light.",
    ],
  },
  {
    emoji: "🔔", title: "Sound matching", desc: "Match sounds to objects or animals",
    tag: "Language", minMonths: 2, maxMonths: 36,
    videoQuery: "animal sounds for babies toddlers learning",
    howTo: [
      "Hold up an object or picture card and make its sound — a toy cow and 'moo', a bell and its ring.",
      "Pause after each sound and watch their reaction. Repeat the same pairings across multiple sessions.",
      "Graduate to books with animal pictures and ask 'What does the dog say?' as they get older.",
    ],
  },
  {
    emoji: "🤲", title: "Gentle massage", desc: "Skin-to-skin bonding & body awareness",
    tag: "Sensory", minMonths: 0, maxMonths: 11,
    videoQuery: "baby massage tutorial newborn how to",
    howTo: [
      "Use a small amount of baby-safe oil. Warm your hands by rubbing them together first.",
      "Use gentle, slow strokes — start with legs and feet (less sensitive) before moving to tummy and back.",
      "Narrate as you go: 'Now I'm massaging your little feet!' — this builds body awareness and language.",
    ],
  },
  // 6–12 months
  {
    emoji: "🙈", title: "Peek-a-boo", desc: "Teaches object permanence",
    tag: "Cognitive", minMonths: 5, maxMonths: 17,
    videoQuery: "peek a boo baby game how to play",
    howTo: [
      "Cover your face with both hands, pause for a second to build anticipation — then reveal with a big 'Peek-a-boo!'",
      "Vary it: hide behind a cloth, peek around a door, or use a soft toy to hide your face.",
      "Let them take the lead and cover their own face — celebrate when they uncover with delight.",
    ],
  },
  {
    emoji: "🧱", title: "Stacking blocks", desc: "Develops hand-eye coordination",
    tag: "Motor", minMonths: 8, maxMonths: 29,
    videoQuery: "stacking blocks baby toddler activity",
    howTo: [
      "Start with 2–3 large, lightweight blocks on a stable surface. Demonstrate stacking slowly.",
      "Count aloud as you build: 'One block… two blocks… three!' Pause to let them reach out.",
      "Let them knock it down — the crash is half the fun and teaches cause-and-effect thinking.",
    ],
  },
  {
    emoji: "📚", title: "Story time", desc: "Read 2 short books today",
    tag: "Language", minMonths: 6, maxMonths: 83,
    videoQuery: "how to read to baby toddler tips",
    howTo: [
      "Choose books with bold, simple pictures for young babies. For toddlers, pick repetitive text they can join in with.",
      "Use different voices for characters and point to pictures as you name them: 'Look — a big red bus!'",
      "Pause and ask questions: 'What's that?', 'What happens next?' — conversation matters more than finishing the book.",
    ],
  },
  {
    emoji: "🫧", title: "Bubble play", desc: "Blow and chase bubbles together",
    tag: "Sensory", minMonths: 6, maxMonths: 48,
    videoQuery: "bubble play baby toddler activity benefits",
    howTo: [
      "For babies: blow bubbles slowly so they can track them with their eyes — great for visual development.",
      "For toddlers: show them how to blow gently through the wand. A straw dipped in soapy water also works.",
      "Chase and pop bubbles together to encourage movement, reaching, and coordination.",
    ],
  },
  {
    emoji: "🌊", title: "Water exploration", desc: "Pouring, splashing, sink & float",
    tag: "Sensory", minMonths: 8, maxMonths: 48,
    videoQuery: "water play activity baby toddler sensory",
    howTo: [
      "Set up a shallow tub of water (just a few centimetres) with cups, funnels, and spoons. Always supervise.",
      "Demonstrate pouring water from one cup to another and watch them copy — this builds fine motor skills.",
      "Drop in objects and ask 'Will it sink or float?' — rubber duck, stone, sponge, coin. Early science thinking!",
    ],
  },
  // 12–24 months
  {
    emoji: "🏃", title: "Outdoor play", desc: "30 min of active movement",
    tag: "Physical", minMonths: 12, maxMonths: 83,
    videoQuery: "outdoor play ideas toddler child development",
    howTo: [
      "Aim for at least 30 minutes of active outdoor time daily. Even a garden or small park works.",
      "Encourage unstructured exploration — following a bug, climbing a low step, rolling down a gentle slope.",
      "Bring simple props: chalk, a ball, a bucket. Let them lead the play rather than directing it.",
    ],
  },
  {
    emoji: "🌿", title: "Nature walk", desc: "Explore the outdoors together",
    tag: "Sensory", minMonths: 12, maxMonths: 83,
    videoQuery: "nature walk toddler activity ideas",
    howTo: [
      "Bring a small bag to collect interesting things: leaves, smooth stones, feathers, fallen petals.",
      "Slow down and narrate what you notice: 'Look — a ladybird on that leaf! Can you see its spots?'",
      "Examine finds at home with a magnifying glass and make a simple nature display together.",
    ],
  },
  {
    emoji: "🧸", title: "Toy storytelling", desc: "Act out stories with stuffed animals",
    tag: "Social", minMonths: 18, maxMonths: 60,
    videoQuery: "pretend play stuffed animals toddler storytelling",
    howTo: [
      "Set the scene: 'Teddy is hungry — what shall we feed him?' Let the story grow naturally.",
      "Give each toy a simple, distinct voice and personality. Follow their lead if they take over.",
      "Use real-life situations — bedtime, a trip to the shops — to help them process daily experiences.",
    ],
  },
  {
    emoji: "🎨", title: "Finger painting", desc: "Great for fine motor skills",
    tag: "Creative", minMonths: 18, maxMonths: 83,
    videoQuery: "finger painting toddler activity how to",
    howTo: [
      "Cover the surface with a plastic sheet or use a high-chair tray. Use non-toxic, washable paints only.",
      "Dip their fingers in paint and guide them to paper — then step back and let them explore freely.",
      "Name colours as they mix: 'Wow, you mixed blue and yellow — now it's green!' Builds colour vocabulary.",
    ],
  },
  {
    emoji: "🧪", title: "Sand & water play", desc: "Sensory exploration",
    tag: "Sensory", minMonths: 18, maxMonths: 59,
    videoQuery: "sand water play toddler sensory activity",
    howTo: [
      "Set up a tray of sand or a shallow water tub with scoops, cups, and small toys.",
      "Demonstrate actions: dig, pour, mould, and let them copy. Narrate what you're doing.",
      "Add objects that create interesting results — a funnel, a sieve, moulds — and let curiosity guide them.",
    ],
  },
  {
    emoji: "🎭", title: "Pretend play", desc: "Boosts imagination & social skills",
    tag: "Social", minMonths: 18, maxMonths: 83,
    videoQuery: "pretend play toddler ideas imaginative play",
    howTo: [
      "Set up a simple scene: a toy kitchen, a dolls' tea party, a cardboard-box car or rocket.",
      "Join in as a character rather than directing — follow their ideas and build on them.",
      "Introduce simple problems for them to solve: 'Oh no, teddy hurt his paw — what do we do?'",
    ],
  },
  {
    emoji: "🖐️", title: "Playdough", desc: "Squish, roll, and shape dough",
    tag: "Motor", minMonths: 18, maxMonths: 72,
    videoQuery: "playdough activity toddler fine motor skills",
    howTo: [
      "Show the basic moves first: roll into a ball, flatten into a pancake, roll into a snake.",
      "For children under 2, use edible dough (flour, water, salt) in case it goes in the mouth.",
      "Add simple tools as they progress: a rolling pin, cookie cutters, a plastic knife for cutting.",
    ],
  },
  {
    emoji: "🎠", title: "Obstacle course", desc: "Crawl under, climb over, jump!",
    tag: "Physical", minMonths: 18, maxMonths: 72,
    videoQuery: "obstacle course toddler indoor outdoor ideas",
    howTo: [
      "Use what you have: sofa cushions to crawl over, a tunnel made from a blanket over chairs, hula hoops to step in.",
      "Demonstrate each element first, then cheer them through. Keep it short — 4–5 elements is plenty.",
      "Make it harder as they improve: add a time challenge, reverse the order, or introduce a soft ball to carry.",
    ],
  },
  // 24–36 months
  {
    emoji: "✏️", title: "Drawing & coloring", desc: "Develops creativity & fine motor",
    tag: "Creative", minMonths: 24, maxMonths: 83,
    videoQuery: "drawing colouring activity toddler child development",
    howTo: [
      "Start with chunky crayons or triangular pencils — easier for small hands to grip.",
      "Draw simple shapes or outlines for them to colour in, or let them draw freely. Both are equally valid.",
      "Ask open questions about their drawings: 'Tell me about this' rather than 'Is that a dog?'",
    ],
  },
  {
    emoji: "🚴", title: "Balance bike", desc: "Build coordination & confidence",
    tag: "Physical", minMonths: 24, maxMonths: 60,
    videoQuery: "balance bike toddler how to teach learn",
    howTo: [
      "Adjust the seat so both feet rest flat on the ground — they should be able to walk the bike easily.",
      "Start on a flat, smooth surface. Let them walk the bike before attempting to glide.",
      "Find a gentle slope so they naturally pick up their feet and glide. Celebrate every attempt, not just success.",
    ],
  },
  {
    emoji: "🫶", title: "Emotion cards", desc: "Name feelings from picture cards",
    tag: "Social", minMonths: 24, maxMonths: 60,
    videoQuery: "emotion cards toddler feelings activity",
    howTo: [
      "Show one card at a time: 'This face looks happy. When do you feel happy?'",
      "Make the expressions yourself and ask them to copy — mirror play is very effective for emotional learning.",
      "Connect to real moments: 'Remember when we got ice cream? That felt exciting, right?'",
    ],
  },
  {
    emoji: "🎸", title: "Music & movement", desc: "Dance and play with instruments",
    tag: "Creative", minMonths: 12, maxMonths: 83,
    videoQuery: "music movement activity baby toddler dance",
    howTo: [
      "Put on upbeat music and model simple moves: clapping, stomping, spinning, waving arms.",
      "Play freeze dance — everyone freezes when the music stops. Great for listening and self-control.",
      "For babies, hold them and sway or bounce gently to the rhythm — skin-to-skin + music is powerful.",
    ],
  },
  // 30–48 months
  {
    emoji: "🔢", title: "Counting games", desc: "Fun number recognition",
    tag: "Cognitive", minMonths: 30, maxMonths: 83,
    videoQuery: "counting games toddler preschool maths activity",
    howTo: [
      "Count everyday objects together: stairs as you climb them, grapes at snack time, toys during tidy-up.",
      "Use fingers to count tangibly — touch each object as you count rather than just reciting numbers.",
      "Play 'Give me three' — ask them to bring you exactly three blocks or biscuits to build number sense.",
    ],
  },
  {
    emoji: "🍳", title: "Kitchen helper", desc: "Simple tasks like stirring & pouring",
    tag: "Motor", minMonths: 30, maxMonths: 83,
    videoQuery: "cooking with toddler preschooler kitchen activity",
    howTo: [
      "Give them a real, simple job: stirring batter, pouring measured water, or tearing lettuce.",
      "Narrate as you cook: 'We're adding two cups of flour — can you count with me?' Combines maths and literacy.",
      "Use child-safe utensils and a step stool so they can reach the counter safely.",
    ],
  },
  {
    emoji: "🧩", title: "Simple puzzles", desc: "Builds problem-solving skills",
    tag: "Cognitive", minMonths: 18, maxMonths: 59,
    videoQuery: "puzzle activity toddler preschool problem solving",
    howTo: [
      "Start with chunky, peg puzzles for younger children — 4 to 6 large pieces.",
      "Turn puzzle pieces right-side up and let them try independently before offering help.",
      "Use encouraging language: 'Hmm, does that piece fit there? Try turning it.' Avoid solving it for them.",
    ],
  },
  // 36–60 months
  {
    emoji: "🎲", title: "Simple board games", desc: "Teaches turn-taking & patience",
    tag: "Social", minMonths: 36, maxMonths: 83,
    videoQuery: "board games for toddlers preschoolers turn taking",
    howTo: [
      "Choose games with 1 simple rule: Snakes & Ladders, Pairs (memory), or simple lotto cards.",
      "Model turn-taking clearly: 'It's my turn, then your turn.' Verbalise every step at first.",
      "Let them win sometimes — but also model good sportsmanship when you win: 'Oh well, great game!'",
    ],
  },
  {
    emoji: "🌱", title: "Mini garden", desc: "Plant seeds and watch them grow",
    tag: "Cognitive", minMonths: 36, maxMonths: 83,
    videoQuery: "gardening with kids toddler preschooler plant seeds",
    howTo: [
      "Start with fast-growing seeds like cress, sunflowers, or beans — visible progress keeps them engaged.",
      "Let them do the digging, planting, and watering themselves. Give them ownership of their plant.",
      "Keep a simple journal: draw or photograph the plant each week to see how it's changed.",
    ],
  },
  {
    emoji: "🔍", title: "I spy outdoors", desc: "Find colours, shapes & animals outside",
    tag: "Cognitive", minMonths: 24, maxMonths: 72,
    videoQuery: "I spy outdoor activity children observation",
    howTo: [
      "Start with colours for younger children: 'I spy something red.' Move to shapes and letters as they grow.",
      "Take turns so they practice giving clues — this builds descriptive language.",
      "Use a notebook to tick off or draw what you find. Makes it feel like a real adventure.",
    ],
  },
  {
    emoji: "🎯", title: "Target practice",     desc: "Bean bags, hoops, or ring toss",
    tag: "Physical", minMonths: 36, maxMonths: 83,
    videoQuery: "target games kids gross motor skills activity",
    howTo: [
      "Start close to the target and move back as their aim improves — success builds motivation.",
      "Use soft objects (bean bags, rolled socks) and a large target like a laundry basket.",
      "Count scores together and make it competitive once they're ready — great for maths and resilience.",
    ],
  },
  {
    emoji: "✂️", title: "Cutting practice", desc: "Snip paper with child-safe scissors",
    tag: "Motor", minMonths: 36, maxMonths: 72,
    videoQuery: "how to teach child to use scissors preschool",
    howTo: [
      "Use proper child-safety scissors with rounded tips. Check the hand-hold fits their grip.",
      "Start with snipping across thin strips of paper — just one cut at a time. Progress to cutting along a thick line.",
      "Hold the paper taut for them initially so they can focus on the scissor movement.",
    ],
  },
  // 42–84 months
  {
    emoji: "🔡", title: "Letter hunt", desc: "Spot letters on signs & books",
    tag: "Language", minMonths: 42, maxMonths: 83,
    videoQuery: "letter recognition activity preschool alphabet learning",
    howTo: [
      "Pick one letter per outing and hunt for it on signs, shop fronts, car number plates, and packaging.",
      "Connect to their name: 'Look — there's an S, same as in Sofia!'",
      "Use magnetic letters on the fridge to practise forming the letters they spot.",
    ],
  },
  {
    emoji: "📖", title: "Reading together", desc: "Read a chapter book aloud",
    tag: "Language", minMonths: 60, maxMonths: 83,
    videoQuery: "reading aloud to children benefits tips chapter book",
    howTo: [
      "Choose a chapter book slightly above their reading level — being read to accelerates vocabulary.",
      "Stop at cliffhangers and ask 'What do you think will happen next?' to build comprehension.",
      "Let them follow along with a finger if they're beginning to read, or just listen and picture the story.",
    ],
  },
  {
    emoji: "🧮", title: "Simple maths games", desc: "Add and subtract with objects",
    tag: "Cognitive", minMonths: 54, maxMonths: 83,
    videoQuery: "maths games for kids addition subtraction fun",
    howTo: [
      "Use physical objects — counters, coins, fruit — to make adding and subtracting tangible.",
      "Play shop: give them coins and price simple items. They'll practise maths without realising it.",
      "Use dice games: roll two dice and race to add the numbers. Quick, fun, and effective.",
    ],
  },
  {
    emoji: "🎬", title: "Make a mini movie", desc: "Act out & film a short story",
    tag: "Creative", minMonths: 54, maxMonths: 83,
    videoQuery: "make a movie with kids creative activity storytelling",
    howTo: [
      "Let them write (or dictate) a simple 3-scene story: beginning, problem, solution.",
      "Use toys, costumes, or the garden as props and setting. Film on a phone or tablet.",
      "Watch it back together — they'll be amazed and want to make more. Add narration or titles for older children.",
    ],
  },
  {
    emoji: "🤸", title: "Yoga for kids", desc: "Simple poses with animal names",
    tag: "Physical", minMonths: 36, maxMonths: 83,
    videoQuery: "kids yoga poses animals preschool toddler",
    howTo: [
      "Pick 4–5 animal poses: Cat (arch the back), Cobra (lift the chest), Downward Dog, Tree (balance on one foot).",
      "Give each pose its animal sound — Cat goes 'meow!' while stretching. Keeps it playful and memorable.",
      "Follow a short 5-minute kids yoga video together or use picture cards for them to copy.",
    ],
  },
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
