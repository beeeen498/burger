'use client'

import { useEffect, useRef } from "react";
import Nav from "./Nav/Nav";
import Link from "next/link";
import { FaUser } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import styles from "./Header.module.scss";

const Header = () => {
  const logoRef = useRef<HTMLHeadingElement>(null);

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

        {/* nav */}
        <Nav />

        {/* login */}
        <div className={styles.headerIcons}>
            <FaShoppingCart size={20}/>
            <FaUser size={20}/>
        </div>
    </header>
  )
}

export default Header