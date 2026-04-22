'use client'

import Nav from "./Nav/Nav";
import Link from "next/link";
import { FaUser } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import styles from "./Header.module.scss";

const Header = () => {
  return (
    <header className={styles.header}>
        {/* logo */}
        <Link href="/" className={styles.logoLink}>
            <h2 className={styles.logo}>Smash'd</h2>
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