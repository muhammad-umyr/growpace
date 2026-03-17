// ── Types ────────────────────────────────────────────────────────────────────

export interface ProgressEntry {
  date: string;      // ISO string
  progress: number;  // 25 | 50 | 75 | 100
  note?: string;
}

export const PROGRESS_STAGES: { value: number; label: string; short: string }[] = [
  { value: 25,  label: "Just started",      short: "Started" },
  { value: 50,  label: "Making progress",   short: "In progress" },
  { value: 75,  label: "Almost there",      short: "Almost there" },
  { value: 100, label: "Completed!",        short: "Done" },
];

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
  progressLog: ProgressEntry[];
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
  milestoneProgress: Record<string, string>; // milestoneId → stage id
  journal: JournalEntry[];
  board: BoardActivity[];
  createdAt: string;
}

// ── Milestone definitions ────────────────────────────────────────────────────

export interface MilestoneStage {
  id: string;
  label: string;
  nextTip: string;
}

export interface MilestoneDef {
  id: string;
  emoji: string;
  label: string;
  minMonths: number;
  tip: string;
  tag: string;
  image?: string;
  stages: MilestoneStage[];
}

export const ALL_MILESTONES: MilestoneDef[] = [
  {
    id: "smile", emoji: "😊", label: "First social smile", minMonths: 1, tag: "Social",
    image: "https://source.unsplash.com/featured/800x400/?baby,smile,mother,face",
    tip: "Respond to every coo and expression — lots of face-to-face time and smiling back is what triggers it.",
    stages: [
      { id: "s1", label: "No smiles yet, mostly sleeping", nextTip: "This is completely normal in the first weeks. Hold your baby close during feeds and talk softly to their face — eye contact and calm voices set the stage for that first smile." },
      { id: "s2", label: "Occasional random smiles (could be wind!)", nextTip: "Those reflex smiles are nearly social ones. Lean in close, make eye contact, and smile slowly and repeatedly — your face is their favourite thing to watch." },
      { id: "s3", label: "Smiles when I talk to them", nextTip: "You're almost there! Try exaggerating your expressions — big eyes, big smiles, gentle 'oh wow!' sounds. Give them 5–10 seconds to respond before prompting again." },
      { id: "s4", label: "Smiles back at me reliably", nextTip: "Wonderful! Now build on it — try making funny sounds or gentle peek-a-boo to encourage the next step: laughing." },
    ],
  },
  {
    id: "head_up", emoji: "💪", label: "Holds head up", minMonths: 2, tag: "Motor",
    image: "https://source.unsplash.com/featured/800x400/?baby,tummy,time,floor",
    tip: "Daily tummy time is the key — even 2–3 minutes several times a day rapidly builds the neck strength needed.",
    stages: [
      { id: "s1", label: "Head flops down immediately", nextTip: "Start tummy time on your chest, not the floor — your body's warmth and smell keeps them calm long enough to try. Do 1–2 minutes after each nappy change." },
      { id: "s2", label: "Lifts head briefly then drops", nextTip: "Great start! Place a rolled towel under their chest to prop them slightly. Hold a bright toy at eye level just in front of them to motivate lifting." },
      { id: "s3", label: "Holds for a few seconds but wobbles", nextTip: "Strength is building fast. Increase tummy time to 3–5 minutes per session. Talk or sing from in front so they work to hold the position and look at you." },
      { id: "s4", label: "Holds head steady for a while", nextTip: "Almost there! Move to tummy time on a flat firm surface and place toys slightly to each side to encourage turning, which builds full neck muscle control." },
    ],
  },
  {
    id: "tracks", emoji: "👀", label: "Tracks objects with eyes", minMonths: 2, tag: "Sensory",
    image: "https://source.unsplash.com/featured/800x400/?baby,toy,newborn,play",
    tip: "Hold a bright toy about 25 cm from their face and move it slowly side to side for them to follow with their eyes.",
    stages: [
      { id: "s1", label: "Eyes don't seem to follow anything yet", nextTip: "Newborn vision is still developing. Use high-contrast black-and-white patterns held 20–30 cm away. Faces are the strongest magnet — yours works best." },
      { id: "s2", label: "Looks at objects but doesn't follow them", nextTip: "Move a bright toy very slowly from their midline to one side. Wait at the edge of their vision — they may track in short jerks rather than smoothly at first." },
      { id: "s3", label: "Tracks to one side but loses it coming back", nextTip: "Practice both directions equally. Try a torch in a dimmed room — the light contrast makes it much easier for them to lock on and follow across the midline." },
      { id: "s4", label: "Follows left to right but not up and down", nextTip: "Add vertical movement — slowly bring a toy from their chest up to their forehead. Then try gentle arcs. This builds the full range of eye muscle control." },
    ],
  },
  {
    id: "babbles", emoji: "🗣️", label: "Babbles & coos", minMonths: 3, tag: "Language",
    image: "https://source.unsplash.com/featured/800x400/?mother,baby,talking,bonding",
    tip: "Talk back using their sounds — if they say 'ba ba', you echo 'ba ba!' This turn-taking encourages more.",
    stages: [
      { id: "s1", label: "Mostly quiet, only cries or grunts", nextTip: "Talk constantly during daily routines — nappy changes, baths, feeds. They are absorbing every word even before responding. Narrate everything you do together." },
      { id: "s2", label: "Occasional cooing sounds", nextTip: "When they coo, pause and wait. If they coo again, mirror the sound back. This 'serve and return' pattern is the foundation of all language — keep sessions short (5 mins)." },
      { id: "s3", label: "Regular coos, starting to add consonants", nextTip: "Introduce more consonant sounds yourself: 'ba ba ba', 'ma ma ma', 'da da'. Exaggerate your mouth movements so they can see how sounds are made." },
      { id: "s4", label: "Active babbling with varied sounds", nextTip: "Treat their babble like a real conversation — ask questions, pause for their 'answer', then respond. Books with animal sounds are perfect at this stage." },
    ],
  },
  {
    id: "sits", emoji: "🪑", label: "Sits without support", minMonths: 6, tag: "Motor",
    image: "https://source.unsplash.com/featured/800x400/?baby,sitting,floor,play",
    tip: "Practice supported sitting with cushions around them and let them reach for toys to build core balance.",
    stages: [
      { id: "s1", label: "Can't sit even with hands propped", nextTip: "Keep doing floor time on their tummy and back. Supported sitting in your lap helps them feel the upright position safely — do this during play for 5–10 minutes a day." },
      { id: "s2", label: "Sits with my hands supporting their back", nextTip: "Gradually reduce support — hold at the hips rather than the back. Place toys just to the side so they lean and self-correct, which builds core muscle memory." },
      { id: "s3", label: "Sits alone briefly then tips over", nextTip: "Surround them with cushions and let them tip — catching themselves is the exercise! Place toys just out of reach to encourage leaning and recovering balance." },
      { id: "s4", label: "Sits steadily but wobbles reaching far", nextTip: "Place toys slightly further away and at different heights so they must twist and reach. This rotational core work is the last piece needed for fully stable sitting." },
    ],
  },
  {
    id: "crawls", emoji: "🐾", label: "Crawls", minMonths: 8, tag: "Motor",
    image: "https://source.unsplash.com/featured/800x400/?baby,crawling,floor",
    tip: "Place a favourite toy just out of reach during tummy time to give them a reason to move towards it.",
    stages: [
      { id: "s1", label: "Not moving independently yet", nextTip: "Make sure they have lots of time on a firm floor surface (not a soft mattress). Place a toy just out of reach during tummy time — motivation to move is everything at this stage." },
      { id: "s2", label: "Rocking on hands and knees", nextTip: "They have the position — now they need the push. Gently tap the floor in front of them and put a favourite toy just centimetres away. You can also put a rolled towel under their tummy to help." },
      { id: "s3", label: "Commando crawling (dragging on belly)", nextTip: "This is real mobility! Encourage getting up on hands and knees by placing them on a small rolled blanket under their tummy. Crawling through a low tunnel (made from chairs and a sheet) also encourages lifting up." },
      { id: "s4", label: "Gets moving but only goes backwards", nextTip: "Backwards crawling is common and normal — the arm muscles are just stronger than the legs right now. Tap the floor in front and just behind their knees to cue forward movement." },
    ],
  },
  {
    id: "waves", emoji: "👋", label: "Waves bye-bye", minMonths: 9, tag: "Social",
    image: "https://source.unsplash.com/featured/800x400/?toddler,waving,parent,happy",
    tip: "Wave and say 'bye-bye' consistently every time someone leaves — repetition over weeks is what works.",
    stages: [
      { id: "s1", label: "No reaction to waving or goodbyes", nextTip: "Wave at close range (30 cm) and say 'bye-bye!' in an animated voice every single time someone leaves. Pair it with something fun — like a big smile — so they pay attention to the gesture." },
      { id: "s2", label: "Watches when others wave but doesn't copy", nextTip: "Hold their wrist gently and physically wave their hand while saying 'bye-bye!' — doing it together helps wire the connection. Never force it; keep it playful." },
      { id: "s3", label: "Waves with lots of prompting", nextTip: "Prompt less — just say 'bye-bye!' and pause expectantly instead of demonstrating. They may wave with a slight delay. Celebrate any wave with a huge reaction." },
      { id: "s4", label: "Waves sometimes on their own", nextTip: "Keep consistent. Try 'hello' waves too — meeting people and waving hello is a great second cue. Within a few weeks of regular practice, it should become fully spontaneous." },
    ],
  },
  {
    id: "first_words", emoji: "💬", label: "First words", minMonths: 10, tag: "Language",
    image: "https://source.unsplash.com/featured/800x400/?toddler,parent,speech,talking",
    tip: "Name everything you see and do together. The more varied language they hear, the sooner words come.",
    stages: [
      { id: "s1", label: "Babbling but no clear words yet", nextTip: "Keep narrating your day constantly. The magic number is 21,000 words a day — you don't have to count, just never stop talking to them during routines, walks, and play." },
      { id: "s2", label: "Says mama/dada but not directed at anyone", nextTip: "Start responding as if it IS directed at you — turn around, make eye contact, say 'yes, I'm mama!' Associating the sound with a real person accelerates that connection." },
      { id: "s3", label: "1–2 consistent words with meaning", nextTip: "Expand on their words — if they say 'ball', you say 'yes, big red ball!' or 'throw ball!'. Model two-word phrases consistently so they hear what's coming next." },
      { id: "s4", label: "3–5 words and trying new ones", nextTip: "Introduce new simple words during shared activities. Point to pictures in books and name them. At this stage, vocabulary grows by exposure — the more words they hear in context, the faster the bank grows." },
    ],
  },
  {
    id: "walks", emoji: "🚶", label: "Walking", minMonths: 12, tag: "Motor",
    image: "https://source.unsplash.com/featured/800x400/?toddler,walking,first,steps,parent",
    tip: "Encourage cruising along furniture and offer your hands for support — avoid baby walkers, which can delay walking.",
    stages: [
      { id: "s1", label: "Not pulling to stand yet", nextTip: "Position them next to low sturdy furniture with a motivating toy on top. Gently assist them into a standing position and let them hold on — getting comfortable with weight-bearing comes first." },
      { id: "s2", label: "Pulling to stand, cruising along furniture", nextTip: "Create a 'furniture highway' — push your sofa close to the coffee table with a small gap. Place toys at intervals so they cruise between pieces. Leave the gap slightly too wide and they'll learn to step across." },
      { id: "s3", label: "Takes a few steps with support", nextTip: "Hold only one hand instead of two. Then try standing 3–4 steps away with your arms out and see if they'll walk to you. Motivation is key — make it a game, not a lesson." },
      { id: "s4", label: "Walking but falls often, needs confidence", nextTip: "This is normal — falling is how they learn to balance. Walk on different surfaces: grass, carpet, tiles. Push a toy cart in front of them for confidence. Shoes should be flexible with a non-slip sole." },
    ],
  },
  {
    id: "spoon", emoji: "🥄", label: "Uses spoon", minMonths: 15, tag: "Motor",
    image: "https://source.unsplash.com/featured/800x400/?toddler,eating,spoon,messy,food",
    tip: "Start with thick foods like yogurt or mashed potato and let them explore freely. Expect mess — it's part of learning!",
    stages: [
      { id: "s1", label: "Won't hold a spoon at all", nextTip: "Give them a spoon to hold during every meal — even if they don't use it to eat. Let them bang it, chew it, wave it. Familiarity comes before function." },
      { id: "s2", label: "Holds spoon but can't load it", nextTip: "Load the spoon for them and let them bring it to their mouth — this is the easiest part and builds confidence. Use thick sticky foods (hummus, mashed potato) that stay on the spoon longer." },
      { id: "s3", label: "Scoops but spills most of it", nextTip: "Use a bowl with a suction base so it doesn't move. A spoon with a short wide handle is easier to grip. Let them practise loading playdough in a bowl first — same motor skill, no mess pressure." },
      { id: "s4", label: "Gets food to mouth, still quite messy", nextTip: "This is normal — fine motor precision takes time. Try a fork alongside the spoon for foods like pasta; many children find stabbing easier than scooping. Celebrate any successful bite, messy or not." },
    ],
  },
  {
    id: "two_words", emoji: "🗨️", label: "2-word phrases", minMonths: 18, tag: "Language",
    image: "https://source.unsplash.com/featured/800x400/?toddler,mother,conversation,talking",
    tip: "Expand their single words — when they say 'ball', respond 'big ball!' or 'kick ball!' to model combinations.",
    stages: [
      { id: "s1", label: "Single words only, no combining yet", nextTip: "Consistently model two-word phrases yourself: 'more milk', 'daddy go', 'big dog'. Keep them simple. Repeat them every day in natural situations so they become familiar patterns." },
      { id: "s2", label: "Strings sounds together but not real words", nextTip: "Treat their jargon as real speech. Ask 'Oh, what happened?' and wait. Then narrate what you think they mean using a two-word phrase. Mirror their intent, model the words." },
      { id: "s3", label: "Occasionally combines two words", nextTip: "Prompt combinations gently: if they say 'juice', ask 'more juice?' and wait for them to attempt both words before handing it over. Don't make it a test — make it playful and low-pressure." },
      { id: "s4", label: "Regularly using two words, trying three", nextTip: "Now model three-word phrases: 'more apple please', 'daddy go work'. Read books with simple repetitive sentences. At this stage a 20-minute daily read-aloud is one of the strongest vocabulary builders there is." },
    ],
  },
  {
    id: "runs", emoji: "🏃", label: "Running", minMonths: 18, tag: "Physical",
    image: "https://source.unsplash.com/featured/800x400/?toddler,running,park,outside,play",
    tip: "Active play like chasing a rolling ball, dancing, and climbing gentle slopes builds the coordination needed.",
    stages: [
      { id: "s1", label: "Walking steadily but no running yet", nextTip: "Chase games are the best motivator — run away from them slowly and let them 'catch' you. The urgency naturally shifts their gait from walk to run without them realising." },
      { id: "s2", label: "Fast walking, tries to run but stiff-legged", nextTip: "Play on slightly sloped ground (a gentle grassy hill) — going downhill naturally increases speed and loosens the gait. Kicking a soft ball also helps coordinate arms and legs for running." },
      { id: "s3", label: "Running but falls frequently", nextTip: "Falling is part of building running coordination — the brain is still syncing arm swing with stride. Keep floors clear, use soft surfaces like grass, and do lots of chasing games to build confidence alongside coordination." },
      { id: "s4", label: "Running well, just needs more speed/control", nextTip: "Introduce direction changes — chase games with sudden turns, obstacle courses with cones, or kicking a rolling ball. These challenge them to control their speed, which is the final piece of confident running." },
    ],
  },
  {
    id: "sings", emoji: "🎵", label: "Sings simple songs", minMonths: 24, tag: "Language",
    image: "https://source.unsplash.com/featured/800x400/?child,singing,music,happy,mother",
    tip: "Sing the same 2–3 songs repeatedly every day. Repetition is how they learn the words — 'Twinkle Twinkle' is perfect.",
    stages: [
      { id: "s1", label: "Enjoys music but doesn't attempt to sing", nextTip: "Sing to them daily — the same 3 or 4 songs every day without fail. They are memorising the melody and words long before they attempt to sing. Familiarity is the foundation." },
      { id: "s2", label: "Hums along or bobs to music", nextTip: "Leave a gap at the end of a familiar line and see if they fill it in. 'Twinkle twinkle little…' — pause and wait. Most children fill in the last word of a song before they sing the whole thing." },
      { id: "s3", label: "Fills in last words of favourite songs", nextTip: "Extend the gaps — leave out the last two words, then a whole line. Sing together at bathtime or bedtime when they are relaxed. The consistent ritual context helps memory retrieval enormously." },
      { id: "s4", label: "Attempts whole songs, some words missing", nextTip: "Introduce actions (Wheels on the Bus, Head Shoulders Knees and Toes) — pairing movement with words dramatically speeds up memorisation of full lyrics. Sing slowly and point to actions clearly." },
    ],
  },
  {
    id: "potty", emoji: "🚽", label: "Toilet training begun", minMonths: 24, tag: "Physical",
    image: "https://source.unsplash.com/featured/800x400/?toddler,independence,learning,growing",
    tip: "Look for readiness signs: staying dry for 2+ hours, showing interest in the toilet, or telling you when they're wet.",
    stages: [
      { id: "s1", label: "No awareness of needing to go yet", nextTip: "Don't start training yet — they need to recognise the sensation first. Start by narrating: 'I think you're doing a wee now!' when you notice signs. Read books about potties and let them sit on one fully clothed to get familiar." },
      { id: "s2", label: "Tells me after they've gone, not before", nextTip: "This awareness is the green light to begin training. Go nappy-free at home for 1–2 weeks. Watch for their 'about to go' signs (going quiet, squatting) and quickly prompt the potty. Celebrate every success loudly." },
      { id: "s3", label: "Tells me sometimes before — still accidents", nextTip: "Set a timer to prompt potty visits every 90 minutes rather than waiting for them to tell you — anticipation beats reaction at this stage. Keep a potty in every room they spend time in. Accidents are normal; respond calmly." },
      { id: "s4", label: "Dry in the day, night training still needed", nextTip: "Night training is different — it depends on a hormone (ADH) that many children don't produce enough of until 4–5 years old. Lift them to the toilet before you go to bed, protect the mattress, and be patient. Most children get there without any intervention by age 5." },
    ],
  },
  {
    id: "scissors", emoji: "✂️", label: "Using scissors", minMonths: 36, tag: "Motor",
    image: "https://source.unsplash.com/featured/800x400/?child,scissors,cutting,paper,craft,mother",
    tip: "Start with playdough — squeezing scissors to cut it builds exactly the hand strength needed before moving to paper.",
    stages: [
      { id: "s1", label: "Can't hold scissors correctly yet", nextTip: "Start with tongs or tweezers to build the same pincer motion with less complexity. Playdough squeezed with both hands also builds the same muscles. Only introduce child scissors once grip is comfortable." },
      { id: "s2", label: "Holds scissors but can't make a cut", nextTip: "Try cutting playdough rolls — they offer resistance and don't slide. Place your hand over theirs to guide the squeeze-and-open motion. Short sessions (5 mins) are enough; hand muscles fatigue quickly." },
      { id: "s3", label: "Makes snips but can't cut along a line", nextTip: "Draw thick bold lines on paper and ask them to follow them — start with straight lines, then gradual curves. Cutting along a line requires coordinating both hands simultaneously, which takes practice over weeks." },
      { id: "s4", label: "Cuts along lines but struggles with curves", nextTip: "Practice with zigzag and wavy lines. Cutting out large simple shapes (a big circle, a square) is a great progression. Scissors with a spring-loaded return are helpful as they remove the need to open the fingers after each cut." },
    ],
  },
  {
    id: "sharing", emoji: "🤝", label: "Sharing with peers", minMonths: 36, tag: "Social",
    image: "https://source.unsplash.com/featured/800x400/?children,sharing,playing,together,toys",
    tip: "Play turn-taking games with blocks or balls and use consistent language: 'My turn, now your turn.'",
    stages: [
      { id: "s1", label: "Refuses to share anything at all", nextTip: "This is developmentally normal before age 3 — the concept of 'mine' is very new. Don't force sharing; instead narrate turn-taking: 'You have it now, then Liam will have a turn.' Keep expectations low and patience high." },
      { id: "s2", label: "Shares with an adult but not with peers", nextTip: "Adult turn-taking games are a great bridge. Roll a ball back and forth, take turns stacking blocks, alternate colouring with one set of crayons. Once turn-taking with you is solid, introduce a trusted peer in a supervised short play session." },
      { id: "s3", label: "Shares sometimes, but gets upset if pushed", nextTip: "Give them a sense of control: 'You can give it to Amara when you're done.' Naming their feelings helps: 'I know it's hard to share your favourite toy.' Prepare them before playdates about what they'll share and what is 'special' and put away." },
      { id: "s4", label: "Usually shares but still has difficult moments", nextTip: "This is age-appropriate — sharing is genuinely hard, even for adults! Reinforce the positives: 'I noticed you gave him a turn without being asked — that was so kind.' Stories and role-play about sharing also help consolidate the concept." },
    ],
  },
  {
    id: "draws", emoji: "🎨", label: "Draws shapes", minMonths: 36, tag: "Creative",
    image: "https://source.unsplash.com/featured/800x400/?child,drawing,crayons,art,creative",
    tip: "Let them scribble freely first, then draw a face together — 'circle for the head, two dots for eyes' is a great start.",
    stages: [
      { id: "s1", label: "Only random scribbles, no intent", nextTip: "Scribbling IS the foundation — they are building hand control and learning that marks mean something. Comment on what they make: 'I love all those lines!' Give them chunky crayons and large paper and make it joyful." },
      { id: "s2", label: "Intentional lines and dots, no shapes yet", nextTip: "Draw a circle slowly while narrating 'round and round' and ask them to try. Vertical lines usually come before horizontals. Draw alongside them rather than setting tasks — side-by-side play is more motivating than instruction." },
      { id: "s3", label: "Attempts circles but they're open or wobbly", nextTip: "Trace large circles together with your hand over theirs. Finger painting circles in shaving foam is low-pressure and tactile. Drawing on a vertical surface (paper on a wall) engages the whole arm and often produces rounder shapes." },
      { id: "s4", label: "Draws circles and lines, starting to make faces", nextTip: "Build on faces — ask 'where does the nose go?' and wait for them to add it. Drawing a person (head, body, arms, legs) emerges from this stage. Give them a mirror so they can look at their own face while drawing." },
    ],
  },
  {
    id: "letters", emoji: "🔡", label: "Recognises letters", minMonths: 42, tag: "Cognitive",
    image: "https://source.unsplash.com/featured/800x400/?child,alphabet,learning,letters,education",
    tip: "Point out letters everywhere on signs, packaging, and books. Always start with the letters in their own name.",
    stages: [
      { id: "s1", label: "No letter recognition yet", nextTip: "Start with their name — it is the most motivating set of letters they will ever learn. Spell it out on fridge magnets, write it on their drawings, point to it on their bag. Own-name recognition typically comes 6–8 weeks before other letters." },
      { id: "s2", label: "Recognises the first letter of their name", nextTip: "Spot 'their letter' everywhere you go — on signs, cereal boxes, number plates. This letter-spotting game builds the habit of noticing print. Then introduce the other letters in their name one at a time." },
      { id: "s3", label: "Knows most letters in their name", nextTip: "Introduce letters from family members' names — 'M for Mummy', 'D for Daddy'. Alphabet puzzles and foam bath letters are excellent because the child handles the physical shape, which reinforces visual memory." },
      { id: "s4", label: "Knows 10+ letters but confuses some", nextTip: "Common confusions: b/d, p/q, m/w, n/u. Address one pair at a time. For b and d, show that 'b' faces right like you're reading forward. Tracing letters in sand while saying the sound out loud engages three senses at once." },
    ],
  },
  {
    id: "reads", emoji: "📖", label: "Reads simple words", minMonths: 60, tag: "Cognitive",
    image: "https://source.unsplash.com/featured/800x400/?child,reading,book,parent,together",
    tip: "Pair simple words with pictures they know well. Start with their name, family names, and labels on familiar objects.",
    stages: [
      { id: "s1", label: "Knows letter sounds but can't blend yet", nextTip: "Blending is a separate skill from knowing sounds. Practice 'sound talking': say c-a-t slowly then 'push' the sounds together. Start with simple 3-letter words (CVC: consonant-vowel-consonant) — cat, dog, big, hop." },
      { id: "s2", label: "Blends 2–3 letter words slowly", nextTip: "Build a bank of 10–15 CVC words they can read reliably. Flashcards and simple word bingo make this repetitive practice fun. Don't rush — automaticity with simple words is the foundation everything else is built on." },
      { id: "s3", label: "Reads simple sentences word by word", nextTip: "Fluency comes from re-reading familiar books — they already know what happens, so the cognitive load drops and they can focus on reading smoothly. Have them read the same book 3–4 times before swapping to a new one." },
      { id: "s4", label: "Reading short books, just slow and effortful", nextTip: "This is completely normal — reading is hard work! Keep daily sessions to 10–15 minutes maximum to avoid fatigue. Let them choose books they love. Audiobooks alongside physical books also build fluency and vocabulary at this stage." },
    ],
  },
  {
    id: "writes_name", emoji: "✏️", label: "Writes own name", minMonths: 60, tag: "Cognitive",
    image: "https://source.unsplash.com/featured/800x400/?child,writing,pencil,paper,learning",
    tip: "Trace their name in sand or salt first — chunky crayons help build the pencil grip they need to write independently.",
    stages: [
      { id: "s1", label: "Can't hold a pencil with a proper grip yet", nextTip: "Build grip strength with playdough, threading beads, and using tweezers to pick up small objects. A triangular pencil grip attachment is helpful. Don't force a tripod grip — guide gently and model it yourself." },
      { id: "s2", label: "Traces over letters with help", nextTip: "Provide dotted name templates to trace over independently. Write their name in yellow highlighter and ask them to go over it in pencil. The physical act of tracing builds the motor memory for each letter shape." },
      { id: "s3", label: "Writes some letters of their name independently", nextTip: "Write your name alongside theirs for them to copy underneath. Focus on letter formation direction — most letters start at the top. Start with capital letters, which tend to be easier than lowercase for beginners." },
      { id: "s4", label: "Writes full name but letters are wobbly or reversed", nextTip: "Letter reversals are completely normal up to age 7 and not a sign of dyslexia. For sizing, use paper with a baseline and a 'sky line' to help them anchor letters. Celebrate the achievement — consistent practice over months smooths everything out." },
    ],
  },
  {
    id: "bike", emoji: "🚲", label: "Rides a bike", minMonths: 60, tag: "Physical",
    image: "https://source.unsplash.com/featured/800x400/?child,bicycle,riding,park,outdoor",
    tip: "Lower the seat so both feet rest flat on the ground, then let them walk the bike before attempting to glide.",
    stages: [
      { id: "s1", label: "Not interested or scared of the bike", nextTip: "Don't push — forced early experiences create lasting reluctance. Let them sit on the bike while it is stationary and just play. Watch other children riding. Interest has to come from them; your role is exposure without pressure." },
      { id: "s2", label: "Walking the bike but won't lift feet", nextTip: "Find a very gentle grassy slope (almost flat). Lower the seat so feet are fully flat on the ground. Let them walk the bike down the slope — gravity will naturally encourage them to lift their feet to glide. Don't rush to pedals." },
      { id: "s3", label: "Gliding with feet up for a few seconds", nextTip: "Balance is coming — this is the hard part! Now add pedals back (if on a balance bike, transition to a pedal bike with the same low seat setting). Hold the back of the seat lightly for confidence but let go whenever they are balancing well." },
      { id: "s4", label: "Pedalling but steering and stopping are tricky", nextTip: "Set up a simple cone course in a car park or quiet path to practice turning. Teach braking before anything else — squeezing the brake handle while stopped, then at very slow speeds. Confidence in stopping removes the biggest fear." },
    ],
  },
];

/** Returns milestones from the last 12 months up to 3 months ahead — used on the onboarding screen */
export function getMilestonesForOnboarding(ageMonths: number): MilestoneDef[] {
  const minVisible = Math.max(0, ageMonths - 12);
  return ALL_MILESTONES.filter(m => m.minMonths >= minVisible && m.minMonths <= ageMonths + 3);
}

/** Returns the next N unchecked milestones for the child's age — drives the dashboard */
export function getNextMilestones(profile: Profile, count = 3): MilestoneDef[] {
  const ageMonths = calcAgeMonths(profile.dob);
  return ALL_MILESTONES
    .filter(m => !profile.milestones[m.id] && m.minMonths >= ageMonths - 3)
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
  const p = getProfiles().find(p => p.id === id) ?? null;
  if (p && !p.milestoneProgress) p.milestoneProgress = {};
  return p;
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
  return (profile.board || []).map(a => ({ ...a, progressLog: a.progressLog ?? [] }));
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
