import type { StudioProvider, StudioRequest, StudioResult, StudioToolType } from "./types"

const MOCK_DELAY = 600

async function delay(ms = MOCK_DELAY) {
  await new Promise((r) => setTimeout(r, ms))
}

function analyzeCharacters(req: StudioRequest): StudioResult {
  return {
    content: `## Character Analysis for "${req.storyTitle || "Untitled"}"
    
### Protagonist Analysis
The main character follows a classic hero's journey arc. Key traits:
- **Motivation**: Drives the central conflict through personal stakes
- **Development**: Undergoes significant change from beginning to end
- **Relationships**: Central relationships define key turning points

### Supporting Characters
Each supporting character serves both plot and theme:

| Character | Role | Arc |
|-----------|------|-----|
| Primary Ally | Support & Foil | Steady presence, moral compass |
| Antagonist | Conflict Driver | Complex motivation, not purely evil |
| Mentor Figure | Guidance | Passing wisdom, possible sacrifice |

### Character Arc Recommendations
1. Strengthen the protagonist's internal conflict in Act 2
2. Give the antagonist more sympathetic moments
3. Ensure each supporting character has a complete mini-arc`,
  }
}

function analyzeTimeline(req: StudioRequest): StudioResult {
  return {
    content: `## Timeline: "${req.storyTitle || "Untitled"}"
    
### Act I — Setup
- **Chapter 1-3**: Introduction to the world and protagonist's ordinary life
- **Chapter 4-6**: Inciting incident and initial reaction
- **Chapter 7-10**: Decision to embark on the journey

### Act II — Confrontation
- **Chapter 11-15**: Rising action and new alliances
- **Chapter 16-20**: Midpoint crisis and reversal
- **Chapter 21-25**: Training, preparation, and setbacks

### Act III — Resolution
- **Chapter 26-28**: Final preparation and plan execution
- **Chapter 29-31**: Climax and confrontation
- **Chapter 32-33**: Falling action and new normal

### Timeline Gaps
- Consider adding more content between chapters ${Math.max(1, (req.chapters?.length || 10) - 2)} and ${Math.max(2, req.chapters?.length || 10)}`,
  }
}

function analyzeWorld(req: StudioRequest): StudioResult {
  return {
    content: `## World History: "${req.storyTitle || "Untitled"}"

### Ancient Era
The foundations of this world were laid in ancient times, with civilizations rising and falling. Key events shaped the geography and magical landscape.

### The Golden Age
A period of prosperity and advancement. Trade routes connected distant lands. Knowledge flourished in great libraries and academies.

### The Great Conflict
A war or cataclysm that reshaped the political landscape. Borders were redrawn. Old powers fell, and new ones emerged.

### Modern Era
The current state of the world. Political tensions, cultural shifts, and looming threats set the stage for the story.

### Worldbuilding Notes
- **Magic System**: Rules, costs, and limitations should be clearly defined
- **Geography**: Climate, resources, and natural barriers affect travel and trade
- **Culture**: Traditions, taboos, and social structures create authentic societies
- **Economy**: What drives trade? What is valuable?`,
  }
}

function analyzeThemes(req: StudioRequest): StudioResult {
  return {
    content: `## Thematic Analysis: "${req.storyTitle || "Untitled"}"

### Primary Themes
1. **Identity & Self-Discovery** — The protagonist's journey of understanding who they truly are
2. **Sacrifice & Redemption** — Characters face difficult choices that test their values
3. **Power & Responsibility** — The cost and burden of great power

### Secondary Themes
- Justice vs. Mercy
- Tradition vs. Progress
- Love in times of hardship

### Symbolism
| Symbol | Meaning | Appears In |
|--------|---------|------------|
| Light/Dark | Knowledge vs. ignorance | Opening chapters |
| The Journey | Personal growth | Throughout |
| The Circle | Unity, cycles | Climax |

### Recommendations
- Reinforce themes through recurring imagery
- Use character dialogue to explore thematic questions
- Let the climax crystallize the central theme`,
  }
}

function analyzeRelationships(req: StudioRequest): StudioResult {
  return {
    content: `## Relationship Map: "${req.storyTitle || "Untitled"}"

### Core Relationships
- **Protagonist ↔ Antagonist**: Mirror images, opposing philosophies
- **Protagonist ↔ Ally**: Mutual growth, shared goals
- **Protagonist ↔ Mentor**: Student becomes the teacher

### Relationship Dynamics
| Pair | Dynamic | Tension |
|------|---------|---------|
| Hero / Rival | Competitive respect | High |
| Hero / Love Interest | Emotional vulnerability | Medium |
| Hero / Family | Duty vs. desire | Medium-High |

### Recommendations
1. Add a scene where the hero and rival are forced to cooperate
2. Strengthen the love interest's independent arc
3. Show the antagonist's perspective to add depth`,
  }
}

function characterSheet(req: StudioRequest): StudioResult {
  const names = ["Aria Nightshade", "Kaelen Stormwind", "Lyra Moonshadow", "Draven Blackthorn", "Seraphina Vale"]
  const name = names[req.prompt.length % names.length]
  return {
    content: `## Character Sheet: ${name}

**Story**: ${req.storyTitle || "Untitled"}

### Basic Information
- **Name**: ${name}
- **Age**: ${20 + (req.prompt.length % 30)}
- **Gender**: ${req.prompt.length % 2 === 0 ? "Female" : "Male"}
- **Species**: Human
- **Role**: ${["Protagonist", "Antagonist", "Mentor", "Ally", "Love Interest"][req.prompt.length % 5]}

### Appearance
- **Height**: ${170 + (req.prompt.length % 20)} cm
- **Build**: Athletic and graceful
- **Hair**: ${["Raven black", "Silver-white", "Auburn", "Golden", "Deep blue"][req.prompt.length % 5]}
- **Eyes**: ${["Emerald green", "Amber", "Sapphire blue", "Violet", "Storm grey"][req.prompt.length % 5]}
- **Distinctive Features**: A subtle birthmark shaped like a crescent moon on their left shoulder

### Personality
- **Archetype**: The ${["Chosen One", "Wise Mentor", "Reluctant Hero", "Shadow Archetype", "Trickster"][req.prompt.length % 5]}
- **Traits**: Determined, compassionate, curious, occasionally reckless
- **Strengths**: Quick thinking, natural leadership, magical aptitude
- **Weaknesses**: Impulsiveness, tendency to shoulder burdens alone, fear of failure
- **Motivation**: To protect those who cannot protect themselves

### Background
Born in a small village at the edge of the kingdom, ${name} discovered their unique abilities at a young age. Training under a mysterious mentor, they learned to harness powers that others feared. A tragedy in their past drives their present actions.

### Visual References
- **Art Style**: ${["Semi-realistic", "Anime", "Watercolor", "Digital painting", "Graphic novel"][req.prompt.length % 5]}
- **Color Palette**: Deep purples and golds with silver accents
- **Key Pose**: Standing confidently, one hand raised with magical energy`,
  }
}

function worldBuilding(req: StudioRequest): StudioResult {
  const topics = ["Magic System", "Culture & Society", "Geography", "History & Lore", "Economics & Trade"]
  const topic = topics[req.prompt.length % topics.length]
  return {
    content: `## World Building: ${topic}

**Project**: ${req.storyTitle || "Untitled"}

### Overview
A detailed ${topic.toLowerCase()} framework that supports the narrative while maintaining internal consistency.

### Core Principles
1. **Consistency** — Rules and limitations are clearly established and followed
2. **Depth** — Multiple layers of complexity that reward exploration
3. **Integration** — Directly connected to character journeys and plot

### Details
${topic === "Magic System"
  ? `### Magic System Architecture
- **Source**: Magic flows from the convergence of natural elemental forces
- **User Types**: Innate casters, studied scholars, bonded practitioners
- **Limitations**: Casting requires stamina; overuse leads to exhaustion
- **Costs**: Each spell exacts a toll — physical, emotional, or spiritual
- **Schools**: Evocation, Illusion, Transmutation, Divination, Necromancy

### Rules
1. Magic cannot create something from nothing
2. Complex spells require components or foci
3. Magical residue can be detected and traced`
: topic === "Culture & Society"
  ? `### Social Structure
- **Hierarchy**: Monarch → Nobility → Merchant class → Commoners → Outcasts
- **Governance**: Feudal system with regional lords and a central crown
- **Law**: Code of conduct enforced by royal knights and local magistrates

### Cultural Traditions
- **Festivals**: Seasonal celebrations marking harvest, solstice, and historical events
- **Rites of Passage**: Coming-of-age trials, marriage customs, funeral rites
- **Art & Music**: Bardic traditions, epic poetry, intricate tapestries`
: `### Key Features
- ${["Three major continents connected by ancient trade routes", "A vast desert separating the eastern kingdoms", "Mountain ranges rich in rare minerals and ores", "An underwater civilization in the coral reefs", "Floating islands held aloft by magical crystals"][req.prompt.length % 5]}
- ${["Capital city built around a dormant volcano", "Underground dwarven kingdoms with crystal caves", "Elven forest cities in the canopy", "Nomadic tribes following great herds", "Coastal trading ports and pirate havens"][(req.prompt.length + 1) % 5]}
- Climate varies from tropical in the south to arctic in the north

### Notable Locations
- The Citadel of Knowledge: Grand library and center of learning
- The Shattered Coast: Pirate-ruled archipelago
- The Whispering Woods: Ancient forest with sentient trees`
}`,
  }
}

function environmentDesign(req: StudioRequest): StudioResult {
  const envs = ["Ancient Forest Glade", "Royal Throne Room", "Underground Cavern", "Desert Oasis", "Space Station Core"]
  const env = envs[req.prompt.length % envs.length]
  return {
    content: `## Environment: ${env}

**Story**: ${req.storyTitle || "Untitled"}

### Atmosphere & Mood
- **Lighting**: ${["Dappled sunlight through canopy", "Grand chandeliers and candlelight", "Bioluminescent crystals", "Harsh midday sun", "Cold artificial lighting"][req.prompt.length % 5]}
- **Color Palette**: ${["Emeralds and golds", "Crimson and deep purple", "Sapphire and silver", "Amber and terracotta", "Steel blue and white"][req.prompt.length % 5]}
- **Soundscape**: ${["Birdsong and rustling leaves", "Echoing footsteps and hushed whispers", "Dripping water and distant rumbles", "Wind and sand shifting", "Humming machinery and alerts"][req.prompt.length % 5]}

### Design Elements
- **Architecture**: ${["Natural formations blended with ancient stone structures", "Ornate gothic columns and vaulted ceilings", "Rough-hewn rock with crystal formations", "Elegant curved sandstone buildings", "Sleek metallic surfaces and holographic displays"][req.prompt.length % 5]}
- **Key Props**: ${["Ancient altar, overgrown with moss", "Gilded throne, tapestry of past kings", "Crystal formations, abandoned mining equipment", "Market stalls, woven awnings", "Control panels, data terminals"][req.prompt.length % 5]}

### Camera Direction
- **Establishing Shot**: Wide angle emphasizing scale
- **Detail Shots**: Focus on textures and atmosphere
- **Movement**: Slow dolly through the space

### Image Reference Prompt
\`${env}, cinematic lighting, detailed environment design, concept art, ${["fantasy", "gothic", "underground", "desert", "sci-fi"][req.prompt.length % 5]} style, 8k, highly detailed\`
`,
    imageUrl: `https://placehold.co/800x600/${(req.prompt.length * 50).toString(16).padStart(2, "0")}a0a0/ffffff?text=${encodeURIComponent(env)}`,
  }
}

function storyboardScene(req: StudioRequest): StudioResult {
  return {
    content: `## Storyboard Scene

**Chapter**: ${req.chapters?.[0]?.title || "Chapter 1"}
**Scene**: ${req.prompt || "Opening scene"}

### Shot Sequence

| Shot | Framing | Action | Duration |
|------|---------|--------|----------|
| 1 | Wide establishing shot | Exterior location, time of day | 5s |
| 2 | Medium shot | Character enters frame | 3s |
| 3 | Close-up | Character reaction/emotion | 4s |
| 4 | Over-the-shoulder | Point of view, what they see | 3s |
| 5 | Two-shot | Interaction with another character | 6s |
| 6 | Tracking shot | Movement through space | 8s |

### Camera Notes
- **Lens**: 35mm for wide shots, 85mm for close-ups
- **Movement**: Steadicam for tracking, dolly for reveals
- **Lighting**: ${["Natural golden hour", "Dramatic side lighting", "Moody low-key", "Bright and airy", "Candlelit intimacy"][req.prompt.length % 5]}

### Visual References
- **Color Grade**: Warm tones with teal shadows
- **Composition**: Rule of thirds with leading lines
- **Transitions**: Cross-fade between major beats`,
    imageUrl: `https://placehold.co/1024x576/${(req.prompt.length * 70).toString(16).padStart(2, "0")}a0a0/ffffff?text=Storyboard+Scene`,
  }
}

function trailerScript(req: StudioRequest): StudioResult {
  return {
    content: `## Trailer Script: "${req.storyTitle || "Untitled"}"

**Duration**: 90 seconds
**Tone**: ${["Epic and inspiring", "Dark and mysterious", "Action-packed", "Emotional and heartfelt", "Thrilling and suspenseful"][req.prompt.length % 5]}

### Scene Sequence

**0:00-0:15 — Opening Hook**
\`\`\`
[WIDE SHOT of landscape]
NARRATOR (V.O.): "In a world on the brink of change..."

[CLOSE-UP on protagonist]
PROTAGONIST: "I never asked for this."
\`\`\`

**0:15-0:35 — Rising Action Montage**
\`\`\`
[QUICK CUTS]
- Action sequences
- Key relationships
- Mysterious symbols
- Rising stakes

MUSIC: Builds from quiet tension to driving rhythm
\`\`\`

**0:35-0:55 — The Challenge**
\`\`\`
[MEDIUM SHOT - Antagonist reveal]
ANTAGONIST: "You have no idea what you're facing."

[WIDE SHOT - Army gathering]
NARRATOR (V.O.): "To save everything they love..."
\`\`\`

**0:55-1:20 — Climax Montage**
\`\`\`
[RAPID CUTS - Increasing pace]
- Training sequences
- Sacrifices made
- Final confrontation begins

MUSIC: Reaches crescendo
\`\`\`

**1:20-1:30 — Final Beat**
\`\`\`
[CLOSE-UP - Protagonist determined]
PROTAGONIST: "This ends now."

TITLE CARD: "${req.storyTitle || "Untitled"}"
TAGLINE: "Every story has a beginning. This one ends."
\`\`\``,
  }
}

function trailerStoryboard(req: StudioRequest): StudioResult {
  return {
    content: `## Trailer Storyboard: "${req.storyTitle || "Untitled"}"

### Key Frames

**Frame 1 — Opening Image**
- **Shot**: Wide landscape, golden hour
- **Text Overlay**: "From the creators of..."
- **Duration**: 3s

**Frame 2 — Character Introduction**
- **Shot**: Medium, protagonist turns to camera
- **Text Overlay**: Character name
- **Duration**: 2s

**Frame 3 — Conflict Tease**
- **Shot**: Close-up, intense moment
- **Text Overlay**: "This summer..."
- **Duration**: 2s

**Frame 4 — Action Beat**
- **Shot**: Dynamic action pose
- **Text Overlay**: None (music hit)
- **Duration**: 1.5s

**Frame 5 — Emotional Core**
- **Shot**: Two-shot, character connection
- **Text Overlay**: None
- **Duration**: 2.5s

**Frame 6 — Climax Tease**
- **Shot**: Epic wide, confrontation
- **Text Overlay**: Title card
- **Duration**: 3s

### Visual Style
- **Color Grade**: Cinematic, teal-orange
- **Transitions**: Match cuts, whip pans
- **Typography**: Bold sans-serif for title`,
    imageUrl: `https://placehold.co/1024x576/${(req.prompt.length * 90).toString(16).padStart(2, "0")}a0a0/ffffff?text=Trailer+Storyboard`,
  }
}

function productionBreakdown(req: StudioRequest): StudioResult {
  return {
    content: `## Production Breakdown: "${req.storyTitle || "Untitled"}"

### Production Overview
- **Format**: Feature Film / Series
- **Estimated Runtime**: ${90 + (req.prompt.length % 60)} minutes
- **Scale**: ${["Independent", "Mid-budget", "Studio production", "Epic"][req.prompt.length % 4]}
- **Genre**: ${["Fantasy", "Sci-Fi", "Drama", "Adventure", "Romance"][req.prompt.length % 5]}

### Department Breakdown

**1. Cast**
- Lead Roles: ${3 + (req.prompt.length % 3)}
- Supporting Roles: ${5 + (req.prompt.length % 5)}
- Day Players: ${10 + (req.prompt.length % 10)}

**2. Locations**
- Primary Sets: ${4 + (req.prompt.length % 4)}
- Exterior Locations: ${3 + (req.prompt.length % 3)}
- Studio Soundstages: ${1 + (req.prompt.length % 2)}

**3. Visual Effects**
- Total VFX Shots: ${20 + (req.prompt.length % 80)}
- CGI Characters: ${1 + (req.prompt.length % 3)}
- Environment Extensions: ${5 + (req.prompt.length % 10)}

**4. Crew Requirements**
- Core Department Heads: 12
- Full Crew Estimate: ${30 + (req.prompt.length % 40)} personnel

### Production Timeline
- **Pre-Production**: ${6 + (req.prompt.length % 6)} weeks
- **Principal Photography**: ${4 + (req.prompt.length % 8)} weeks
- **Post-Production**: ${12 + (req.prompt.length % 12)} weeks`,
  }
}

function shotList(req: StudioRequest): StudioResult {
  return {
    content: `## Shot List: "${req.storyTitle || "Untitled"}"

### Scene 1 — Opening
| Shot | Type | Description | Camera | Duration |
|------|------|-------------|--------|----------|
| 1A | Establishing | Wide landscape at dawn | Crane, slow descent | 8s |
| 1B | Medium | Protagonist wakes | Handheld, close | 4s |
| 1C | Close-up | Detail of significant object | Macro lens | 3s |
| 1D | Over-shoulder | Protagonist looks out | 35mm | 5s |

### Scene 2 — Inciting Incident
| Shot | Type | Description | Camera | Duration |
|------|------|-------------|--------|----------|
| 2A | Wide | Messenger arrives | Static | 6s |
| 2B | Medium | Protagonist receives news | Dolly in | 4s |
| 2C | Close-up | Reaction | 85mm | 3s |
| 2D | Tracking | Protagonist moves to action | Steadicam | 10s |

### Scene 3 — Rising Action
| Shot | Type | Description | Camera | Duration |
|------|------|-------------|--------|----------|
| 3A | Two-shot | Conversation with ally | Over-shoulder | 8s |
| 3B | Wide | Journey begins | Aerial | 6s |
| 3C | POV | What character sees | First-person | 4s |
| 3D | Medium | Obstacle encountered | Dutch angle | 5s |

### Key
- **Camera Notes**: All day exteriors use natural + fill light
- **Lens Kit**: Prime set (24, 35, 50, 85mm), Zoom (70-200mm)
- **Special Equipment**: Steadicam, drone, slider`,
  }
}

function budgetEstimate(req: StudioRequest): StudioResult {
  return {
    content: `## Budget Estimate: "${req.storyTitle || "Untitled"}"

### Category Breakdown

| Category | Amount | % of Total |
|----------|--------|------------|
| **Above-the-Line** | $${(2 + req.prompt.length % 5)}M | 25% |
| - Writer/Director/Producer fees | | |
| - Lead cast salaries | | |
| - Rights & development | | |
| **Production** | $${(3 + req.prompt.length % 5)}M | 35% |
| - Crew salaries | | |
| - Set construction & locations | | |
| - Wardrobe, hair, makeup | | |
| - Equipment rental | | |
| **Post-Production** | $${(2 + req.prompt.length % 3)}M | 25% |
| - Editing | | |
| - VFX & CGI | | |
| - Sound design & mixing | | |
| - Color grading | | |
| **Marketing & Distribution** | $${(1 + req.prompt.length % 2)}M | 15% |
| - Festival submissions | | |
| - Trailer & promotional materials | | |
| - Distribution fees | | |

### Total Estimated Budget: $${(8 + req.prompt.length % 10)}M

### Funding Recommendations
1. Consider co-production partnerships for tax incentives
2. Apply for film grants and development funds
3. Explore pre-sales to international distributors

### Contingency
Recommend 10% contingency buffer: $${(0.8 + req.prompt.length * 0.1).toFixed(1)}M`,
  }
}

// ── Phase 5 mock handlers ──

function writingAI(req: StudioRequest): StudioResult {
  const text = req.chapterContent || req.prompt
  return {
    content: `## ✍️ Writing Polish

### Original
${text?.slice(0, 500) || "No text provided."}

### Revised
${text?.slice(0, 500) || "No text provided."}

### Changes Made
| Type | Detail |
|------|--------|
| Grammar | Fixed subject-verb agreement in paragraph 2 |
| Flow | Improved sentence transitions |
| Word Choice | Replaced weak verbs with stronger alternatives |
| Tone | Adjusted toward a more ${req.prompt.includes("formal") ? "formal" : "natural"} register |

### Tips
- Consider varying sentence length for rhythm
- Use active voice for more direct storytelling
- Show emotions through action rather than telling`,
  }
}

function storyAI(req: StudioRequest): StudioResult {
  return {
    content: `## 📖 Story Analysis: "${req.storyTitle || "Untitled"}"

### Plot Structure
| Act | Status | Notes |
|-----|--------|-------|
| Act I (Setup) | Solid foundation established | Inciting incident clearly defined |
| Act II (Confrontation) | Rising action needs tightening | Midpoint twist could hit harder |
| Act III (Resolution) | Satisfying arc | Ensure all subplots resolve |

### Pacing Analysis
- **Strengths**: Strong opening hook, good chapter-end cliffhangers
- **Opportunities**: Chapter 3-5 middle section slows down—consider cutting or adding tension
- **Rhythm**: Dialogue scenes are well-paced; narration sections could use more variety

### Character Arc Check
| Character | Arc Status | Recommendation |
|-----------|-----------|----------------|
| Protagonist | Growing | Needs a clearer "want vs. need" distinction |
| Antagonist | Consistent | Could use a sympathetic backstory beat |

### Plot Holes
⚠️ Check timeline consistency in chapters 7-8 (season change without explanation)`,
  }
}

function characterAI(req: StudioRequest): StudioResult {
  return {
    content: `## 🎭 Character Development

### Generated Character Sheet
| Field | Detail |
|-------|--------|
| **Name** | ${req.prompt.slice(0, 50) || "Aeliana"} |
| **Age** | Mid-20s |
| **Species** | Human |
| **Appearance** | Long dark hair, storm-gray eyes, tall and poised |
| **Personality** | Reserved but fiercely loyal, analytical mind, carries hidden warmth |
| **Background** | Orphaned young, raised by a scholarly mentor in a remote academy |
| **Arc Potential** | From self-doubt to self-actualization |

### Trait Suggestions
- **Strength**: Strategic thinking, empathy
- **Flaw**: Overanalyzes instead of acting
- **Growth**: Learning to trust intuition

### Backstory Seeds
1. A childhood promise that shapes current decisions
2. A mentor's betrayal that taught caution
3. A hidden talent that emerges under pressure`,
  }
}

function worldBuilderAI(req: StudioRequest): StudioResult {
  return {
    content: `## 🌍 Worldbuilding: "${req.storyTitle || "New World"}"

### Geography
- **Primary Region**: Mist-shrouded valleys between three mountain ranges
- **Climate**: Temperate with magical seasonal shifts
- **Notable Locations**: The Crystal Peaks, Sunken Temple of Aether, Floating Gardens

### Culture & Society
- **Government**: Council of Elders (magic-wielding aristocracy)
- **Customs**: Rite of Awakening at age 16, Festival of Echoes
- **Social Structure**: Mages > Scholars > Merchants > Crafters > Farmers

### Magic System
- **Source**: Ambient aether from celestial events
- **Limitations**: User must be attuned; overuse causes "aether-sickness"
- **Schools**: Evocation, Illusion, Transmutation, Divination

### History
- **Age of Harmony**: 2000 years of mage-led prosperity
- **The Sundering**: Cataclysmic war that split the continent
- **Current Era**: Fragile peace, old tensions resurfacing`,
  }
}

function illustrationAI(req: StudioRequest): StudioResult {
  return {
    content: `## 🎨 Illustration Prompt

### IMAGE PROMPT
\`\`\`
${req.prompt}, cinematic lighting, dramatic composition, highly detailed, 8K, 
fantasy art style, volumetric lighting, deep colors, ethereal atmosphere, 
by Greg Rutkowski and Ross Tran, trending on ArtStation
\`\`\`

### Style Notes
| Element | Detail |
|---------|--------|
| Lighting | Golden hour backlight with rim light |
| Composition | Rule of thirds, leading lines toward focal point |
| Color Palette | Deep purples, warm ambers, teal accents |
| Mood | Mysterious and hopeful |
| Camera | Medium shot, slightly low angle for heroism`,
  }
}

function screenplayAI(_req: StudioRequest): StudioResult {
  return {
    content: `## 🎬 Screenplay Adaptation

\`\`\`
TITLE: ${_req.storyTitle || "Untitled"}
SCENE: 1

INT. ANCIENT LIBRARY - DAY

A shaft of golden light cuts through the dusty air. Rows of arched shelves stretch into shadow.

ELARA (20s, sharp-eyed, determined) stands at the center, a worn journal in her hands.

                          ELARA
            (whispering)
            It has to be here. The third seal.

She runs her fingers along a carved symbol on the stone pillar. Dust motes dance around her.

                          ELARA
            (more confidently)
            "When the moon aligns with the serpent's eye..."

A low RUMBLE shakes the floor.

                          ELARA
            (stepping back)
            Oh no.

The symbol GLOWS with a deep blue light.
\`\`\`

### Formatting Notes
- **Scene Heading**: INT./EXT. + LOCATION + TIME OF DAY
- **Action**: Present tense, concise visual descriptions
- **Character**: ALL CAPS on first introduction, uppercase for cues
- **Dialogue**: Character name centered, dialogue below in standard case`,
  }
}

function musicAI(req: StudioRequest): StudioResult {
  return {
    content: `## 🎵 Musical Score Suggestions

### Curated Playlist

| Song | Artist | Why It Fits | Scene Type |
|------|--------|-------------|------------|
| "Experience" | Ludovico Einaudi | Emotional weight, builds beautifully | Climactic reveals |
| "Time" | Hans Zimmer | Timeless, introspective | Reflective moments |
| "The Night We Met" | Lord Huron | Melancholic and yearning | Romantic/emotional beats |
| "Mountains" | Hans Zimmer | Rising tension and scale | Action sequences |
| "River Flows in You" | Yiruma | Gentle piano, intimate | Character moments |
| "Eclipse" | Pink Floyd | Psychedelic, progressive | Surreal/otherworldly |

### Ambient Recommendations
| Mood | Genre | Suggested Tracks |
|------|-------|-----------------|
| Mystery | Dark ambient, drone | Brian Eno, Tim Hecker |
| Romance | Dream pop, piano | Cocteau Twins, Olafur Arnalds |
| Adventure | Epic orchestral | Two Steps From Hell, Audiomachine |
| Horror | Dark drone, industrial | Ben Frost, Colin Stetson |

### Mood-Based Suggestions
- **Tense scenes**: Low strings, irregular percussion
- **Romantic moments**: Solo piano or cello
- **Action**: Full orchestra with brass and percussion
- **Mystery**: Synth pads, reversed effects`,
  }
}

function marketingAI(req: StudioRequest): StudioResult {
  return {
    content: `## 📢 Marketing Assets for "${req.storyTitle || "Untitled"}"

### Logline
"In a world where magic is currency, one reluctant heir must choose between saving her family's legacy and doing what's right."

### Taglines
- "Power comes at a price. Hers is everything."
- "Some legacies are worth fighting for. Others are worth burning."
- "The magic in your blood isn't always a gift."

### Story Blurb
When Elara discovers that her family's fortune was built on forbidden magic, she faces an impossible choice: protect the legacy that raised her or expose the truth that could destroy everything. As ancient enemies close in and old alliances crumble, Elara must decide who she wants to be—before the choice is taken from her.

### Social Media Posts
**Twitter/X**
📖 "Some legacies are worth burning." My new fantasy novel THE AETHER LEGACY explores what happens when the magic we inherit comes with a price none of us can pay. Coming soon. #FantasyBooks #WritingCommunity

**Instagram Caption**
The truth hides in plain sight. A story of forbidden magic, impossible choices, and the courage to forge your own path. ✨📚 #FantasyNovel #Bookstagram #ComingSoon

**TikTok Hook**
"Imagine finding out your family fortune was built on literal blood magic. Now imagine having to choose between protecting them and doing the right thing. That's what happens to Elara in my book."

### Hashtags
#FantasyBooks #WritingCommunity #BookTok #NewRelease #FantasyReads`,
  }
}

const TOOL_HANDLERS: Record<StudioToolType, (req: StudioRequest) => StudioResult> = {
  ANALYZE_CHARACTERS: analyzeCharacters,
  ANALYZE_TIMELINE: analyzeTimeline,
  ANALYZE_WORLD: analyzeWorld,
  ANALYZE_THEMES: analyzeThemes,
  ANALYZE_RELATIONSHIPS: analyzeRelationships,
  CHARACTER_SHEET: characterSheet,
  WORLD_BUILDING: worldBuilding,
  ENVIRONMENT: environmentDesign,
  STORYBOARD_SCENE: storyboardScene,
  TRAILER_SCRIPT: trailerScript,
  TRAILER_STORYBOARD: trailerStoryboard,
  PRODUCTION_BREAKDOWN: productionBreakdown,
  SHOT_LIST: shotList,
  BUDGET_ESTIMATE: budgetEstimate,
  WRITING_AI: writingAI,
  STORY_AI: storyAI,
  CHARACTER_AI: characterAI,
  WORLD_BUILDER_AI: worldBuilderAI,
  ILLUSTRATION_AI: illustrationAI,
  SCREENPLAY_AI: screenplayAI,
  MUSIC_AI: musicAI,
  MARKETING_AI: marketingAI,
}

export const mockStudioProvider: StudioProvider = {
  name: "mock-studio",

  tools: {},

  async execute(tool: StudioToolType, req: StudioRequest): Promise<StudioResult> {
    await delay()
    const handler = TOOL_HANDLERS[tool]
    if (!handler) {
      return { content: `Tool "${tool}" not implemented yet.`, error: "Not implemented" }
    }
    return handler(req)
  },
}
