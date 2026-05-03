'use client'

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaUser } from "react-icons/fa";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import Nav from "@/components/global/Header/Nav/Nav";
import styles from "./StickyHeader.module.scss";

const StickyHeader = () => {
  const [visible, setVisible] = useState(false);
  const logoRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 130)
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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

  return (
    <header className={`${styles.stickyHeader} ${visible ? styles.visible : ''}`}>
        <div className={styles.headerContent}>
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

            {/* nav */}
            <Nav />

            {/* icons */}
            <div className={styles.icons}>
                <HiOutlineShoppingBag size={23} />
                <FaUser size={20} />
            </div>
        </div>
    </header>
  );
};

export default StickyHeader;