'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaUser } from "react-icons/fa";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { HiX } from "react-icons/hi";
import styles from "./MobileMenu.module.scss";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const links = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/build", label: "Build a Burger" },
  { href: "/challenge", label: "Challenge" },
  { href: "/contact", label: "Contact" },
];

const MobileMenu = ({ open, onClose }: MobileMenuProps) => {
  const pathname = usePathname();

  return (
    <div className={`${styles.overlay} ${open ? styles.open : ''}`}>
      {/* top bar: close button + icons */}
      <div className={styles.topBar}>
        <div className={styles.topIcons}>
          <HiOutlineShoppingBag size={24} />
          <FaUser size={22} />
        </div>

        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close menu"
        >
          <HiX size={28} />
        </button>
      </div>

      {/* centered links */}
      <nav className={styles.linkList}>
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={`${styles.navListItem} ${pathname === href ? styles.active : ''}`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default MobileMenu;