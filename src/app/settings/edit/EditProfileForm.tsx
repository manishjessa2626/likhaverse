"use client"

import { useState, useRef } from "react"
import { updateProfile } from "@/app/actions/profile"

const roleOptions = [
  { value: "READER", label: "Reader", desc: "Read and discover stories" },
  { value: "AUTHOR", label: "Author", desc: "Write and publish your stories" },
  { value: "CREATOR", label: "Creator", desc: "Both read and write" },
] as const

type Props = {
  initial: {
    id: string
    name: string | null
    bio: string | null
    avatar: string | null
    role: string
  }
}

const popInKeyframes = `
@keyframes popIn {
  0% { opacity: 0; transform: scale(0); }
  100% { opacity: 1; transform: scale(1); }
}
`

export function EditProfileForm({ initial }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(initial.name ?? "")
  const [bio, setBio] = useState(initial.bio ?? "")
  const [avatar, setAvatar] = useState(initial.avatar ?? "")
  const [role, setRole] = useState(initial.role)
  const [previewUrl, setPreviewUrl] = useState(initial.avatar ?? "")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setPreviewUrl(dataUrl)
      setAvatar(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setMessage("")
    setSaving(true)
    const form = new FormData()
    form.set("name", name)
    form.set("bio", bio)
    form.set("avatar", avatar)
    form.set("role", role)
    const result = await updateProfile(null, form)
    if (result?.error) setError(result.error)
    else setMessage(result?.message ?? "Saved!")
    setSaving(false)
  }

  return (
    <>
      <style>{popInKeyframes}</style>
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-black px-5">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-violet-900/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-amber-900/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">Edit Profile</h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Customize your LikhaVerse identity
          </p>
        </div>

        <div
          className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-2xl"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 20px 60px -20px rgba(0,0,0,0.8)" }}
        >
          <div className="px-6 py-6">
            {error && (
              <div className="mb-5 rounded-xl bg-red-500/10 px-4 py-2.5 text-center text-sm text-red-400 ring-1 ring-red-500/20">
                {error}
              </div>
            )}
            {message && (
              <div className="mb-5 rounded-xl bg-green-500/10 px-4 py-2.5 text-center text-sm text-green-400 ring-1 ring-green-500/20">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-600 to-amber-600 text-2xl font-bold text-white ring-2 ring-white/[0.08]">
                    {previewUrl ? (
                      <img src={previewUrl} alt="" className="h-full w-full object-cover transition-opacity duration-200" />
                    ) : (
                      (name?.charAt(0) ?? "?").toUpperCase()
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-300 ring-2 ring-black transition-all duration-150 hover:bg-zinc-700 active:scale-90"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.161a47.474 47.474 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
                <p className="text-[11px] text-zinc-600">PNG, JPG up to 2MB</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your display name"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-white/[0.2] focus:bg-white/[0.06] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Tell the world about yourself..."
                  className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-white/[0.2] focus:bg-white/[0.06] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">I am a...</label>
                <div className="grid grid-cols-3 gap-2">
                  {roleOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRole(opt.value)}
                      className={`rounded-xl border px-3 py-2.5 text-center text-xs transition-all duration-150 active:scale-95 ${
                        role === opt.value
                          ? "scale-[1.03] border-violet-500/50 bg-violet-500/10 text-violet-300 shadow-lg shadow-violet-500/5"
                          : "border-white/[0.06] bg-white/[0.02] text-zinc-500 hover:scale-[1.02] hover:border-white/[0.12] hover:text-zinc-300"
                      }`}
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        <span className="block font-medium">{opt.label}</span>
                        {role === opt.value && (
                          <svg className="h-3.5 w-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ animation: "popIn 150ms ease-out" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </span>
                      <span className="mt-0.5 block text-[10px] leading-tight opacity-70">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition-all duration-150 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50 disabled:scale-100 disabled:hover:scale-100"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
                    Saving...
                  </span>
                ) : "Save Profile"}
              </button>
            </form>
          </div>
        </div>

        <p className="mt-4 text-center">
          <a href="/profile" className="text-xs text-zinc-600 hover:text-zinc-400">
            Back to Profile
          </a>
        </p>
      </div>
      </div>
    </>
  )
}
