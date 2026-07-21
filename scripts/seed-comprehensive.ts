import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import bcrypt from "bcryptjs"

const adapter = new PrismaLibSql({ url: "file:./dev.db" })
const prisma = new PrismaClient({ adapter })

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

async function main() {
  const hash = (pw: string) => bcrypt.hash(pw, 12)

  // ── USERS ──────────────────────────────────────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@likhaverse.com" },
    update: {},
    create: {
      name: "LikhaVerse Admin",
      email: "admin@likhaverse.com",
      password: await hash("Admin123!"),
      role: "SUPER_ADMIN",
      bio: "Founder and creator of LikhaVerse. The architect behind the world's most ambitious literary platform.",
      premium: true,
      premiumSince: new Date("2025-01-01"),
    },
  })

  const author = await prisma.user.upsert({
    where: { email: "author@likhaverse.com" },
    update: {},
    create: {
      name: "Test Author",
      email: "author@likhaverse.com",
      password: await hash("Author123!"),
      role: "AUTHOR",
      bio: "A passionate storyteller weaving tales of fantasy and adventure.",
    },
  })

  const premium = await prisma.user.upsert({
    where: { email: "premium@likhaverse.com" },
    update: {},
    create: {
      name: "Premium Creator",
      email: "premium@likhaverse.com",
      password: await hash("Creator123!"),
      role: "PREMIUM_CREATOR",
      premium: true,
      premiumSince: new Date("2025-06-01"),
      bio: "A premium storyteller crafting epic sagas.",
    },
  })

  const reader = await prisma.user.upsert({
    where: { email: "reader@likhaverse.com" },
    update: {},
    create: {
      name: "Test Reader",
      email: "reader@likhaverse.com",
      password: await hash("Reader123!"),
      role: "READER",
    },
  })

  // Additional community users
  const critic = await prisma.user.upsert({
    where: { email: "critic@likhaverse.com" },
    update: {},
    create: {
      name: "BookishCritic",
      email: "critic@likhaverse.com",
      password: await hash("Critic123!"),
      role: "READER",
      bio: "Avid reader and reviewer. I read 100 books a year.",
    },
  })

  const fan = await prisma.user.upsert({
    where: { email: "fan@likhaverse.com" },
    update: {},
    create: {
      name: "StoryFanatic99",
      email: "fan@likhaverse.com",
      password: await hash("Fan123!"),
      role: "READER",
      bio: "Fantasy and sci-fi enthusiast. Always looking for the next great story.",
    },
  })

  const secondAuthor = await prisma.user.upsert({
    where: { email: "writer2@likhaverse.com" },
    update: {},
    create: {
      name: "Elena Martinez",
      email: "writer2@likhaverse.com",
      password: await hash("Writer123!"),
      role: "AUTHOR",
      bio: "Romance and contemporary fiction author. Words are my画笔.",
    },
  })

  const users = { superAdmin, author, premium, reader, critic, fan, secondAuthor }

  // ── STORY 1: "The Last Ember" (Super Admin, Completed, FREEMIUM, 30 chapters) ──
  const lastEmber = await prisma.story.upsert({
    where: { id: "story-ember" },
    update: {},
    create: {
      id: "story-ember",
      title: "The Last Ember",
      description:
        "In a world where fire is extinct, one girl discovers the last ember of hope. A tale of courage, discovery, and the unyielding human spirit that spans thirty gripping chapters.",
      tags: "fantasy,adventure,dystopian,epic",
      status: "COMPLETED",
      accessType: "FREEMIUM",
      freePreviewChapters: 15,
      original: true,
      completedBadge: true,
      studioBadge: true,
      completedAt: new Date("2026-06-01"),
      authorId: premium.id,
    },
  })

  const emberChapters = [
    { title: "The Fading Light", content: "The sun had not risen in three hundred years.\n\nNot that anyone living remembered what it looked like. The stories spoke of a golden orb that painted the sky in shades of orange and pink, but to Kira, those were just words. Empty, hollow words that meant nothing in a world of perpetual twilight.\n\nShe pulled her worn cloak tighter around her shoulders as she walked through the marketplace. The stalls were lit by bioluminescent fungi, their pale blue glow casting long shadows across the cobblestone streets. Merchants hawked their wares in hushed tones, their breath misting in the cold air.\n\n\"Kira! Kira, wait!\"\n\nShe turned to see her friend Lian weaving through the crowd, his face flushed with excitement.\n\n\"Did you hear?\" he asked, breathless. \"They found something. In the ruins beneath the old temple.\"\n\nKira's heart quickened. \"What kind of something?\"\n\nLian's eyes gleamed in the fungal light. \"Fire, Kira. Real fire.\"\n\nShe stared at him, searching his face for any sign of a joke. But Lian had never been a good liar.\n\n\"That's impossible,\" she whispered.\n\n\"Come see for yourself.\"" },
    { title: "The Discovery", content: "The temple ruins lay at the edge of the city, a crumbling monument to a time before the great dimming. Kira had passed it a hundred times, never giving it more than a passing glance. Now, as she followed Lian down the narrow staircase into the earth, she saw it with new eyes.\n\nThe air grew warmer as they descended. Kira noticed it first as a tingle on her skin, then as a faint glow emanating from somewhere below.\n\n\"See?\" Lian whispered.\n\nAt the bottom of the stairs, nestled in a stone chamber that had been sealed for centuries, a small flame flickered in a brass brazier. It was no larger than a candle's flame, but it burned with an intensity that seemed impossible.\n\nKira approached slowly, her hand outstretched. The heat kissed her palm, and she gasped.\n\n\"It's real,\" she breathed.\n\n\"The elders need to know,\" Lian said. \"This changes everything.\"\n\nBut Kira wasn't listening. Her eyes were fixed on the flame, on the dance of light that her people had not witnessed in three hundred years. In its glow, she saw not just fire, but possibility.\n\nHope." },
    { title: "The Council", content: "The Council of Elders convened in the great hall, their faces lit by the ever-present fungal glow. Kira stood before them, the brass brazier in her hands, the small flame casting unfamiliar shadows across the room.\n\n\"You found this where?\" Elder Maren asked, her voice skeptical.\n\n\"Beneath the old temple,\" Kira said. \"In a chamber sealed since the dimming.\"\n\nThe elders exchanged glances. Elder Theron leaned forward, his old eyes reflecting the flame.\n\n\"Do you know what this means, child?\" he asked softly.\n\n\"It means... we can bring back the light?\" Kira ventured.\n\nTheron shook his head. \"It means the old prophecies were true. The fire did not die. It was hidden.\"\n\nMurmurs spread through the hall. Kira clutched the brazier closer.\n\n\"Hidden by whom?\" she asked.\n\nNo one answered. But in the silence, Kira understood that her discovery was just the beginning of a much larger mystery." },
    { title: "The Prophecy", content: "Elder Theron summoned Kira to his private chambers after the council meeting. The room was lined with ancient scrolls, their edges crumbling with age. He motioned for her to sit.\n\n\"There is something you must know,\" he said, his voice heavy. \"The prophecy of the Last Ember.\"\n\nHe unrolled a scroll, its surface covered in symbols Kira had never seen. \"It speaks of a time when the fire would return, carried by one with the heart of a flame.\"\n\n\"You think I'm the one?\" Kira asked.\n\n\"I think you found what no one else could,\" Theron replied. \"But the prophecy also speaks of a sacrifice. To bring back the light, something must be lost.\"\n\nKira's blood ran cold. \"What kind of sacrifice?\"\n\n\"That,\" Theron said, \"is what we must discover before the Shadow Guild learns of your find.\"" },
    { title: "The Shadow Guild", content: "They came in the night, their dark cloaks blending with the shadows. Kira woke to the sound of breaking glass and the screams of her neighbors.\n\nShe grabbed the brazier, still warm from the ember, and pressed herself against the wall. Through her window, she saw figures moving through the streets, their faces obscured by hoods.\n\n\"The Shadow Guild,\" Lian whispered, appearing at her door. \"They know.\"\n\n\"How?\" Kira asked.\n\n\"Someone in the council talked. We have to leave. Now.\"\n\nThey fled through the back alleys, the sounds of the raid growing distant behind them. Kira clutched the brazier to her chest, its warmth the only comfort in the cold night.\n\n\"Where do we go?\" she asked.\n\n\"The Sunken City,\" Lian said. \"If the legends are true, that's where the fire was hidden.\" He paused. \"And that's where we'll find answers.\"" },
    { title: "The Journey Begins", content: "The Sunken City lay three days to the north, across the Grey Wastes. Kira had only ever seen it on maps, marked with warnings that spoke of dangerous creatures and treacherous terrain.\n\nThey set out at dawn, provisions packed, the brazier carefully wrapped in cloth. The sky above was a permanent twilight, the stars barely visible through the haze.\n\n\"What if the Sunken City is just a myth?\" Kira asked as they walked.\n\n\"Then we'll have an interesting story to tell,\" Lian replied with a grin.\n\nThey traveled in silence for hours, the only sounds being their footsteps on the cracked earth and the occasional cry of a nightbird. Kira's mind raced with questions. Who had hidden the fire? Why? And what sacrifice would the prophecy demand?\n\nBy nightfall, they reached the edge of the Wastes. Before them stretched an endless expanse of grey, punctuated by the skeletal remains of ancient trees. Somewhere beyond lay the Sunken City.\n\nAnd the truth." },
    { title: "The Grey Wastes", content: "The Grey Wastes were exactly as the name suggested — a vast, lifeless expanse of ash-coloured earth that stretched to the horizon. Nothing grew here. Nothing moved. The silence was absolute, broken only by the wind that howled across the desolate plain.\n\n\"How long do we have to cross this?\" Kira asked, her voice feeling small in the emptiness.\n\n\"Two days, if we keep a steady pace,\" Lian said, consulting a worn map. \"But we need to find shelter before nightfall. The temperature drops dangerously after dark.\"\n\nThey pushed forward, the brazier's warmth a constant presence against Kira's chest. As they walked, she noticed strange formations in the earth — patterns that looked almost architectural.\n\n\"What are those?\" she asked, pointing.\n\nLian squinted. \"Ruins. From before the dimming. This used to be a city, once.\"\n\nKira stared at the crumbling structures, trying to imagine what they must have looked like in the light of the sun. The thought filled her with a profound sadness.\n\n\"We'll bring it back,\" she said quietly. \"The light. I promise.\"" },
    { title: "The Oasis", content: "They found it on the second day — a pocket of life in the middle of the Grey Wastes. A small oasis, fed by an underground spring, surrounded by hardy plants that had adapted to the dim light.\n\n\"We rest here for an hour,\" Lian said, collapsing beside the water.\n\nKira knelt and cupped the water in her hands. It was cold and clear, and she drank deeply. The brazier sat beside her, its flame still burning bright.\n\nAs she rested, she noticed markings on the rocks surrounding the oasis. They were the same symbols she had seen in Elder Theron's scroll.\n\n\"Lian, look at this.\"\n\nHe came over and studied the markings. \"They're way markers. The people who hid the fire left these to guide the way.\"\n\n\"So we're on the right path,\" Kira said, hope rising in her chest.\n\n\"We are,\" Lian confirmed. \"But look here.\" He pointed to a symbol that looked like a flame crossed out. \"This means danger. Whatever's ahead, it's protected.\"" },
    { title: "The Guardian", content: "They found the Guardian at the edge of the Sunken City — a massive creature of stone and shadow, its eyes glowing with an inner light. It stood at least twenty feet tall, its form vaguely humanoid, and it barred the only entrance to the city.\n\n\"We can't fight that,\" Lian whispered.\n\nKira studied the creature. It hadn't moved since they arrived, standing perfectly still like a statue. But its eyes tracked their movements.\n\n\"It's not attacking,\" she observed.\n\n\"Maybe it's waiting.\"\n\nKira stepped forward, the brazier held out before her. The creature's eyes fixed on the flame, and to her surprise, it knelt. A deep rumbling sound emanated from its chest, almost like words.\n\n\"It recognizes the fire,\" Kira breathed. \"The ember... it's a key.\"\n\nThe Guardian rose and stepped aside, revealing a passage behind it. The way to the Sunken City was open.\n\n\"After you,\" Lian said, his voice filled with awe." },
    { title: "The Sunken City", content: "The Sunken City was breathtaking. Spires of gleaming stone rose from the earth, their surfaces covered in intricate carvings that seemed to glow with residual magic. Streets paved with marble stretched in every direction, lined with buildings that had once been grand.\n\n\"It's beautiful,\" Kira whispered.\n\n\"And untouched,\" Lian added. \"No one has been here since the dimming.\"\n\nThey walked through the empty streets, their footsteps echoing in the silence. The brazier's flame burned brighter here, as if responding to something in the city.\n\n\"It's leading us somewhere,\" Kira said.\n\nThey followed the flame's pull through winding streets and across grand plazas, until they reached the center of the city. There, at the heart of everything, stood a massive structure — a temple unlike any they had ever seen.\n\n\"The Temple of the Sun,\" Lian read from a plaque. \"Legend says this is where the last light was kept.\"\n\nKira's heart pounded. They had found it. The source of all answers." },
  ]

  // Generate remaining 20 chapters programmatically
  const chapterTemplates = [
    { title: "The Temple of the Sun", content: "The Temple of the Sun rose before them, a monument to a forgotten age. Its walls were adorned with mosaics depicting a golden sun, its rays stretching across the entire facade. The doors stood open, as if welcoming them.\n\nKira stepped inside, her breath catching in her throat. The interior was vast, lit by an ethereal glow that seemed to emanate from the walls themselves. Pillars stretched toward a ceiling so high it disappeared into shadow.\n\n\"This way,\" she said, following the pull of the brazier.\n\nThey walked through corridors lined with ancient texts and artifacts, each one telling the story of a world that had light. Kira felt like she was walking through a dream.\n\nAt the end of the longest corridor, they found a chamber. In its center stood a pedestal, and on that pedestal sat a crystal orb, pulsing with a warm, golden light.\n\n\"The Sun Stone,\" Lian breathed. \"It's real.\"" },
    { title: "The Sun Stone", content: "Kira approached the pedestal slowly, her hands trembling. The Sun Stone was about the size of her fist, perfectly spherical, and it pulsed with a light that seemed alive.\n\n\"What does it do?\" she asked.\n\n\"According to the legends, it was the source of the world's light,\" Lian said, reading from a scroll he had found. \"But it was broken into pieces and scattered across the world to prevent anyone from using its power for evil.\"\n\n\"This is only one piece?\"\n\n\"Yes. There are seven in total. The Ember is another.\"\n\nKira looked down at the brazier. \"So we need to find all seven?\"\n\n\"That's the only way to bring back the sun.\"\n\nAs Kira reached for the Sun Stone, a voice echoed through the chamber. \"I wouldn't do that if I were you.\" She spun around to find a figure in dark robes standing at the entrance. \"The Shadow Guild has been waiting for you.\"" },
    { title: "Confrontation", content: "The Shadow Guild leader stepped into the light, revealing a face Kira recognized. It was Elder Maren from the council.\n\n\"You?\" Kira gasped.\n\n\"Did you think the council was united?\" Maren laughed. \"There are those of us who prefer the world as it is. Darkness has its advantages.\"\n\n\"You can't stop us,\" Lian said, stepping forward.\n\n\"Can't I?\" Maren raised her hand, and shadows gathered around her, coalescing into solid form. \"The Ember is mine.\"\n\nKira clutched the brazier to her chest. \"No.\"\n\n\"Then you'll die with it.\"\n\nMaren unleashed the shadows, and they surged toward Kira like a tidal wave. But the Ember flared, its light pushing back the darkness. Kira stood her ground, the flame burning brighter than ever before.\n\n\"I will not let you take the light,\" Kira declared.\n\nThe battle had begun." },
    { title: "The Power of Light", content: "The Ember's light intensified, pushing back the shadows that Maren had summoned. Kira felt power coursing through her, warm and strong.\n\n\"You have no idea what you're dealing with, girl,\" Maren snarled.\n\n\"Neither do you,\" Kira replied.\n\nThe Sun Stone on the pedestal began to glow in response to the Ember, and the two lights intertwined, creating a beam that shot toward the ceiling. The temple shook.\n\n\"What are you doing?\" Maren shouted.\n\n\"What I was meant to do.\"\n\nThe light from the Ember and the Sun Stone merged, and Kira felt a connection forming between them. She understood now — the Ember wasn't just a piece of the sun. It was the key to unlocking the Sun Stone's power.\n\nMaren screamed as the light enveloped her, and the shadows dissipated. When the light faded, Maren was gone, and Kira stood alone with the Sun Stone in her hand.\n\n\"We need to find the other pieces,\" she said to Lian. \"Before anyone else gets hurt.\"" },
    { title: "The Map", content: "The temple contained a map showing the locations of all seven Sun Stone fragments. They were scattered across the continent, hidden in ancient temples, guarded by creatures of legend, and protected by powerful magic.\n\n\"This will take years,\" Lian said, studying the map.\n\n\"Then we'd better get started.\"\n\nThe first fragment was located in the Whispering Forest to the east. The second was beneath the Crystal Lake in the south. The third was atop the Obsidian Peak in the north. The fourth was in the ruins of the Golden City. The fifth was in the depths of the Serpent's Trench. The sixth was in the heart of the Stormlands. And the seventh...\n\n\"The seventh is at the center of the world,\" Kira read. \"Where the first light was born.\"\n\n\"That's just a myth,\" Lian said.\n\n\"So was the Ember.\"\n\nLian fell silent. She had a point. They packed their supplies and set out at dawn, the Sun Stone and the Ember both safely secured. The journey ahead was long, but Kira had never felt more determined." },
    { title: "The Whispering Forest", content: "The Whispering Forest earned its name honestly. The trees seemed to talk, their leaves rustling with voices that spoke in languages long dead. Kira and Lian walked carefully, their senses on high alert.\n\n\"The fragment is supposed to be in a clearing at the center of the forest,\" Lian said, consulting the map.\n\n\"How do we find it?\"\n\n\"We follow the light.\"\n\nKira held up the Ember, and its flame flickered, then steadied, pointing in a specific direction. They followed its lead, pushing through dense undergrowth and绕过 ancient trees.\n\nAfter hours of walking, they emerged into a clearing. At its center stood a stone altar, and on it rested another Sun Stone fragment, glowing softly.\n\n\"That was easier than I expected,\" Lian said.\n\nAs Kira reached for the fragment, the ground trembled, and roots burst from the earth, forming a massive figure. The forest itself was the guardian.\n\n\"I spoke too soon,\" Lian muttered." },
    { title: "The Forest Guardian", content: "The creature of roots and earth towered over them, its form constantly shifting as vines and branches twisted together. Its eyes were two points of green light, ancient and knowing.\n\n\"Who dares claim the fragment?\" it rumbled, its voice like grinding stone.\n\nKira stepped forward, the Ember held high. \"I do. To restore the light to our world.\"\n\nThe guardian studied her, its green eyes fixed on the flame. \"You carry the Ember. The prophecy spoke of one who would come.\"\n\n\"Then you know why I'm here.\"\n\n\"I know why you think you're here,\" the guardian said. \"But the fragment comes at a cost. To take it, you must leave behind something precious.\"\n\nKira's heart sank. \"What?\"\n\n\"Your memory of this place. Once you take the fragment, you will forget the Whispering Forest and everything that happened here.\"\n\nLian stepped forward. \"That's too high a price.\"\n\n\"It is the price,\" the guardian said simply.\n\nKira looked at the fragment, then at Lian. \"I'll pay it.\"" },
    { title: "The Cost", content: "Kira reached for the fragment, and as her fingers touched its warm surface, she felt a strange sensation. Memories of the forest began to fade, replaced by a void where they had been.\n\nWhen she turned around, she saw Lian looking at her with concern. \"Are you okay?\" he asked.\n\n\"I... I think so,\" she said, but something felt different. She looked around the clearing, but it seemed unfamiliar, as if she was seeing it for the first time.\n\n\"Let's go,\" Lian said gently, guiding her away.\n\nAs they left the forest, Kira felt a sense of loss she couldn't explain. The second fragment was warm in her hand, pulsing in harmony with the first and with the Ember.\n\n\"Two down,\" she said, trying to focus on the goal. \"Five to go.\"\n\nTheir next destination was Crystal Lake, deep in the southern territories. It was said that the lake was so clear you could see the bottom, but also so cold that it would freeze your blood if you stayed too long.\n\nKira wondered what price the lake would demand." },
    { title: "Crystal Lake", content: "Crystal Lake was everything the legends said and more. Its surface was like a mirror, reflecting the grey sky above with perfect clarity. The water was so clear that Kira could see fish swimming far below.\n\n\"The fragment is at the bottom,\" Lian said, reading from an ancient text they had found. \"It's said to be held in a chamber beneath the lake.\"\n\n\"How do we reach it?\"\n\n\"We swim.\"\n\nKira looked at the freezing water with dread. \"You can't be serious.\"\n\n\"There's an entrance on the far side,\" Lian said, pointing. \"An underwater tunnel that leads to an air pocket. From there, we can reach the chamber.\"\n\nThey made their way to the far side of the lake, where a dark crevice in the rocks marked the entrance. Kira took a deep breath and dove in.\n\nThe water was shockingly cold, stealing her breath. She swam through the tunnel, her lungs burning, until she surfaced in a cavern lit by phosphorescent crystals. The chamber was beautiful, with stalactites hanging like chandeliers from the ceiling.\n\nAnd there, on a pedestal at the center, rested the third fragment." },
    { title: "The Water's Trial", content: "The chamber was larger than Kira had expected, with multiple tunnels branching off in different directions. The fragment sat on a pedestal at the center, but the path to it was not straightforward.\n\n\"There's a pattern to the floor,\" Lian observed. \"It's a puzzle.\"\n\nKira looked down. The floor was made of tiles, each one engraved with a symbol. Some symbols glowed, others remained dark.\n\n\"Step only on the glowing ones,\" she guessed.\n\nShe tested her theory by stepping on a glowing tile. It held firm. She stepped on a dark one, and it sank slightly, triggering a hissing sound from the walls.\n\n\"The chamber is flooding,\" Lian said, panic in his voice.\n\nThey moved quickly, stepping only on the glowing tiles. Kira reached the pedestal and grabbed the fragment just as the water began to pour in through hidden vents.\n\n\"Go!\" she shouted, and they ran, leaping from tile to tile as the water rose behind them.\n\nThey burst through the tunnel entrance and swam to the surface, gasping for air. The third fragment was safe in Kira's hand.\n\n\"Three down,\" she said, catching her breath. \"Four to go.\"" },
    { title: "The Obsidian Peak", content: "Obsidian Peak rose like a black dagger against the grey sky. It was a volcano, long dormant, its slopes covered in sharp volcanic glass that glittered in the dim light.\n\n\"The fragment is in the caldera,\" Lian said, studying the map.\n\n\"We have to climb?\"\n\n\"We have to climb.\"\n\nThe ascent was treacherous. The obsidian shards cut through their boots and gloves, and the steep slope offered few handholds. Kira's muscles screamed with exertion, but she pushed on, driven by the warmth of the Ember against her chest.\n\nHalfway up, they found a cave. Inside, the walls were covered in ancient paintings depicting the history of the world — the birth of the sun, the age of light, and the great dimming.\n\n\"This is a sacred site,\" Kira said, tracing the paintings with her fingers. \"The people who created this knew what they were hiding.\"\n\nThey continued upward, reaching the caldera as the eternal twilight began to darken. At the center of the crater, surrounded by steam vents, sat the fourth fragment.\n\nBut it was guarded by a creature of fire and stone — a being born from the volcano itself." },
    { title: "The Fire Elemental", content: "The elemental rose from the steam, its body composed of molten rock and flickering flames. It had no discernible face, but its intent was clear — protect the fragment at all costs.\n\n\"You cannot pass,\" it said, its voice like cracking stone.\n\n\"I'm not here to fight you,\" Kira said. \"I'm here to restore the light.\"\n\n\"The light was taken for a reason.\"\n\n\"What reason?\"\n\n\"To protect the world from itself,\" the elemental said. \"The sun's power was used for war. The dimming was a mercy.\"\n\nKira hesitated. Was this true? Had the sun been taken to save them? But then she thought of her world — the cold, the darkness, the slow death of everything beautiful.\n\n\"The mercy has lasted long enough,\" she said. \"It's time for the light to return.\"\n\nThe elemental seemed to consider her words. Then, to her surprise, it stepped aside.\n\n\"The fragment is yours. But know this — when the sun returns, so will the burdens of the light.\"\n\nKira picked up the fourth fragment, its warmth joining the others. \"Four down,\" she whispered. \"Three to go.\"" },
    { title: "The Golden City", content: "The Golden City was a legend even before the dimming. Built by an ancient civilization of mastersmiths, it was said to be the most beautiful city ever constructed — its buildings made of a metal that shone like gold, its streets paved with precious stones.\n\nBut it was also a city cursed. Every expedition sent to find it had never returned.\n\n\"We're the first to reach it in five hundred years,\" Lian said as they stood at the city's gates, which hung open and inviting.\n\n\"Don't get too comfortable,\" Kira warned. \"The others never returned for a reason.\"\n\nThey walked through the empty streets, marveling at the architecture. The buildings did indeed shine with a golden hue, and the gems in the pavement glittered underfoot. But there was an air of wrongness about the place — a silence that felt unnatural.\n\n\"The fragment is in the central palace,\" Lian said.\n\nAs they approached the palace, they began to hear whispers. Voices calling their names, promising riches, power, anything they desired.\n\nThe city was testing them. The fragment would only be given to those who could resist temptation." },
    { title: "The Trial of Desire", content: "The whispers grew louder as they entered the palace. Kira saw visions of her deepest desires — a world bathed in sunlight, her family safe, her people thriving. It was everything she had ever wanted.\n\nBut she knew it wasn't real.\n\n\"These are illusions,\" she said, clutching the Ember tightly. \"They're trying to distract us.\"\n\nLian beside her was struggling. He was staring at a vision of his own — a life of wealth and comfort, far from the dangers of their quest.\n\n\"Lian!\" Kira shouted. \"Don't listen to them!\"\n\nHe blinked, shaking his head. \"Right. Illusions.\"\n\nThey pushed forward, ignoring the temptations. Each room presented a new challenge — a hall of mirrors that showed false paths, a chamber of echoes that repeated their doubts, a corridor of shadows that attacked their fears.\n\nFinally, they reached the throne room. On a pedestal before the throne sat the fifth fragment, glowing with a steady, golden light.\n\n\"The city has judged you worthy,\" a voice said. An apparition of a king, crowned and robed, materialized before them. \"Take the fragment, and continue your quest.\"\n\nKira picked up the fifth fragment. \"Five down,\" she breathed. \"Two to go.\"" },
    { title: "The Serpent's Trench", content: "The Serpent's Trench was a vast canyon that split the earth like a wound. It was said to be the home of the World Serpent, a creature so massive that its body formed the walls of the trench itself.\n\n\"The fragment is somewhere in the depths,\" Lian said, peering over the edge. The bottom was lost in shadow.\n\n\"We need to climb down.\"\n\nThey rappelled down the canyon wall, the rope straining under their weight. The walls were warm to the touch, and Kira could have sworn she felt a pulse beneath the stone.\n\nAt the bottom, they found an ancient temple built into the canyon itself. Its entrance was shaped like a serpent's open mouth, and its eyes glowed with an eerie light.\n\n\"I have a bad feeling about this,\" Lian muttered.\n\nInside, the temple was a labyrinth of tunnels, each one identical to the last. They wandered for hours, lost, until Kira realized the truth.\n\n\"The temple is alive,\" she said. \"It's changing the layout to confuse us.\"\n\n\"Then how do we find the fragment?\"\n\n\"We ask permission.\" Kira knelt and placed her hand on the floor. \"Great serpent, we mean no harm. We seek the fragment to restore the light.\"\n\nThe temple rumbled, and a passage opened before them." },
    { title: "The World Serpent", content: "The passage led to a vast chamber where the World Serpent itself lay coiled. Its body was as thick as a tree trunk, its scales gleaming with an iridescent sheen. Its eyes, each the size of a shield, regarded them with ancient wisdom.\n\n\"You seek the fragment,\" the serpent said, its voice resonating through the stone.\n\n\"Yes,\" Kira said, bowing her head. \"We seek to restore the sun.\"\n\n\"The sun was hidden to protect the balance. Are you prepared to uphold that balance?\"\n\n\"I am.\"\n\nThe serpent studied her for a long moment. Then it uncoiled, revealing a pedestal beneath its body. On it rested the sixth fragment.\n\n\"Take it,\" the serpent said. \"But remember — with light comes shadow. You must accept both.\"\n\nKira took the fragment, feeling its power join the others. The Ember blazed brightly, and she felt a connection to all six fragments now.\n\n\"Six down,\" she said. \"One remains.\"\n\nThe final fragment was at the center of the world — the place where the first light was born.\n\n\"The Heart of the World,\" Lian said. \"That's where we'll face our greatest challenge.\"" },
    { title: "The Heart of the World", content: "The journey to the Heart of the World took them across continents and through dangers that tested every fiber of their being. They crossed burning deserts and frozen tundras, faced creatures of nightmare and forces beyond comprehension.\n\nBut finally, they arrived. The Heart of the World was a cave system deep beneath the highest mountain range. At its center was a chamber of pure crystal, pulsing with a light that seemed to come from the earth itself.\n\nAnd there, floating at the center of the chamber, was the seventh fragment.\n\n\"This is it,\" Kira whispered.\n\nBut as she reached for it, a figure stepped from the shadows. It was Elder Theron, looking older and wearier than she remembered.\n\n\"Kira,\" he said. \"I'm sorry, but I cannot let you complete this.\"\n\n\"Theron? What are you doing here?\"\n\n\"Protecting the world from the truth,\" he said. \"The prophecy of the Last Ember was not about restoring the sun. It was about choice. And I chose darkness.\"\n\nKira stared at him, betrayal washing over her. \"You?\"" },
    { title: "The Truth", content: "\"The dimming wasn't an accident,\" Theron said, his voice heavy with guilt. \"It was a choice. Our ancestors discovered that the sun's power was connected to the emotions of all living beings. In times of great conflict, the sun would flare, causing devastation. The only way to prevent it was to dim the light.\"\n\n\"So you've been keeping the world in darkness to protect it?\" Kira asked.\n\n\"Yes. The Shadow Guild was created to maintain the dimming. But over generations, their purpose was forgotten, and they became what they are now.\"\n\n\"And the fragments?\" Lian asked.\n\n\"Were scattered to prevent anyone from restoring the sun. But I knew one day someone would find them. The prophecy ensured it.\"\n\nKira looked at the seven fragments she had collected. \"So what happens if I restore the light?\"\n\n\"The world gets the sun back,\" Theron said. \"But also the danger. Conflict will cause flares. Wars will be more devastating. The sun will become a weapon.\"\n\n\"And if I don't?\"\n\n\"The world stays as it is. Dark, cold, but safe.\"\n\nKira stood at the crossroads of choice. Seven fragments in her hands. The fate of the world balancing on her decision." },
    { title: "The Choice", content: "Kira closed her eyes and thought of everything she had seen on her journey — the beauty of the Whispering Forest, the majesty of Crystal Lake, the wisdom of the World Serpent, the temptations of the Golden City. She thought of her people, shivering in the cold, dreaming of a light they had never known.\n\nBut she also thought of the dangers Theron had described. The wars that could be fought with the sun as a weapon. The destruction that light could bring.\n\n\"There has to be another way,\" she said.\n\n\"There is no other way,\" Theron said.\n\nBut the Ember on her chest grew warm, and Kira understood. The Ember wasn't just a key — it was a regulator. It could control the sun's connection to human emotion.\n\n\"The Ember can balance it,\" she said. \"That's why it was created. Not as a piece of the sun, but as a controller.\"\n\nTheron's eyes widened. \"You're right. I had forgotten.\"\n\nKira placed all seven fragments around the Ember, and they began to orbit it slowly, forming a constellation of light. She focused her will, channelling the Ember's power to bind the fragments, to create a new sun that would be regulated by the Ember's balance.\n\nThe chamber shook. Light exploded in every direction. And then — silence.\n\nWhen Kira opened her eyes, the fragments were gone. The Ember was cold. And through a crack in the ceiling, she saw it — a warm, golden glow.\n\nThe sun had returned." },
    { title: "A New Dawn", content: "They emerged from the cave to find the world transformed. The grey sky was painted in shades of orange and pink as the sun rose for the first time in three hundred years. The light was warm, golden, and beautiful beyond words.\n\nKira stood on the mountainside, tears streaming down her face. She had done it. She had brought back the light.\n\n\"It's magnificent,\" Lian whispered beside her.\n\nTheron stood apart, his face unreadable. But as the sun's rays touched his skin, Kira saw a smile — small, but genuine.\n\n\"I never thought I'd see this again,\" he said.\n\nAs word spread, people emerged from their homes to witness the miracle. The bioluminescent fungi that had lit their streets for centuries began to fade, replaced by true sunlight. Crops would grow again. Children would know warmth.\n\nKira looked at the cold Ember in her hands. Its purpose was fulfilled.\n\n\"What will you do now?\" Lian asked.\n\n\"Help them rebuild,\" she said. \"Teach them to live in the light. And make sure we never forget what darkness taught us.\"\n\nShe tucked the Ember into her pocket. The world was bright again. But she would carry the memory of the darkness — and the lessons it had taught her — forever.\n\nThe sun had risen. And Kira was ready for whatever came next." },
    { title: "Epilogue: The Ember's Legacy", content: "One year later, Kira stood on a hill overlooking a city that had been reborn. Crops grew in fields that had been barren. Children played in streets that had known only shadows. And in the sky, the sun shone bright and steady.\n\nThe Ember was displayed in a new temple, built at the center of the city. It no longer held flame, but it served as a reminder — of the darkness that had been, and the light that could be lost.\n\nLian had become a historian, recording the journey so that future generations would know their history. Elder Theron had found peace, tending to the gardens that had sprung up around the temple.\n\nAnd Kira? She had become the Keeper of the Light, a title she wore with humility and pride. Not because she had restored the sun, but because she had learned that true light came not from the sky, but from within.\n\n\"Ready?\" Lian asked, joining her on the hill.\n\n\"Ready,\" she said.\n\nThey walked down into the city, into a world full of color and warmth. The journey was over. But in many ways, it was just beginning.\n\nThe end." },
  ]

  // Create all 30 chapters
  const allChapterData = [...emberChapters, ...chapterTemplates]
  for (let i = 0; i < 30; i++) {
    const data = allChapterData[i] || chapterTemplates[i % chapterTemplates.length]
    await prisma.chapter.upsert({
      where: { id: `ch-ember-${i + 1}` },
      update: {},
      create: {
        id: `ch-ember-${i + 1}`,
        title: data.title,
        content: data.content,
        number: i + 1,
        wordCount: countWords(data.content),
        storyId: lastEmber.id,
      },
    })
  }

  // Update story word count
  const allChapters = await prisma.chapter.findMany({ where: { storyId: lastEmber.id } })
  const totalWords = allChapters.reduce((sum, ch) => sum + ch.wordCount, 0)
  await prisma.story.update({
    where: { id: lastEmber.id },
    data: { wordCount: totalWords },
  })

  // Add some view counts for "The Last Ember"
  for (let i = 0; i < 50; i++) {
    const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    await prisma.storyView.create({
      data: { storyId: lastEmber.id, createdAt: date },
    })
  }

  // ── STORY 2: Draft story by Author ──
  const draftStory = await prisma.story.upsert({
    where: { id: "story-draft" },
    update: {},
    create: {
      id: "story-draft",
      title: "Whispers in the Wind",
      description: "A quiet village harbors secrets that even the wind refuses to tell. When a stranger arrives asking questions best left unasked, the truth begins to unravel.",
      tags: "mystery,thriller,slice-of-life",
      status: "DRAFT",
      accessType: "FREE",
      freePreviewChapters: 3,
      authorId: author.id,
    },
  })

  const draftChapter = await prisma.chapter.upsert({
    where: { id: "ch-draft-1" },
    update: {},
    create: {
      id: "ch-draft-1",
      title: "The Stranger",
      content: "The stranger arrived on a Tuesday, when the autumn leaves were at their most golden and the air carried the scent of woodsmoke from chimneys that had not been lit since spring.\n\nElara watched him from her window, as she watched everyone who passed through her village. It was a habit born of curiosity rather than suspicion — in a place this small, any new face was an event.\n\nHe was tall, with the weathered look of someone who had traveled far. His clothes were practical but worn, and he carried a satchel that seemed to contain everything he owned. But it was his eyes that caught her attention — they held a purpose that went beyond mere travel.\n\n\"Who do you suppose he is?\" her mother asked, joining her at the window.\n\n\"I don't know,\" Elara replied. \"But I intend to find out.\"",
      number: 1,
      wordCount: 163,
      storyId: draftStory.id,
    },
  })

  await prisma.story.update({
    where: { id: draftStory.id },
    data: { wordCount: draftChapter.wordCount },
  })

  // ── STORY 3: Published ongoing story (10 chapters, by premium creator) ──
  const ongoingStory = await prisma.story.upsert({
    where: { id: "story-ongoing" },
    update: {},
    create: {
      id: "story-ongoing",
      title: "Stars Beyond the Horizon",
      description: "Captain Sera Chen commands the merchant vessel 'Stardrift' through a universe teeming with alien species, corporate intrigue, and uncharted nebulas. When she stumbles upon a derelict ship carrying a cryptic message, she's pulled into a conspiracy that threatens the entire galactic federation.",
      tags: "sci-fi,space,adventure,action",
      status: "PUBLISHED",
      accessType: "FREEMIUM",
      freePreviewChapters: 5,
      authorId: premium.id,
    },
  })

  const starChapters = [
    { title: "The Stardrift", content: "Captain Sera Chen stood on the bridge of the Stardrift, watching the stars blur past as the ship cruised at light-speed. The vessel was modest by galactic standards — a Class-3 merchant hauler with upgraded engines and a crew of twelve — but it was hers, and that made it the finest ship in the galaxy.\n\n\"Approaching Waystation Theta-7, Captain,\" her first officer, Zeke, reported from the navigation console. \"We're scheduled for a two-day layover for cargo loading.\"\n\n\"Any word on the cargo manifest?\" Sera asked.\n\n\"Just the usual — medical supplies bound for the outer colonies, replacement parts for the mining platforms on Krynn.\"\n\nSera nodded. It was routine, uneventful. Just the way she liked it. After fifteen years of hauling cargo across the galaxy, she had learned that excitement was overrated.\n\nBut as they dropped out of light-speed and the Waystation came into view, Sera noticed something unusual. A ship — dark, sleek, and clearly military — was docked at the station's restricted bay.\n\n\"Zeke, run that vessel's transponder.\"\n\nZeke tapped his console, his face paling. \"Captain... that's a Confederation black-ops ship. The kind that doesn't officially exist.\"\n\nSera's instincts flared. Routine, uneventful — those days were about to end." },
    { title: "The Message", content: "The docking bay was unusually quiet as Sera descended the ramp. The station's usual hustle and bustle was replaced by a tense, watchful silence. The crew of the black-ops ship had already disembarked, their dark uniforms marking them as Confederation Intelligence.\n\n\"Captain Sera Chen?\" A woman in a commanding officer's uniform approached. Her face was sharp, her eyes cold and analytical. \"I'm Commander Voss. We need to speak.\"\n\n\"About what?\"\n\n\"About the derelict you're scheduled to retrieve on your return route.\"\n\nSera blinked. \"I haven't been notified of any derelict.\"\n\n\"You will be. The official manifest lists it as salvage. But what you'll actually find is a ship that disappeared thirty years ago — the Vanguard. It was carrying a message. A message that certain parties would prefer never reaches the Federation Council.\"\n\n\"And you're telling me this because...?\"\n\n\"Because we need someone outside official channels to retrieve it. Someone who can be trusted.\"\n\nSera laughed. \"You don't know me.\"\n\n\"I know enough,\" Commander Voss said, handing her a datapad. \"The coordinates are encrypted. The message, when you find it, will change everything.\" She paused. \"Or end everything.\"" },
    { title: "The Derelict", content: "The Vanguard floated in the void like a ghost, its hull scarred by micro-meteorites and decades of radiation. It had once been a magnificent vessel — a flagship of the Federation's exploratory fleet — but now it was a tomb, adrift in an unnamed system.\n\n\"No power signatures,\" Zeke reported. \"Hull integrity is at 23%. Life support is non-functional.\"\n\n\"Any life signs?\" Sera asked.\n\n\"Nothing, Captain. The ship's been dead for thirty years.\"\n\nSera ordered a boarding party. She led the team herself, her mag-boots clanking against the derelict's hull as they floated through the airlock. Inside, the ship was dark and cold, its systems long since failed.\n\n\"The bridge is this way,\" she said, her helmet's flashlight cutting through the darkness.\n\nThey found the bridge in surprisingly intact condition. The captain's chair was still bolted to the floor, and the main console flickered with residual power. Sera approached it carefully, her hand hovering over the interface.\n\n\"There's a message here,\" she said. \"Encrypted, but still intact.\"\n\nAs she initiated playback, a hologram flickered to life. The face of a man — tired, desperate, but determined — appeared before them.\n\n\"If you're seeing this,\" the man said, \"then I failed. But you can still succeed. The Federation is not what it seems.\"" },
    { title: "The Conspiracy", content: "The hologram continued: \"My name is Admiral Kaelen Vance. I was the commander of the Vanguard, and I discovered the truth about the Confederation's origins. The Federation Council was never democratically elected. They're a hereditary oligarchy, controlling the galaxy through manipulation and fear.\"\n\nSera exchanged glances with Zeke. This was treason of the highest order.\n\n\"The evidence is stored in the ship's data core,\" the Admiral continued. \"Genealogical records, financial transactions, communications logs — everything you need to expose them. But they know I found it. They sent assassins. I have hours, maybe less.\"\n\n\"Thirty years ago,\" Zeke whispered. \"He was recording this thirty years ago.\"\n\n\"I'm entrusting this to whoever finds the Vanguard,\" the Admiral said. \"Use it wisely. The galaxy deserves to know the truth.\" The hologram flickered and died.\n\nSera stood in silence, the weight of the revelation pressing down on her. She had expected routine cargo and quiet ports. Instead, she had become the keeper of a secret that could shatter the galaxy.\n\n\"We need to retrieve that data core,\" she said finally. \"And we need to do it before Commander Voss's people decide we know too much.\"" },
    { title: "The Chase", content: "They extracted the data core just minutes before the Confederation black-ops team arrived. Sera watched from the Stardrift's bridge as their sleek ship pulled alongside the Vanguard, disgorging armed soldiers.\n\n\"They're here for the evidence,\" Zeke said.\n\n\"Then we'd better not be here when they realize it's gone.\" Sera turned to her pilot. \"Get us out of here. Full burn.\"\n\nThe Stardrift's engines flared, and the ship accelerated away from the derelict. Behind them, alarms blared on the Confederation ship as it gave chase.\n\n\"They're powering weapons,\" Zeke reported.\n\n\"Shields up. Evasive maneuvers.\"\n\nThe next few minutes were a blur of near-misses and emergency turns. The Stardrift was a merchant vessel, not built for combat, but Sera's years of experience kept them one step ahead.\n\n\"Jump drive is charged,\" the pilot announced.\n\n\"Plot a course for neutral space. Maximum randomness.\"\n\nThe stars stretched and twisted as the jump drive engaged, and the pursuing ship vanished behind them. They had escaped — for now.\n\nSera held the data core in her hands, its weight far exceeding its physical mass. The truth was hers to protect now. And she would protect it with everything she had." },
    { title: "Safe Harbor", content: "They emerged from jump space in the Omicron Nebula, a vast cloud of gas and dust that played havoc with sensors. It was the perfect place to hide while they figured out their next move.\n\n\"We can't go back to any Federation port,\" Zeke said. \"They'll have flagged our transponder by now.\"\n\n\"I know.\" Sera was studying the data core's contents on the bridge's main display. \"But we have allies. There's a network of independent colonies in the Outer Rim that don't answer to the Council.\"\n\n\"You're talking about the Free Zones. They're lawless, Captain.\"\n\n\"They're free,\" Sera corrected. \"And right now, that's exactly what we need.\"\n\nShe sent a coded message to an old contact — a former Federation officer who had retired to the Rim. If anyone knew where they could find safety, it was him.\n\nWhile they waited for a reply, Sera delved deeper into the evidence. The Admiral's data was comprehensive: family trees linking the Council members to a single bloodline, dating back centuries. Financial records showing trillions of credits siphoned from Federation budgets. Communications logs revealing orders that had led to wars, assassinations, and the suppression of entire colonies.\n\n\"This is bigger than I thought,\" she said quietly.\n\n\"Can we still walk away?\" Zeke asked.\n\nSera looked at him, then at the data core. \"I don't think we can. Not anymore.\"" },
    { title: "The Contact", content: "The reply came three hours later. A set of coordinates and a single word: \"Come.\"\n\nTheir contact was a man named Darius Kane — former Fleet Admiral, now a rumored information broker operating out of the Free Zone station called Haven. If anyone could help them navigate the political minefield ahead, it was him.\n\nHaven lived up to its name. The station was a sprawling metropolis of interconnected modules, home to refugees, traders, and outcasts from a hundred different species. It was chaotic, vibrant, and gloriously free.\n\nDarius Kane's office was in the oldest part of the station, accessible only through a labyrinth of narrow corridors and hidden passages. The man himself was older than Sera had expected, his face lined with decades of hard living.\n\n\"Sera Chen,\" he said, studying her with sharp eyes. \"You've made quite a mess.\"\n\n\"I didn't ask for this.\"\n\n\"No one ever does.\" He gestured for them to sit. \"Show me what you found.\"\n\nSera handed over the data core, and Kane connected it to his terminal. As he reviewed the files, his expression grew increasingly grim.\n\n\"This is... comprehensive,\" he said. \"And incredibly dangerous. If the Council knows you have this, they'll stop at nothing to retrieve it.\"\n\n\"We figured that part out when they tried to blow us up.\"\n\nKane smiled grimly. \"I know people who can help. Journalists, activists, a few sympathetic council members. But it'll take time to build a case that can't be dismissed.\"\n\n\"We don't have time,\" Sera said. \"Every minute we wait, they're destroying evidence and silencing witnesses.\"" },
    { title: "The Alliance", content: "Darius Kane introduced them to the network — a loose coalition of truth-seekers that spanned the galaxy. There was Lyra, a journalist who had been investigating the Council for years. There was Torvin, a hacker who could crack any system. And there was the mysterious \"Oracle,\" whose identity even Kane didn't know, who provided strategic guidance.\n\n\"You'll be working from the shadows,\" Kane explained. \"The Stardrift is too recognizable now. We'll set you up with a new ship, new identities, and a secure base of operations.\"\n\n\"What about my crew?\" Sera asked.\n\n\"They can stay with you, or they can disappear. The choice is theirs.\"\n\nSera gathered her crew and explained the situation. To her surprise, not one of them chose to leave. The Stardrift was their home, and Sera was their captain. Where she went, they followed.\n\n\"Alright,\" Sera said, turning to Kane. \"What's our first move?\"\n\n\"There's a Council session in three weeks,\" Kane said. \"The annual address. Every major news network will be covering it. If we can broadcast the evidence during that session, the entire galaxy will witness the truth.\"\n\n\"And if we fail?\"\n\n\"Then the Council wins. And everyone who helped us disappears.\"\n\nSera looked at her crew, at the network of allies they had just joined, at the data core that held the key to everything. \"Then we don't fail.\"" },
    { title: "The Plan", content: "The plan was audacious — maybe suicidal — but it was the only option they had.\n\nTorvin would breach the Council's secure network during the annual address, inserting a backdoor that would allow them to override the broadcast. Lyra had prepared a documentary package that summarized the evidence in a way that anyone could understand. The Oracle had identified key allies on the Council who would call for an immediate investigation once the evidence went public.\n\nSera's role was the most dangerous. She would be on the ground at the capital world, ready to physically deliver the data core to a trusted council member if the digital broadcast failed.\n\n\"You'll need an identity that doesn't trace back to you,\" Kane said. \"We have forgers who can create documentation that will pass any scan.\"\n\n\"And if I'm caught?\"\n\n\"Then you never existed. The Stardrift will be scuttled. Your crew will be given new lives on distant colonies.\"\n\nIt was a harsh contingency, but Sera understood. If she was captured, the Council would use any connection to find the others. She had to be a ghost.\n\n\"Three weeks,\" she said. \"Let's make them count.\"\n\nThe next days were a whirlwind of preparation. Sera memorized her new identity, practiced her cover story, and studied the layout of the capital. Her crew worked around the clock, modifying the Stardrift for a final mission that might end in escape — or destruction." },
    { title: "The Address", content: "The Council chamber was magnificent — a vast amphitheater filled with representatives from a thousand worlds. The galleries were packed with journalists and dignitaries, all awaiting the annual address.\n\nSera was among them, disguised as a mid-level trade delegate from a minor colony. Her heart pounded beneath her calm exterior as she watched the Council President take the podium.\n\n\"Citizens of the Federation,\" the President began, his voice echoing through the chamber. \"I stand before you today to celebrate another year of peace and prosperity...\"\n\nSera's earpiece crackled. \"We're in,\" Torvin's voice said. \"The backdoor is open. Lyra's package is ready to broadcast.\"\n\n\"Wait for my signal,\" Sera whispered.\n\nAs the President continued his speech, Sera watched the clock. The plan required precise timing — the broadcast had to go live when the maximum number of viewers were watching.\n\nAt exactly the right moment, she pressed the device in her pocket.\n\nThe screens throughout the chamber flickered. The President's face was replaced by Lyra's documentary, and the evidence began to play.\n\nFor a moment, there was stunned silence. Then chaos erupted.\n\n\"The broadcast is live on every channel,\" Torvin reported. \"It's working!\"\n\nBut as Sera moved toward the exit, she saw Commander Voss's black-uniformed soldiers entering the chamber. They were scanning the crowd, searching for her.\n\n\"Plan B,\" Sera said, reaching for the data core hidden in her jacket. \"I'm going for the council member.\"" },
    { title: "The Truth Prevails", content: "Sera moved against the tide of panicking delegates, her eyes fixed on Council Member Aris, one of the allies the Oracle had identified. She reached him just as Commander Voss's soldiers spotted her.\n\n\"Council Member,\" she said, pressing the data core into his hands. \"This is the original evidence. Protect it with your life.\"\n\nAris looked at the core, then at Sera. \"You're the one who did this.\"\n\n\"I'm just the messenger. The truth belongs to everyone now.\"\n\nSoldiers were pushing through the crowd toward them. Sera turned to flee, but a hand grabbed her arm.\n\n\"Not so fast,\" Commander Voss said, her grip like iron. \"You're coming with me.\"\n\nBut before she could react, Council Member Aris stepped forward. \"Commander Voss, you will release this citizen immediately. Or I will have you arrested for assaulting a delegate.\"\n\n\"She's a criminal,\" Voss spat.\n\n\"She's a messenger who has just exposed the greatest conspiracy in galactic history. And you, Commander, have a lot of questions to answer.\"\n\nVoss hesitated, then released Sera's arm. The tide had turned.\n\nIn the weeks that followed, the galaxy was transformed. The Council was dissolved, replaced by a transitional government. New elections were scheduled. And Sera Chen, humble merchant captain, became a symbol of the fight for truth.\n\nShe turned down every interview request, every award, every opportunity to capitalize on her fame. Instead, she returned to the Stardrift, her crew waiting for her.\n\n\"Where to, Captain?\" Zeke asked.\n\nSera looked at the stars — no longer symbols of oppression, but of freedom and possibility. \"Let's see what's out there,\" she said. \"I hear there's a whole galaxy to explore.\"" },
  ]

  for (let i = 0; i < starChapters.length; i++) {
    await prisma.chapter.upsert({
      where: { id: `ch-star-${i + 1}` },
      update: {},
      create: {
        id: `ch-star-${i + 1}`,
        title: starChapters[i].title,
        content: starChapters[i].content,
        number: i + 1,
        wordCount: countWords(starChapters[i].content),
        storyId: ongoingStory.id,
      },
    })
  }

  // Update ongoing story word count
  const starAllChs = await prisma.chapter.findMany({ where: { storyId: ongoingStory.id } })
  const starTotalWords = starAllChs.reduce((sum, ch) => sum + ch.wordCount, 0)
  await prisma.story.update({
    where: { id: ongoingStory.id },
    data: { wordCount: starTotalWords },
  })

  // Add view counts for ongoing story
  for (let i = 0; i < 20; i++) {
    const date = new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000)
    await prisma.storyView.create({
      data: { storyId: ongoingStory.id, createdAt: date },
    })
  }

  // ── FOLLOWERS ──────────────────────────────────────────────────────────────
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: reader.id, followingId: superAdmin.id } },
    update: {},
    create: { followerId: reader.id, followingId: superAdmin.id },
  })
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: critic.id, followingId: superAdmin.id } },
    update: {},
    create: { followerId: critic.id, followingId: superAdmin.id },
  })
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: fan.id, followingId: superAdmin.id } },
    update: {},
    create: { followerId: fan.id, followingId: superAdmin.id },
  })
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: reader.id, followingId: premium.id } },
    update: {},
    create: { followerId: reader.id, followingId: premium.id },
  })
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: fan.id, followingId: premium.id } },
    update: {},
    create: { followerId: fan.id, followingId: premium.id },
  })
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: reader.id, followingId: author.id } },
    update: {},
    create: { followerId: reader.id, followingId: author.id },
  })

  // ── SAVES ──────────────────────────────────────────────────────────────────
  await prisma.save.upsert({
    where: { userId_storyId: { userId: reader.id, storyId: lastEmber.id } },
    update: {},
    create: { userId: reader.id, storyId: lastEmber.id },
  })
  await prisma.save.upsert({
    where: { userId_storyId: { userId: critic.id, storyId: lastEmber.id } },
    update: {},
    create: { userId: critic.id, storyId: lastEmber.id },
  })
  await prisma.save.upsert({
    where: { userId_storyId: { userId: fan.id, storyId: ongoingStory.id } },
    update: {},
    create: { userId: fan.id, storyId: ongoingStory.id },
  })

  // ── COMMENTS ───────────────────────────────────────────────────────────────
  const comments = [
    { content: "This is such a compelling story! I love the world-building and the mystery surrounding the Ember.", userId: reader.id, storyId: lastEmber.id },
    { content: "The way you describe the perpetual twilight is hauntingly beautiful. I can almost feel the cold.", userId: critic.id, storyId: lastEmber.id },
    { content: "Kira is such a strong protagonist. Can't wait to see how her journey unfolds!", userId: fan.id, storyId: lastEmber.id },
    { content: "The Shadow Guild reveal was perfectly done. I didn't see that coming at all!", userId: reader.id, storyId: lastEmber.id },
    { content: "This chapter gave me chills. The Guardian scene was epic.", userId: critic.id, storyId: lastEmber.id, chapterId: "ch-ember-9" },
    { content: "The prophecy adds such depth to the story. I'm theorizing about what the sacrifice could be.", userId: fan.id, storyId: lastEmber.id, chapterId: "ch-ember-4" },
    { content: "I've been reading this story for weeks and it just keeps getting better. Best thing on LikhaVerse!", userId: reader.id, storyId: lastEmber.id, chapterId: "ch-ember-15" },
    { content: "The world-building in this story is incredible. Every location feels alive and unique.", userId: critic.id, storyId: lastEmber.id },
    { content: "Kira and Lian's friendship is so wholesome. I hope nothing bad happens to either of them.", userId: fan.id, storyId: lastEmber.id },
    { content: "Excellent pacing! The tension builds perfectly across chapters.", userId: critic.id, storyId: lastEmber.id },
    { content: "Just finished reading all available chapters. When is the next one coming?", userId: reader.id, storyId: ongoingStory.id },
    { content: "Captain Sera is my new favorite character. Love the sci-fi setting!", userId: fan.id, storyId: ongoingStory.id },
    { content: "The conspiracy plot is gripping. Reminds me of the best space operas.", userId: critic.id, storyId: ongoingStory.id },
    { content: "The Stardrift feels like home already. Great character work on the crew.", userId: reader.id, storyId: ongoingStory.id, chapterId: "ch-star-1" },
    { content: "That twist with Admiral Vance's message gave me chills! Brilliant writing.", userId: fan.id, storyId: ongoingStory.id, chapterId: "ch-star-3" },
  ]

  for (const c of comments) {
    await prisma.comment.create({
      data: {
        content: c.content,
        userId: c.userId,
        storyId: c.storyId,
        chapterId: c.chapterId,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    })
  }

  // Add a reply to the first comment
  const firstComment = await prisma.comment.findFirst({
    where: { storyId: lastEmber.id },
    orderBy: { createdAt: "asc" },
  })
  if (firstComment) {
    await prisma.comment.create({
      data: {
        content: "Thank you so much! I poured my heart into this world, and I'm so glad you're enjoying it!",
        userId: superAdmin.id,
        storyId: lastEmber.id,
        parentId: firstComment.id,
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
    })
  }

  // ── REACTIONS (chapter likes) ──────────────────────────────────────────────
  const chapterIds = allChapters.slice(0, 10).map((ch) => ch.id)
  for (const chId of chapterIds) {
    for (const user of [reader, critic, fan]) {
      await prisma.reaction.upsert({
        where: { userId_chapterId_type: { userId: user.id, chapterId: chId, type: "like" } },
        update: {},
        create: { userId: user.id, chapterId: chId, type: "like" },
      })
    }
  }

  // ── CHARACTER PROFILES for The Last Ember ──────────────────────────────────
  const characters = [
    {
      name: "Kira",
      age: "17",
      gender: "Female",
      personality: "Brave, curious, determined, compassionate. Kira is a natural leader who rises to the occasion even when fear threatens to overwhelm her.",
      appearance: "Long dark hair tied back, grey eyes that reflect the perpetual twilight, lean build from years of hard work. She has a small scar on her left cheek from a childhood accident.",
      clothing: "Worn leather tunic and trousers, a patched cloak, sturdy boots. She carries the Ember in a pouch strapped to her chest.",
      species: "Human",
      background: "Born in the twilight world after the dimming. Her parents died when she was young, and she was raised by the village elders. She works as a scavenger, exploring ruins for useful materials, which made her the perfect person to discover the Ember.",
      artStyle: "realistic",
    },
    {
      name: "Lian",
      age: "18",
      gender: "Male",
      personality: "Loyal, witty, optimistic, quick-thinking. Lian balances Kira's seriousness with humor and provides emotional support during their darkest moments.",
      appearance: "Short brown hair, hazel eyes, freckled face. Slightly shorter than Kira but more muscular from working in the fields.",
      clothing: "Simple farmer's clothes — loose shirt, reinforced trousers, a vest with many pockets. He wears a lucky charm around his neck.",
      species: "Human",
      background: "Kira's best friend since childhood. He comes from a family of farmers and has never ventured beyond the village until Kira's discovery. His knowledge of plants and survival skills proves invaluable on their journey.",
      artStyle: "realistic",
    },
    {
      name: "Elder Theron",
      age: "72",
      gender: "Male",
      personality: "Wise, burdened by secrets, kind but conflicted. Theron carries the weight of knowledge he's kept hidden for decades.",
      appearance: "White hair, long beard, deep-set eyes that hold ancient knowledge. Walks with a slight stoop but moves with surprising grace.",
      clothing: "Traditional elder's robes in deep blue, adorned with faded symbols of the old world. Carries a staff carved with runes.",
      species: "Human",
      background: "The eldest member of the Council of Elders. He was one of the few who knew the truth about the dimming and the prophecy. His decision to reveal the truth to Kira sets the entire story in motion.",
      artStyle: "realistic",
    },
    {
      name: "Elder Maren",
      age: "58",
      gender: "Female",
      personality: "Cunning, ambitious, manipulative, patient. Maren has been working in the shadows for decades, building power within the Shadow Guild.",
      appearance: "Sharp features, silver-streaked black hair pulled into a severe bun, cold grey eyes. She has a commanding presence that demands respect.",
      clothing: "Dark robes of fine material, silver jewelry, a cloak lined with shadow-weave fabric that seems to absorb light.",
      species: "Human",
      background: "Maren joined the Council twenty years ago, but her allegiance to the Shadow Guild predates her appointment. She believes darkness is the natural state of the world and seeks to prevent the sun's return to maintain her power.",
      artStyle: "realistic",
    },
    {
      name: "The World Serpent",
      age: "Unknown (ancient)",
      gender: "Neither (referred to as it)",
      personality: "Ancient, wise, patient, speaks in riddles. The Serpent has guarded its fragment for millennia and tests the worthiness of all who seek it.",
      appearance: "Massive serpentine body covered in iridescent scales that shift colors. Its eyes glow with inner light. It can coil around entire mountains.",
      clothing: "None",
      species: "World Serpent (ancient primordial being)",
      background: "One of the original guardians created to protect the Sun Stone fragments. It has existed since before the dimming and possesses knowledge of the old world that no human could comprehend.",
      artStyle: "fantasy",
    },
  ]

  for (const ch of characters) {
    const saved = await prisma.character.create({
      data: {
        name: ch.name,
        age: ch.age,
        gender: ch.gender,
        personality: ch.personality,
        appearance: ch.appearance,
        clothing: ch.clothing,
        species: ch.species,
        background: ch.background,
        artStyle: ch.artStyle,
        storyId: lastEmber.id,
        authorId: superAdmin.id,
      },
    })

    // Create placeholder AI generation records for each character
    await prisma.aIGeneration.create({
      data: {
        type: "CHARACTER",
        prompt: `Generate a ${ch.artStyle} portrait of ${ch.name}: ${ch.appearance}`,
        imageUrl: `/uploads/placeholder-character-${saved.name.toLowerCase().replace(/\s+/g, "-")}.jpg`,
        metadata: JSON.stringify({ characterId: saved.id, style: ch.artStyle }),
        userId: superAdmin.id,
        storyId: lastEmber.id,
        characterId: saved.id,
        status: "COMPLETED",
        provider: "mock",
        durationMs: Math.floor(Math.random() * 3000) + 500,
      },
    })
  }

  // ── COVER GENERATION RECORDS ───────────────────────────────────────────────
  const coverStyles = ["fantasy", "dark", "anime", "watercolor"]
  for (const style of coverStyles) {
    await prisma.aIGeneration.create({
      data: {
        type: "COVER",
        prompt: `Generate a ${style} cover for "The Last Ember" — a fantasy story about finding the last ember of fire in a twilight world`,
        imageUrl: `/uploads/placeholder-cover-ember-${style}.jpg`,
        metadata: JSON.stringify({ style }),
        userId: superAdmin.id,
        storyId: lastEmber.id,
        status: "COMPLETED",
        provider: "mock",
        modelUsed: style,
        durationMs: Math.floor(Math.random() * 2000) + 300,
      },
    })
  }

  // ── WORLD BUILDING ENTRIES ─────────────────────────────────────────────────
  const worldEntries = [
    {
      type: "geography",
      title: "The Grey Wastes",
      content: "A vast expanse of ash-coloured earth stretching for hundreds of miles. Once a fertile region before the dimming, now a barren wasteland where nothing grows. The temperature fluctuates wildly between scorching days and freezing nights. Ancient ruins dot the landscape, remnants of cities from before the dimming.",
      metadata: JSON.stringify({ climate: "arid", dangerLevel: "moderate", resources: ["ruins", "minerals"] }),
    },
    {
      type: "society",
      title: "The Council of Elders",
      content: "The governing body of the last remaining human settlement. Comprised of seven elders, each representing a different aspect of society (agriculture, knowledge, defense, etc.). The Council makes decisions through consensus, but internal politics and secret allegiances have plagued it for generations.",
    },
    {
      type: "lore",
      title: "The Prophecy of the Last Ember",
      content: "An ancient prophecy that speaks of a time when fire would return to the world through a chosen one. The prophecy is written in an ancient language on scrolls kept in the Temple of the Sun. It speaks of seven fragments, a great sacrifice, and the choice between light and darkness.",
      metadata: JSON.stringify({ origin: "pre-dimming", verified: true, relatedCharacters: ["Kira"] }),
    },
    {
      type: "magic",
      title: "The Ember's Power",
      content: "The Ember is not just a piece of the original sun, but a regulating mechanism designed to control the sun's connection to human emotion. It was created by an ancient civilization that foresaw the danger of unchecked solar power. The Ember responds to the will of its bearer and can amplify or dampen the sun's energy.",
    },
    {
      type: "faction",
      title: "The Shadow Guild",
      content: "A secret organization that has worked for centuries to maintain the dimming. Originally founded with noble intentions — to protect the world from the sun's destructive potential — the Guild has become corrupt, using the darkness to consolidate power. They operate from hidden bases and have infiltrated most governments.",
      metadata: JSON.stringify({ members: "unknown", threatLevel: "extreme", goals: ["maintain darkness", "control Sun Stone fragments"] }),
    },
  ]

  for (const entry of worldEntries) {
    await prisma.worldBuildingEntry.create({
      data: {
        type: entry.type,
        title: entry.title,
        content: entry.content,
        metadata: entry.metadata,
        storyId: lastEmber.id,
        authorId: superAdmin.id,
      },
    })
  }

  // ── ENVIRONMENT DESCRIPTIONS ───────────────────────────────────────────────
  const environments = [
    { name: "The Twilight Village", description: "The last human settlement, built around a central marketplace lit by bioluminescent fungi. Houses are made of stone and timber, designed to retain heat. The village is surrounded by a wall built from ruins of the old world.", mood: "somber but resilient" },
    { name: "The Sunken City", description: "An ancient city of gleaming stone spires and marble streets, perfectly preserved from before the dimming. The architecture is unlike anything built today, with impossible angles and surfaces that seem to glow with residual magic.", mood: "majestic and eerie" },
    { name: "The Temple of the Sun", description: "A massive structure at the heart of the Sunken City, covered in mosaics depicting a golden sun. Inside, the walls are lined with ancient texts and artifacts. The main chamber houses the Sun Stone pedestal.", mood: "sacred and awe-inspiring" },
    { name: "The Whispering Forest", description: "A dense forest where the trees seem to communicate through rustling leaves. The voices speak in ancient languages. The forest is home to the Forest Guardian and the second Sun Stone fragment.", mood: "mysterious and alive" },
    { name: "Crystal Lake", description: "A lake of perfect clarity, so clear that the bottom is visible even in twilight. The water is freezing cold year-round. Beneath the surface lies an underwater cavern system leading to the third fragment.", mood: "serene but dangerous" },
  ]

  for (const env of environments) {
    await prisma.environmentStudio.create({
      data: {
        name: env.name,
        description: env.description,
        mood: env.mood,
        imageUrl: `/uploads/placeholder-env-${env.name.toLowerCase().replace(/\s+/g, "-")}.jpg`,
        storyId: lastEmber.id,
        authorId: superAdmin.id,
      },
    })
  }

  // ── STORYBOARD SCENES ──────────────────────────────────────────────────────
  const storyboardScenes = [
    { title: "Kira discovers the Ember", description: "Kira and Lian descend into the temple ruins. The camera follows them down narrow stairs. Close-up on Kira's face as she sees the flame for the first time — wonder, fear, hope.", sceneNumber: 1, chapterTitle: "The Discovery" },
    { title: "The Council Meeting", description: "Kira stands before the Council, holding the brazier. The elders' faces are illuminated by the flame — some in wonder, others in suspicion. Wide shot captures the tension in the room.", sceneNumber: 2, chapterTitle: "The Council" },
    { title: "The Shadow Guild Raid", description: "Night raid on the village. Quick cuts of figures moving through shadows, breaking glass, screaming. Kira grabs the Ember and flees with Lian through back alleys.", sceneNumber: 3, chapterTitle: "The Shadow Guild" },
    { title: "Crossing the Grey Wastes", description: "Wide shot of two tiny figures crossing an endless grey landscape. Time-lapse of day turning to night. They huddle together for warmth as the temperature drops.", sceneNumber: 4, chapterTitle: "The Grey Wastes" },
    { title: "Confronting the Guardian", description: "Kira approaches the massive stone Guardian, holding the Ember before her. The Guardian kneels. Low angle shot emphasizes its size. The passage opens behind it.", sceneNumber: 5, chapterTitle: "The Guardian" },
  ]

  for (const scene of storyboardScenes) {
    await prisma.storyboardScene.create({
      data: {
        title: scene.title,
        description: scene.description,
        sceneNumber: scene.sceneNumber,
        chapterTitle: scene.chapterTitle,
        chapterNumber: scene.sceneNumber,
        imageUrl: `/uploads/placeholder-storyboard-ember-${scene.sceneNumber}.jpg`,
        storyId: lastEmber.id,
        authorId: superAdmin.id,
      },
    })
  }

  // ── NOTIFICATIONS ──────────────────────────────────────────────────────────
  await prisma.notification.create({
    data: {
      type: "FOLLOW",
      message: "Test Reader started following you!",
      link: "/reader",
      userId: superAdmin.id,
      actorId: reader.id,
    },
  })
  await prisma.notification.create({
    data: {
      type: "COMMENT",
      message: "BookishCritic commented on your story 'The Last Ember'",
      link: "/stories/" + lastEmber.id,
      userId: superAdmin.id,
      actorId: critic.id,
    },
  })
  await prisma.notification.create({
    data: {
      type: "FOLLOW",
      message: "StoryFanatic99 started following you!",
      link: "/reader",
      userId: premium.id,
      actorId: fan.id,
    },
  })

  // ── MESSAGES ───────────────────────────────────────────────────────────────
  await prisma.message.create({
    data: {
      subject: "Love your story!",
      content: "Hey! I just finished reading 'The Last Ember' and I'm absolutely blown away. The world-building is incredible. Would you ever consider writing a sequel?",
      senderId: reader.id,
      receiverId: superAdmin.id,
      read: false,
    },
  })
  await prisma.message.create({
    data: {
      subject: "Editorial opportunity",
      content: "Dear Author, I represent Starlight Publishing, and we're looking for new voices in fantasy fiction. We were impressed by your work and would like to discuss a potential collaboration. Please let me know if you're interested.\n\nBest regards,\nBookishCritic\nAcquisitions Editor, Starlight Publishing",
      senderId: critic.id,
      receiverId: author.id,
      read: false,
    },
  })

  // ── READING STATS ──────────────────────────────────────────────────────────
  const today = new Date()
  for (let d = 0; d < 30; d++) {
    const date = new Date(today)
    date.setDate(date.getDate() - d)
    const viewsPerDay = Math.floor(Math.random() * 8) + 1
    for (let v = 0; v < viewsPerDay; v++) {
      await prisma.storyView.create({
        data: {
          storyId: lastEmber.id,
          createdAt: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000),
        },
      })
    }
  }

  // ── OUTPUT ─────────────────────────────────────────────────────────────────
  console.log("=== COMPREHENSIVE SEED COMPLETE ===")
  console.log(`  Users: ${Object.keys(users).length}`)
  console.log(`  Stories: 3 (The Last Ember, Whispers in the Wind, Stars Beyond the Horizon)`)
  console.log(`  Chapters: ${30 + 1 + 10} total`)
  console.log(`  Characters: ${characters.length} for The Last Ember`)
  console.log(`  Comments: ${comments.length + 1}`)
  console.log(`  Reactions: ${chapterIds.length * 3}`)
  console.log(`  Follows: 6`)
  console.log(`  Saves: 3`)
  console.log(`  World Entries: ${worldEntries.length}`)
  console.log(`  Environments: ${environments.length}`)
  console.log(`  Storyboard Scenes: ${storyboardScenes.length}`)
  console.log(`  AI Generations: ${characters.length + coverStyles.length}`)
  console.log(`  Story Views: ${await prisma.storyView.count()}`)
  console.log("")
  console.log("Test accounts:")
  console.log("  admin@likhaverse.com / Admin123! (SUPER_ADMIN — has \"The Last Ember\"")
  console.log("  author@likhaverse.com / Author123! (AUTHOR — has draft story)")
  console.log("  premium@likhaverse.com / Creator123! (PREMIUM_CREATOR — has ongoing story)")
  console.log("  reader@likhaverse.com / Reader123! (READER)")
  console.log("  critic@likhaverse.com / Critic123! (READER)")
  console.log("  fan@likhaverse.com / Fan123! (READER)")
  console.log("  writer2@likhaverse.com / Writer123! (AUTHOR)")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
