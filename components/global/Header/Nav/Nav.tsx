'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Nav.module.scss"

const Nav = () => {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        <li className={`${styles.navListItem} ${pathname === '/menu' ? styles.active : ''}`}>
          <Link href="/menu">Menu</Link>
        </li>
        <li className={`${styles.navListItem} ${pathname === '/build' ? styles.active : ''}`}>
          <Link href="/build">Build a Burger</Link>
        </li>
        <li className={`${styles.navListItem} ${pathname === '/about' ? styles.active : ''}`}>
          <Link href="/about">About</Link>
        </li>
        <li className={`${styles.navListItem} ${pathname === '/contact' ? styles.active : ''}`}>
          <Link href="/contact">Contact</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Nav