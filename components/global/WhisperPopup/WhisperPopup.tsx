"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import styles from "./WhisperPopup.module.scss"

// ── Timing constants ──────────────────────────────────
const INITIAL_DELAY = 30000      // 30 seconds before first appearance
const RETRY_DELAY = 300000       // 5 minutes before reappearing after "Maybe later"
const MAX_DISMISSALS = 2         // max times "Maybe later" can be clicked

// ── localStorage keys ─────────────────────────────────
const LS_WHISPER_DONE = "secretMenu_whisperDone"
const LS_DISMISS_COUNT = "secretMenu_dismissCount"

// ── Pages where the whisper can appear ────────────────
const ALLOWED_PATHS = ["/menu", "/build"]

function isAllowedPage(pathname: string) {
  // matches /menu, /menu/some-slug, and /build
  return ALLOWED_PATHS.some(path => pathname === path || pathname.startsWith(path + "/"))
}

export default function WhisperPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // ── Check if user already accepted or dismissed max times ──
    const alreadyDone = localStorage.getItem(LS_WHISPER_DONE) === "yes"
    const dismissCount = parseInt(localStorage.getItem(LS_DISMISS_COUNT) || "0", 10)

    if (alreadyDone || dismissCount >= MAX_DISMISSALS) return

    // ── Show popup after delay, only if on an allowed page ──
    const timer = setTimeout(() => {
      if (isAllowedPage(pathname)) {
        setIsVisible(true)
      }
    }, INITIAL_DELAY)

    return () => clearTimeout(timer)
  }, [pathname])

  // ── Hide if user navigates away from allowed pages ──
  useEffect(() => {
    if (isVisible && !isAllowedPage(pathname)) {
      setIsVisible(false)
    }
  }, [pathname, isVisible])

  // ── "Yes 🤫" — save to localStorage, show the hint ──
  const handleYes = () => {
    localStorage.setItem(LS_WHISPER_DONE, "yes")
    setShowHint(true)
  }

  // ── "Got it" — dismiss everything ──
  const handleGotIt = () => {
    setIsVisible(false)
  }

  // ── "Maybe later" — increment dismiss count, retry if under max ──
  const handleMaybeLater = () => {
    const currentCount = parseInt(localStorage.getItem(LS_DISMISS_COUNT) || "0", 10)
    const newCount = currentCount + 1
    localStorage.setItem(LS_DISMISS_COUNT, String(newCount))
    setIsVisible(false)

    // ── Reappear after 5 minutes if under max dismissals ──
    if (newCount < MAX_DISMISSALS) {
      setTimeout(() => {
        if (isAllowedPage(pathname)) {
          setIsVisible(true)
        }
      }, RETRY_DELAY)
    }
  }

  if (!isVisible) return null

  return (
    <div className={styles.popup}>

      {/* ── Hint view — after clicking "Yes" ── */}
      {showHint ? (
        <>
          <p className={styles.message}>
            There&apos;s a burger on the homepage that hides a secret. Click on it 😉
          </p>
          <div className={styles.buttons}>
            <button className={styles.yesBtn} onClick={handleGotIt}>
              Got it 👍
            </button>
          </div>
        </>
      ) : (
        <>
          {/* ── Initial whisper view ── */}
          <p className={styles.message}>Psst... can you keep a secret? 👀</p>
          <div className={styles.buttons}>
            <button className={styles.yesBtn} onClick={handleYes}>
              Yes 🤫
            </button>
            <button className={styles.laterBtn} onClick={handleMaybeLater}>
              Maybe later
            </button>
          </div>
        </>
      )}

    </div>
  )
}