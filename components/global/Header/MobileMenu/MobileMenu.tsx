"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FaUser } from "react-icons/fa";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { HiX } from "react-icons/hi";
import { isSecretMenuActive } from "@/lib/secretMenuUtils";
import Link from "next/link";
import styles from "./MobileMenu.module.scss";

// ── localStorage key ──────────────────────────────────
const LS_SECRET_UNLOCKED = "secretMenu_unlocked";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const links = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/build", label: "Build a Burger" },
  { href: "/challenge", label: "Challenge" },
  { href: "/#contact", label: "Contact" },
];

const MobileMenu = ({ open, onClose }: MobileMenuProps) => {
  const pathname = usePathname();
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    setShowSecret(isSecretMenuActive());

    const handleExpired = () => setShowSecret(false);
    window.addEventListener("secretMenuExpired", handleExpired);

    const interval = setInterval(() => {
      if (!isSecretMenuActive()) setShowSecret(false);
    }, 30000);

    return () => {
      window.removeEventListener("secretMenuExpired", handleExpired);
      clearInterval(interval);
    };
  }, [pathname]);

  return (
    <div className={`${styles.overlay} ${open ? styles.open : ""}`}>
      {/* ── Top bar: close button + icons ── */}
      <div className={styles.topBar}>
        <div className={styles.topIcons}>
          <HiOutlineShoppingBag size={24} />
          <FaUser size={22} />
        </div>

        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close menu"
        >
          <HiX size={28} />
        </button>
      </div>

      {/* ── Navigation links ── */}
      <nav className={styles.linkList}>
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={`${styles.navListItem} ${pathname === href ? styles.active : ""}`}
          >
            {label}
          </Link>
        ))}

        {/* ── Secret menu — only visible when unlocked ── */}
        {showSecret && (
          <Link
            href="/secret-menu"
            onClick={onClose}
            className={`${styles.navListItem} ${styles.secretLink} ${pathname === "/secret-menu" ? styles.active : ""}`}
          >
            🔒 Secret Menu
          </Link>
        )}
      </nav>
    </div>
  );
};

export default MobileMenu;
