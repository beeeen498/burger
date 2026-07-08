"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isSecretMenuActive } from "@/lib/secretMenuUtils";
import Link from "next/link";
import styles from "./SecretMenuBanner.module.scss";

export default function SecretMenuBanner() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  // ── Check if secret menu is unlocked, re-check on navigation ──
  useEffect(() => {
    setShow(isSecretMenuActive());

    const handleExpired = () => setShow(false);
    window.addEventListener("secretMenuExpired", handleExpired);

    const interval = setInterval(() => {
      if (!isSecretMenuActive()) setShow(false);
    }, 30000);

    return () => {
      window.removeEventListener("secretMenuExpired", handleExpired);
      clearInterval(interval);
    };
  }, [pathname]);

  if (!show) return null;

  return (
    <Link href="/secret-menu" className={styles.banner}>
      <span className={styles.lock}>🔓</span>
      <span className={styles.text}>You have access to the Secret Menu</span>
      <span className={styles.arrow}>→</span>
    </Link>
  );
}