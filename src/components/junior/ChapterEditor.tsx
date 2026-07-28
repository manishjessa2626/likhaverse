"use client"

import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight } from "lucide-react"

export interface Chapter {
  title: string
  content: string
}

interface ChapterEditorProps {
  chapters: Chapter[]
  onChange: (chapters: Chapter[]) => void
  fontSize: number
}

export function ChapterEditor({ chapters, onChange, fontSize }: ChapterEditorProps) {
  const addChapter = () => {
    onChange([...chapters, { title: `Chapter ${chapters.length + 1}`, content: "" }])
  }

  const removeChapter = (index: number) => {
    onChange(chapters.filter((_, i) => i !== index))
  }

  const updateChapter = (index: number, field: keyof Chapter, value: string) => {
    const updated = chapters.map((ch, i) => i === index ? { ...ch, [field]: value } : ch)
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
          Chapters ({chapters.length})
        </h3>
        <button
          onClick={addChapter}
          className="flex items-center gap-1 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-500"
        >
          <Plus size={14} />
          Add Chapter
        </button>
      </div>

      {chapters.length === 0 ? (
        <p className="rounded-xl bg-zinc-50 p-4 text-center text-xs text-zinc-400 dark:bg-zinc-800/50">
          Add chapters to organize your story
        </p>
      ) : (
        chapters.map((chapter, index) => (
          <div
            key={index}
            className="rounded-xl border border-purple-200/60 bg-white/70 p-3 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/70"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">#{index + 1}</span>
              <input
                type="text"
                value={chapter.title}
                onChange={(e) => updateChapter(index, "title", e.target.value)}
                placeholder="Chapter title"
                className="flex-1 border-0 bg-transparent text-sm font-medium text-zinc-800 placeholder:text-zinc-300 focus:outline-none dark:text-zinc-100"
              />
              <button
                onClick={() => removeChapter(index)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              value={chapter.content}
              onChange={(e) => updateChapter(index, "content", e.target.value)}
              placeholder="Write your chapter..."
              rows={6}
              style={{ fontSize: `${fontSize}px` }}
              className="w-full resize-y border-0 bg-transparent text-zinc-700 placeholder:text-zinc-300 focus:outline-none dark:text-zinc-300 leading-relaxed"
            />
          </div>
        ))
      )}
    </div>
  )
}
