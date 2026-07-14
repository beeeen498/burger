"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FaRegClipboard } from "react-icons/fa";
import styles from "./CodeReveal.module.scss";

// ── Ransom note fonts — loaded via @import in SCSS ────
const RANSOM_FONTS = [
  "'Courier Prime', monospace",
  "'Permanent Marker', cursive",
  "'Playfair Display', serif",
  "'Bangers', cursive",
  "'Caveat', cursive",
];

// ── Ransom note background colors ─────────────────────
const RANSOM_COLORS = [
  "var(--yellow)",
  "var(--pink)",
  "var(--blue)",
  "var(--white)",
  "var(--green)",
];

interface CodeRevealProps {
  show: boolean;
}

export default function CodeReveal({ show }: CodeRevealProps) {
  const [copied, setCopied] = useState(false);
  const [secretCode, setSecretCode] = useState<string | null>(null);

  // -- Fetch secret password from Supabase --
  useEffect(() => {
    async function fetchCode() {
      const { data } = await supabase
        .from("restaurant_settings")
        .select("secret_menu_password")
        .single();

      setSecretCode(data?.secret_menu_password ?? null);
    }
    fetchCode();
  }, []);

  // ── Generate random styles once per letter ──────────
  const letterStyles = useMemo(() => {
    if (!secretCode) return [];
    return secretCode.split("").map(() => ({
      fontFamily: RANSOM_FONTS[Math.floor(Math.random() * RANSOM_FONTS.length)],
      fontSize: `${Math.random() * 12 + 20}px`,
      transform: `rotate(${Math.random() * 16 - 8}deg)`,
      backgroundColor:
        RANSOM_COLORS[Math.floor(Math.random() * RANSOM_COLORS.length)],
    }));
  }, [secretCode]);

  // ── Copy to clipboard ──────────────────────────────
  const handleCopy = () => {
    if (!secretCode) return;
    navigator.clipboard.writeText(secretCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!show || !secretCode) return null;

  return (
    <div className={styles.card}>
      {/* ── Ransom note code ── */}
      <div className={styles.codeRow}>
        <div className={styles.ransomCode}>
          {secretCode.split("").map((letter, i) => (
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
  );
}
