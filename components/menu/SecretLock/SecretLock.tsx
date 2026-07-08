"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./SecretLock.module.scss";

// ── localStorage keys ─────────────────────────────────
const LS_BURGER_CLICKED = "secretMenu_burgerClicked";
const LS_SECRET_UNLOCKED = "secretMenu_unlocked";
const LS_UNLOCK_TIME = "secretMenu_unlockedAt";

// ── Hardcoded for now — will come from Supabase later ──
const SECRET_CODE = "SMASH";

export default function SecretLock() {
  const [show, setShow] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Notify other components ──
  window.dispatchEvent(new Event("secretMenuUnlocked"));

  // ── Only show if burger interaction is complete and not already unlocked ──
  useEffect(() => {
    const completed = localStorage.getItem(LS_BURGER_CLICKED) === "yes";
    const alreadyUnlocked = localStorage.getItem(LS_SECRET_UNLOCKED) === "yes";
    if (!completed || alreadyUnlocked) return;

    // ── Short delay so page loads first ──
    const timer = setTimeout(() => {
      setShow(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // ── Focus input when lock opens ──
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // ── Click the lock — expand into input ──
  const handleLockClick = () => {
    setIsOpen(true);
  };

  // ── Submit the code ──
  const handleSubmit = () => {
    if (code.toUpperCase().trim() === SECRET_CODE) {
      // ── Correct — save unlock time and show success ──
      localStorage.setItem(LS_SECRET_UNLOCKED, "yes");
      localStorage.setItem(LS_UNLOCK_TIME, new Date().toISOString());
      setUnlocked(true);
    } else {
      // ── Wrong — shake and clear ──
      setShake(true);
      setCode("");
      setTimeout(() => setShake(false), 500);
    }
  };

  // ── Handle enter key ──
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  if (!show) return null;

  return (
    <div
      className={`${styles.lock} ${isOpen ? styles.expanded : ""} ${shake ? styles.shake : ""} ${unlocked ? styles.unlocked : ""}`}
    >
      {/* ── Success state — unlocked with link ── */}
      {unlocked ? (
        <a href="/secret-menu" className={styles.successMsg}>
          🔓 Secret menu unlocked — tap to enter!
        </a>
      ) : !isOpen ? (
        /* ── Closed state — lock icon ── */
        <button
          className={styles.lockBtn}
          onClick={handleLockClick}
          aria-label="Secret menu"
        >
          🔒
        </button>
      ) : (
        /* ── Open state — input field ── */
        <div className={styles.inputRow}>
          <span className={styles.lockIcon}>🔒</span>
          <input
            ref={inputRef}
            className={styles.codeInput}
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter code..."
            maxLength={10}
          />
          <button className={styles.submitBtn} onClick={handleSubmit}>
            →
          </button>
        </div>
      )}
    </div>
  );
}
