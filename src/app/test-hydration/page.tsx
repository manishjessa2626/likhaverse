"use client"

import { useEffect, useState, useRef } from "react"
import { PremiumReaderLayout } from "@/components/reader/PremiumReaderLayout"
import { ChapterHeader } from "@/components/reader/ChapterHeader"
import { ReaderContent } from "@/components/reader/ReaderContent"
import { ReaderAmbience } from "@/components/reader/ReaderAmbience"
import { ReaderCompanion } from "@/components/reader/ReaderCompanion"

const MOCK_CONTENT = `The forest that had once been vibrant with life was now silent.

Maya walked through the dying trees, her bare feet pressing into soil that had turned gray and lifeless. The diwata — the forest spirits her grandmother had told her stories about — were disappearing one by one.

"Lola used to say the forest sang," Maya whispered to herself. "Now it barely breathes."

She found the ancient balete tree, its branches reaching toward the sky like the gnarled fingers of a sleeping giant. And there, barely visible, was a faint glow — the last diwata.

"It is good you came," the spirit said, its voice like wind through dry leaves. "I do not have much time."

Maya knelt, tears streaming down her face. "How do I save you?"

"The answer lies in the heart of the Sierra Madre. But the journey is dangerous, little one."

"I'm not afraid," Maya said, though her voice shook.

The diwata smiled, a fleeting glimmer of warmth. "Then let us begin."`

const MOCK_CHARACTERS = [
  {
    id: "1",
    name: "Maya",
    age: "13",
    gender: "Female",
    personality: "Curious, brave, kind-hearted",
    appearance: "Small for her age, bright eyes, hair always in a messy braid",
    species: null,
    background: null,
    imageUrl: null,
  },
  {
    id: "2",
    name: "Diwata",
    age: "Ancient",
    gender: "Female",
    personality: "Wise, gentle, fading",
    appearance: "Glowing figure, translucent, surrounded by fireflies",
    species: null,
    background: null,
    imageUrl: null,
  },
]

function textNodesUnder(el: Node): Text[] {
  const texts: Text[] = []
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null)
  let node: Text | null
  while ((node = walker.nextNode() as Text | null)) texts.push(node)
  return texts
}

function DiagnoseHydration() {
  const logsRef = useRef<string[]>([])
  const [diagnostics, setDiagnostics] = useState<string[]>([])

  useEffect(() => {
    const addLog = (msg: string) => {
      logsRef.current.push(msg)
      setDiagnostics([...logsRef.current])
    }

    addLog("=== Hydration Diagnostic ===")
    addLog("User Agent: " + navigator.userAgent)
    addLog("URL: " + window.location.href)

    // Get all text nodes from the initial DOM (server-rendered)
    const startTime = Date.now()

    // Wait a small amount for React hydration to process
    const timer = setTimeout(() => {
      const elapsed = Date.now() - startTime
      addLog(`Time since mount: ${elapsed}ms`)

      // Check if the page seems broken (no visible text content)
      const bodyText = document.body?.innerText ?? ""
      addLog(`Body text length: ${bodyText.length}`)

      // Check for common problematic patterns
      const allElements = document.querySelectorAll("*")
      addLog(`Total DOM elements: ${allElements.length}`)

      // Check all text nodes for potential issues
      const allTexts = textNodesUnder(document.body)
      addLog(`Text nodes: ${allTexts.length}`)

      // Look for specific text content that could mismatch
      const problematicTexts = allTexts.filter((t) => {
        const text = t.textContent ?? ""
        return text.includes("2100") || text.includes("2,100") || text.includes("NaN") || text.includes("undefined") || text.includes("null")
      })
      if (problematicTexts.length > 0) {
        addLog(`Found potentially problematic text nodes: ${problematicTexts.length}`)
        problematicTexts.forEach((t, i) => {
          addLog(`  [${i}] parent: ${t.parentElement?.tagName ?? "?"} text: ${JSON.stringify(t.textContent)}`)
        })
      }

      // Check word count rendering
      const allText = bodyText
      addLog(`Contains "2100": ${allText.includes("2100")}`)
      addLog(`Contains "2,100": ${allText.includes("2,100")}`)

      // Check for 'toLocaleString' mismatches
      const wordCountEls: Element[] = []
      allElements.forEach((el) => {
        if (el.textContent?.includes("words") && /\d/.test(el.textContent ?? "")) {
          wordCountEls.push(el)
        }
      })
      addLog(`Elements containing "words" + number: ${wordCountEls.length}`)
      wordCountEls.forEach((el, i) => {
        addLog(`  [${i}] text: ${JSON.stringify(el.textContent)} html: ${JSON.stringify(el.innerHTML)}`)
      })

      addLog("=== Diagnostic complete ===")
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (diagnostics.length === 0) return null

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 99999,
      background: "#1a1a2e", color: "#e0e0e0", padding: 16, fontSize: 11,
      fontFamily: "monospace", maxHeight: "300px", overflowY: "auto",
      borderBottom: "2px solid #ff6b6b"
    }}>
      <h3 style={{ color: "#ff6b6b", margin: "0 0 8px" }}>Hydration Diagnostic</h3>
      {diagnostics.map((d, i) => (
        <div key={i} style={{ lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{d}</div>
      ))}
    </div>
  )
}

export default function TestHydrationPage() {
  return (
    <>
      <PremiumReaderLayout
        storyId="test-story"
        storyTitle="The Last Diwata"
        chapterId="test-chapter"
        initialSaved={false}
        content={MOCK_CONTENT}
        chapterNumber={1}
        totalChapters={3}
        chapterTitle="The Dying Forest"
        wordCount={2100}
        coverUrl={undefined}
        authorName="Maria Santos"
        tags="fantasy,drama,adventure"
        initialScroll={null}
      >
        <ChapterHeader
          storyTitle="The Last Diwata"
          chapterNumber={1}
          totalChapters={3}
          chapterTitle="The Dying Forest"
          wordCount={2100}
        />
        <div data-lv-text="true">
          <ReaderContent content={MOCK_CONTENT} />
        </div>
        <ReaderAmbience tags="fantasy,drama,adventure" />
        <ReaderCompanion
          characters={MOCK_CHARACTERS}
          worldEntries={[]}
          storyTitle="The Last Diwata"
        />
      </PremiumReaderLayout>
      <DiagnoseHydration />
    </>
  )
}
