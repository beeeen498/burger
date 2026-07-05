"use client";

import { useEffect, useState } from "react";
import styles from "./CountdownTimer.module.scss";

// ── localStorage key ──────────────────────────────────
const LS_UNLOCK_TIME = "secretMenu_unlockedAt";

// ── 24 hours in milliseconds ──────────────────────────
const ACCESS_DURATION = 24 * 60 * 60 * 1000;

// ── Props ─────────────────────────────────────────────
interface CountdownTimerProps {
  onExpire?: () => void;
}

export default function CountdownTimer({ onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    // ── Read unlock timestamp ──
    const unlockedAt = localStorage.getItem(LS_UNLOCK_TIME);
    if (!unlockedAt) {
      setExpired(true);
      onExpire?.();
      return;
    }

    // ── Calculate remaining time ──
    const expiresAt = new Date(unlockedAt).getTime() + ACCESS_DURATION;

    const tick = () => {
      const remaining = expiresAt - Date.now();

      if (remaining <= 0) {
        setTimeLeft(0);
        setExpired(true);
        onExpire?.();
        clearInterval(interval); // ← stop ticking after expiry
        return;
      }

      setTimeLeft(remaining);
    };

    // ── Run immediately, then every second ──
    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [onExpire]);

  // ── Format milliseconds to HH:MM:SS ────────────────
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(seconds).padStart(2, "0"),
    ].join(":");
  };

  // ── Expired state — hidden, page handles the message ──
  if (expired) return null;

  // ── Loading state ──
  if (timeLeft === null) return null;

  return (
    <div className={styles.timer}>
      <span className={styles.label}>Access expires in</span>
      <span className={styles.countdown}>{formatTime(timeLeft)}</span>
    </div>
  );
}
