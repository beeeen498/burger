'use client'

import Link from "next/link";
import styles from "./Nav.module.scss"

const Nav = () => {
  return (
    <nav className={styles.nav}>
        <ul className={styles.navList}>
            <li className={styles.navListItem}><Link href="/menu">Menu</Link></li>
            <li className={styles.navListItem}><Link href="/build">Build a Burger</Link></li>
            <li className={styles.navListItem}><Link href="/about">About</Link></li>
            <li className={styles.navListItem}><Link href="/contact">Contact</Link></li>
        </ul>
    </nav>
  )
}

export default Nav