"use client"

import { useMemo, useState } from "react"
import { FaRegClipboard } from "react-icons/fa";
import styles from "./CodeReveal.module.scss"

// ── Ransom note fonts — loaded via @import in SCSS ────
const RANSOM_FONTS = [
  "'Courier Prime', monospace",
  "'Permanent Marker', cursive",
  "'Playfair Display', serif",
  "'Bangers', cursive",
  "'Caveat', cursive",
]

// ── Ransom note background colors ─────────────────────
const RANSOM_COLORS = ["var(--yellow)", "var(--pink)", "var(--blue)", "var(--white)", "var(--green)"]

// ── Hardcoded for now — will come from Supabase later ──
const SECRET_CODE = "SMASH"

interface CodeRevealProps {
  show: boolean
}

export default function CodeReveal({ show }: CodeRevealProps) {
  const [copied, setCopied] = useState(false)

  // ── Generate random styles once per letter ──────────
  const letterStyles = useMemo(() => {
    return SECRET_CODE.split("").map(() => ({
      fontFamily: RANSOM_FONTS[Math.floor(Math.random() * RANSOM_FONTS.length)],
      fontSize: `${Math.random() * 12 + 20}px`,                   // 20–32px
      transform: `rotate(${Math.random() * 16 - 8}deg)`,          // -8 to +8 degrees
      backgroundColor: RANSOM_COLORS[Math.floor(Math.random() * RANSOM_COLORS.length)],
    }))
  }, [])

  // ── Copy to clipboard ──────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(SECRET_CODE)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!show) return null

  return (
    <div className={styles.card}>

      {/* ── Ransom note code ── */}
      <div className={styles.codeRow}>
        <div className={styles.ransomCode}>
          {SECRET_CODE.split("").map((letter, i) => (
            <span key={i} style={letterStyles[i]}>
              {letter}
            </span>
          ))}
        </div>

        {/* ── Copy button ── */}
        <button className={styles.copyBtn} onClick={handleCopy}>
          {copied ? "Copied! 🤫" : <FaRegClipboard />}
        </button>
      </div>

      {/* ── Hint message ── */}
      <p className={styles.hint}>
        I&apos;ll see you at the 🔒 — keep an eye on the menu 😉
      </p>

    </div>
  )
}