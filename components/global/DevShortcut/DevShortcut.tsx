"use client"

import { useEffect } from "react"

// ── localStorage keys to set ──────────────────────────
const LS_WHISPER_DONE = "secretMenu_whisperDone"
const LS_BURGER_CLICKED = "secretMenu_burgerClicked"

export default function DevShortcut() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ── Ctrl + Shift + K — skip to lock icon ──
      if (e.ctrlKey && e.shiftKey && e.key === "K") {
        e.preventDefault()
        localStorage.setItem(LS_WHISPER_DONE, "yes")
        localStorage.setItem(LS_BURGER_CLICKED, "yes")
        console.log("🔓 Dev shortcut activated — go to /menu to see the lock icon")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return null
}