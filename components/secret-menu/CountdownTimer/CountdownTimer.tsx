"use client"

import { useEffect, useState } from "react"
import styles from "./CountdownTimer.module.scss"

// ── localStorage key ──────────────────────────────────
const LS_UNLOCK_TIME = "secretMenu_unlockedAt"

// ── 24 hours in milliseconds ──────────────────────────
const ACCESS_DURATION = 24 * 60 * 60 * 1000

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    // ── Read unlock timestamp ──
    const unlockedAt = localStorage.getItem(LS_UNLOCK_TIME)
    if (!unlockedAt) {
      setExpired(true)
      return
    }

    // ── Calculate remaining time ──
    const expiresAt = new Date(unlockedAt).getTime() + ACCESS_DURATION

    const tick = () => {
      const remaining = expiresAt - Date.now()

      if (remaining <= 0) {
        setTimeLeft(0)
        setExpired(true)
        return
      }

      setTimeLeft(remaining)
    }

    // ── Run immediately, then every second ──
    tick()
    const interval = setInterval(tick, 1000)

    return () => clearInterval(interval)
  }, [])

  // ── Format milliseconds to HH:MM:SS ────────────────
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(seconds).padStart(2, "0"),
    ].join(":")
  }

  // ── Expired state ──
  if (expired) {
    return (
      <div className={`${styles.timer} ${styles.expired}`}>
        <p className={styles.expiredMsg}>
          Your access has expired 🔒 — you know what to do
        </p>
      </div>
    )
  }

  // ── Loading state ──
  if (timeLeft === null) return null

  return (
    <div className={styles.timer}>
      <span className={styles.label}>Access expires in</span>
      <span className={styles.countdown}>{formatTime(timeLeft)}</span>
    </div>
  )
}