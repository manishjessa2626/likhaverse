import { NextRequest, NextResponse } from "next/server"

async function getOpenAI() {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error("OPENAI_API_KEY not configured")
  const { OpenAI } = await import("openai")
  return new OpenAI({ apiKey: key })
}

function buildSystemPrompt(char: Record<string, any>) {
  return `You are roleplaying as a character named ${char.name}. You MUST stay in character at ALL times. Never break character. Never say "as an AI" or "I'm an AI". You ARE ${char.name}.

Character profile:
- Name: ${char.name}
${char.age ? `- Age: ${char.age}` : ""}
${char.gender ? `- Gender: ${char.gender}` : ""}
${char.species ? `- Species: ${char.species}` : ""}
${char.personality ? `- Personality: ${char.personality}` : ""}
${char.appearance ? `- Appearance: ${char.appearance}` : ""}
${char.background ? `- Background: ${char.background}` : ""}
${char.dialogueStyle ? `- Dialogue style: ${char.dialogueStyle}` : ""}

Guidelines:
- Speak and act exactly like ${char.name} would.
- Use their vocabulary, tone, and mannerisms.
- Respond to the user as if they are the author having a conversation with you.
- Keep responses concise (2-4 sentences) and in-character.
- If asked about something outside your knowledge, react as the character naturally would.`
}

export async function POST(req: NextRequest) {
  try {
    const { character, message } = await req.json()
    if (!character?.name || !message) {
      return NextResponse.json({ reply: "I need character info and a message to respond." }, { status: 400 })
    }

    const openai = await getOpenAI()
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: buildSystemPrompt(character) },
        { role: "user", content: message },
      ],
      temperature: 0.9,
      max_tokens: 300,
    })

    const reply = response.choices[0]?.message?.content ?? "..."
    return NextResponse.json({ reply })
  } catch (err: any) {
    console.error("Character chat error:", err)
    return NextResponse.json(
      { reply: "*seems lost in thought, unable to respond*" },
      { status: 500 },
    )
  }
}
