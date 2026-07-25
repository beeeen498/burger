"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { createPortal } from "react-dom";
import Link from "next/link";
import { FaUser } from "react-icons/fa";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { HiOutlineMenu } from "react-icons/hi";
import Nav from "@/components/global/Header/Nav/Nav";
import MobileMenu from "@/components/global/Header/MobileMenu/MobileMenu";
import styles from "./StickyHeader.module.scss";
import { usePathname } from "next/navigation";
import useCartStore from "@/lib/useCartStore";

const StickyHeader = () => {
  const [visible, setVisible] = useState(false);
  const scrolledIn = useRef(false);
  const logoRef = useRef<HTMLHeadingElement>(null);
  const pathname = usePathname();
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

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  // -- Hide on admin pages (admin has its own layout) --
  if (pathname.startsWith("/admin")) return null;

  // ── Scroll visibility logic ──
  useEffect(() => {
    setVisible(false);
    scrolledIn.current = false;

    const handleScroll = () => {
      scrolledIn.current = true;
      setVisible(window.scrollY > 99);
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (document.body.scrollHeight <= window.innerHeight) {
          setVisible(true);
          return;
        }
        if (window.scrollY > 130) setVisible(true);
        window.addEventListener("scroll", handleScroll, { passive: true });
      });
    });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // ── Set header height CSS variable ──
  useEffect(() => {
    const el = document.querySelector("header");
    if (!el) return;
    document.documentElement.style.setProperty(
      "--header-height",
      `${el.offsetHeight}px`,
    );
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
    <header
      className={`
      ${styles.stickyHeader} 
      ${visible ? styles.visible : ""} 
      ${scrolledIn.current ? styles.animated : ""}
    `}
    >
      <div className={styles.headerContent}>
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
        <div className={styles.icons}>
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

export default StickyHeader;
