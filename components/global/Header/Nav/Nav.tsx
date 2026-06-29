"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Nav.module.scss";

const Nav = () => {
  const pathname = usePathname();

  // when already on the homepage, scroll to top instead of doing nothing
  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // when already on the homepage, scroll to the contact section manually
  // (a hash link won't re-scroll if #contact is already in the URL)
  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      const contact = document.getElementById("contact");
      contact?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        {/* Home — scrolls to top if already on homepage */}
        <li
          className={`${styles.navListItem} ${pathname === "/" ? styles.active : ""}`}
        >
          <Link href="/" onClick={handleHomeClick}>
            Home
          </Link>
        </li>

        {/* Menu */}
        <li
          className={`${styles.navListItem} ${pathname === "/menu" ? styles.active : ""}`}
        >
          <Link href="/menu">Menu</Link>
        </li>

        {/* Build a Burger */}
        <li
          className={`${styles.navListItem} ${pathname === "/build" ? styles.active : ""}`}
        >
          <Link href="/build">Build a Burger</Link>
        </li>

        {/* Challenge */}
        <li
          className={`${styles.navListItem} ${pathname === "/challenge" ? styles.active : ""}`}
        >
          <Link href="/challenge">Challenge</Link>
        </li>

        {/* Contact — scrolls to section manually if already on homepage */}
        <li
          className={`${styles.navListItem} ${pathname === "/contact" ? styles.active : ""}`}
        >
          <Link href="/#contact" onClick={handleContactClick}>
            Contact
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;