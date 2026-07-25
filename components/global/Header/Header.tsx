"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import Nav from "./Nav/Nav";
import Link from "next/link";
import { FaUser } from "react-icons/fa";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { HiOutlineMenu } from "react-icons/hi";
import MobileMenu from "./MobileMenu/MobileMenu";
import useCartStore from "@/lib/useCartStore";

import styles from "./Header.module.scss";

const Header = () => {
  const logoRef = useRef<HTMLHeadingElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ── Cart store ──
  const { items, toggleCart } = useCartStore();
  const wobble = useCartStore((s) => s.wobble);
  const setWobble = useCartStore((s) => s.setWobble);

  // ── Total number of items in the cart ──
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // -- Check if user is logged in --
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  // ── Glitch effect on logo ──
  useEffect(() => {
    const triggerGlitch = () => {
      if (!logoRef.current) return;
      logoRef.current.classList.add(styles.glitch);
      setTimeout(() => {
        logoRef.current?.classList.remove(styles.glitch);
      }, 200);

      const next = 4000 + Math.random() * 4000;
      setTimeout(triggerGlitch, next);
    };

    const initial = 4000 + Math.random() * 4000;
    const timeout = setTimeout(triggerGlitch, initial);
    return () => clearTimeout(timeout);
  }, []);

  // ── Lock body scroll while mobile menu is open ──
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      {/* ── Logo ── */}
      <Link href="/" className={styles.logoLink}>
        <h2 ref={logoRef} className={styles.logo} data-text="Smash'd">
          Smash'd
        </h2>
      </Link>

      {/* ── Nav — hidden on mobile via CSS ── */}
      <div className={styles.navWrapper}>
        <Nav />
      </div>

      {/* ── Icons ── */}
      <div className={styles.headerIcons}>
        {/* ── Bag icon — opens the cart drawer ── */}
        <button
          className={`${styles.bagBtn} ${wobble ? styles.wobble : ""}`}
          onClick={toggleCart}
          onAnimationEnd={() => setWobble(false)}
          aria-label="Open cart"
          data-bag-icon
        >
          <HiOutlineShoppingBag size={23} />

          {/* ── Count badge — only shows when there are items ── */}
          {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
        </button>

        <Link href={isLoggedIn ? "/account" : "/account/login"}>
          <FaUser size={20} />
        </Link>

        {/* ── Burger toggle — mobile only via CSS ── */}
        <button
          className={styles.menuToggle}
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <HiOutlineMenu size={24} />
        </button>
      </div>

      {/* ── Mobile menu portal ── */}
      {mounted &&
        createPortal(
          <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />,
          document.body,
        )}
    </header>
  );
};

export default Header;
