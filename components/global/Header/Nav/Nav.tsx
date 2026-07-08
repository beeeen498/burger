"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isSecretMenuActive } from "@/lib/secretMenuUtils";
import styles from "./Nav.module.scss";

// ── localStorage key ──────────────────────────────────
const LS_SECRET_UNLOCKED = "secretMenu_unlocked";

const Nav = () => {
  const pathname = usePathname();
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    setShowSecret(isSecretMenuActive());

    const handleExpired = () => setShowSecret(false);
    window.addEventListener("secretMenuExpired", handleExpired);

    // ── Re-check every 30 seconds in case timer expired ──
    const interval = setInterval(() => {
      if (!isSecretMenuActive()) setShowSecret(false);
    }, 30000);

    return () => {
      window.removeEventListener("secretMenuExpired", handleExpired);
      clearInterval(interval);
    };
  }, [pathname]);

  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        <li
          className={`${styles.navListItem} ${pathname === "/" ? styles.active : ""}`}
        >
          <Link href="/">Home</Link>
        </li>
        <li
          className={`${styles.navListItem} ${pathname === "/menu" ? styles.active : ""}`}
        >
          <Link href="/menu">Menu</Link>
        </li>
        <li
          className={`${styles.navListItem} ${pathname === "/build" ? styles.active : ""}`}
        >
          <Link href="/build">Build a Burger</Link>
        </li>
        <li
          className={`${styles.navListItem} ${pathname === "/challenge" ? styles.active : ""}`}
        >
          <Link href="/challenge">Challenge</Link>
        </li>
        <li className={styles.navListItem}>
          <Link href="/#contact">Contact</Link>
        </li>

        {/* ── Secret menu — only visible when unlocked ── */}
        {showSecret && (
          <li
            className={`${styles.navListItem} ${styles.secretLink} ${pathname === "/secret-menu" ? styles.active : ""}`}
          >
            <Link href="/secret-menu">🔒 Secret Menu</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Nav;
