"use client";

import { useEffect, useRef, useState } from "react";
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

  // ── Total number of items in the cart ──
  // Adds up all quantities, not just unique items
  // e.g. 2 burgers + 3 fries = 5
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setVisible(false);
    scrolledIn.current = false;

    const handleScroll = () => {
      scrolledIn.current = true;
      setVisible(window.scrollY > 130);
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

  // adjust the height
  useEffect(() => {
    const el = document.querySelector("header");
    if (!el) return;
    document.documentElement.style.setProperty(
      "--header-height",
      `${el.offsetHeight}px`,
    );
  }, []);

  // glitch effect on logo — same as Header.tsx
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

  // lock body scroll while mobile menu is open
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
        {/* logo */}
        <Link href="/" className={styles.logoLink}>
          <h2 ref={logoRef} className={styles.logo} data-text="Smash'd">
            Smash'd
          </h2>
        </Link>

        {/* nav — hidden on mobile via CSS */}
        <div className={styles.navWrapper}>
          <Nav />
        </div>

        {/* icons */}
        <div className={styles.icons}>
          <button
            className={styles.bagBtn}
            onClick={toggleCart}
            aria-label="Open cart"
          >
            <HiOutlineShoppingBag size={23} />

            {/* ── Count badge — only shows when there are items ── */}
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </button>
          <FaUser size={20} />

          {/* burger toggle — mobile only via CSS */}
          <button
            className={styles.menuToggle}
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <HiOutlineMenu size={24} />
          </button>
        </div>
      </div>

      {/* portal so it always escapes any stacking context above */}
      {mounted &&
        createPortal(
          <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />,
          document.body,
        )}
    </header>
  );
};

export default StickyHeader;
