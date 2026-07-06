'use client'

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

  // ── Total number of items in the cart ──
  // Adds up all quantities, not just unique items
  // e.g. 2 burgers + 3 fries = 5
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // glitch effect to the logo
  useEffect(() => {
    const triggerGlitch = () => {
      if (!logoRef.current) return;
      logoRef.current.classList.add(styles.glitch);
      setTimeout(() => {
        logoRef.current?.classList.remove(styles.glitch);
      }, 200);

      // next trigger in 4-8 seconds
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
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <header className={styles.header}>
        {/* ── Logo ── */}
        <Link href="/" className={styles.logoLink}>
            <h2 
              ref={logoRef} 
              className={styles.logo} 
              data-text="Smash'd"
            >
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
              className={styles.bagBtn}
              onClick={toggleCart}
              aria-label="Open cart"
            >
              <HiOutlineShoppingBag size={23} />

              {/* ── Count badge — only shows when there are items ── */}
              {itemCount > 0 && (
                <span className={styles.badge}>{itemCount}</span>
              )}
            </button>

            <FaUser size={20}/>

            {/* ── Burger toggle — mobile only via CSS ── */}
            <button
              className={styles.menuToggle}
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <HiOutlineMenu size={24} />
            </button>
        </div>

        {/* ── Mobile menu — rendered via portal so it sits above
            any ancestor's stacking context ── */}
        {mounted && createPortal(
          <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />,
          document.body
        )}
    </header>
  )
}

export default Header