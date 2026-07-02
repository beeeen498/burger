"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./SecretMenuBanner.module.scss";

// ── localStorage key ──────────────────────────────────
const LS_SECRET_UNLOCKED = "secretMenu_unlocked";

export default function SecretMenuBanner() {
  const [show, setShow] = useState(false);

  // ── Only show if secret menu is unlocked ──
  useEffect(() => {
    // ── Check on mount ──
    const checkUnlocked = () => {
      const unlocked = localStorage.getItem(LS_SECRET_UNLOCKED) === "yes";
      if (unlocked) setShow(true);
    };

    checkUnlocked();

    // ── Re-check when user returns to this tab ──
    const handleVisibility = () => {
      if (document.visibilityState === "visible") checkUnlocked();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  if (!show) return null;

  return (
    <Link href="/secret-menu" className={styles.banner}>
      <span className={styles.lock}>🔓</span>
      <span className={styles.text}>You have access to the Secret Menu</span>
      <span className={styles.arrow}>→</span>
    </Link>
  );
}
