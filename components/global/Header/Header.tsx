'use client'

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Nav from "./Nav/Nav";
import Link from "next/link";
import { FaUser } from "react-icons/fa";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { HiOutlineMenu } from "react-icons/hi";
import MobileMenu from "./MobileMenu/MobileMenu";

import styles from "./Header.module.scss";

const Header = () => {
  const logoRef = useRef<HTMLHeadingElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

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
        {/* logo */}
        <Link href="/" className={styles.logoLink}>
            <h2 
              ref={logoRef} 
              className={styles.logo} 
              data-text="Smash'd"
            >
              Smash'd
            </h2>
        </Link>

        {/* nav — hidden on mobile via CSS */}
        <div className={styles.navWrapper}>
          <Nav />
        </div>

        {/* icons */}
        <div className={styles.headerIcons}>
            <HiOutlineShoppingBag size={23}/>
            <FaUser size={20}/>

            {/* burger toggle — mobile only via CSS */}
            <button
              className={styles.menuToggle}
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <HiOutlineMenu size={24} />
            </button>
        </div>

        {/* rendered via portal at document.body so it always sits above
            any ancestor's stacking context (e.g. heroContainer / isolation) */}
        {mounted && createPortal(
          <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />,
          document.body
        )}
    </header>
  )
}

export default Header