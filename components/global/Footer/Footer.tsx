'use client'

import Link from "next/link"
import { FaInstagram, FaTiktok, FaXTwitter } from "react-icons/fa6"
import styles from "./Footer.module.scss"
import { log } from "console"

const NAV_LINKS = [
  { label: "Menu", href: "/menu" },
  { label: "Build a Burger", href: "/build" },
  { label: "Challenge", href: "/challenge" },
  { label: "Contact", href: "/contact" },
]

interface SocialLink {
  icon: React.ReactNode
  href: string
  label: string
}

const SOCIAL_LINKS: SocialLink[] = [
  { icon: <FaInstagram size={18} />, href: "#", label: "Instagram" },
  { icon: <FaTiktok size={18} />, href: "#", label: "TikTok" },
  { icon: <FaXTwitter size={18} />, href: "#", label: "X" },
]

const HOURS = [
  { day: "Mon – Thu", hours: "11:00 – 22:00" },
  { day: "Fri – Sat", hours: "11:00 – 23:00" },
  { day: "Sunday", hours: "12:00 – 21:00" },
]

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })
  const year = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>

      {/* watermark */}
      <span className={styles.watermark} aria-hidden="true">SMASH'D</span>

      <div className={styles.inner}>

        {/* left — brand */}
        <div className={styles.col}>
            <h2 className={styles.logo}>Smash'd</h2>
            <p className={styles.tagline}>Burgers since 1994</p>
            <div className={styles.socials}>
                {SOCIAL_LINKS.map(({ icon, href, label }) => {
                    return (
                    <a key={label} href={href} aria-label={label} className={styles.socialBtn}>
                        {icon}
                    </a>
                    )
                })}
            </div>
        </div>

        {/* center — info */}
        <div className={styles.col}>
          <h3 className={styles.colHeading}>Find Us</h3>
          <p className={styles.info}>123 Smash Street</p>
          <p className={styles.info}>Tel Aviv, Israel</p>
          <p className={styles.info}>+972 50 000 0000</p>
          <div className={styles.hours}>
            {HOURS.map(({ day, hours }) => (
              <div key={day} className={styles.hoursRow}>
                <span className={styles.day}>{day}</span>
                <span className={styles.time}>{hours}</span>
              </div>
            ))}
          </div>
        </div>

        {/* right — nav + back to top */}
        <div className={styles.col}>
          <h3 className={styles.colHeading}>Explore</h3>
          <nav>
            <ul className={styles.navList}>
              {NAV_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className={styles.navLink}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <button className={styles.backToTop} onClick={scrollToTop} aria-label="Back to top">
            🍔 Back to top
          </button>
        </div>

      </div>

      {/* credit line */}
      <div className={styles.credit}>
        <span>Created by Ben Kedem &copy;{year}</span>
      </div>

    </footer>
  )
}

export default Footer