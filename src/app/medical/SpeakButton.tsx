'use client'

import { useState, useEffect } from 'react'

/* Pronounce an English term with the browser's built-in speech synthesis (Web
   Speech API) — free, client-side, no network. Renders nothing where the API is
   unavailable. Option A of the audio plan; a pre-generated audio layer (Option
   B) can later override this for terms where TTS mispronounces. */

export default function SpeakButton({ text, className = '' }: { text: string; className?: string }) {
  const [supported, setSupported] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
    return () => { try { window.speechSynthesis?.cancel() } catch {} }
  }, [])

  function speak(e: React.MouseEvent) {
    // The button often sits inside a clickable card/link — don't trigger it.
    e.preventDefault()
    e.stopPropagation()
    if (!supported) return
    const synth = window.speechSynthesis
    synth.cancel()  // stop anything already playing
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = 0.9    // a touch slower — clearer on long clinical words
    u.onstart = () => setSpeaking(true)
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    synth.speak(u)
  }

  if (!supported) return null

  return (
    <button
      type="button"
      onClick={speak}
      aria-label={`Pronounce ${text}`}
      title="Pronounce"
      className={`b-press b-focus inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--b-border)] bg-[var(--b-panel)] p-2 hover:text-[var(--b-primary)] ${speaking ? 'text-[var(--b-primary)]' : 'text-[var(--b-dim)]'} ${className}`}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        {speaking && <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />}
      </svg>
    </button>
  )
}
