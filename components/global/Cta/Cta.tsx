'use client'

import Link from "next/link"
import styles from "./Cta.module.scss"

const Cta = ({ label, href, variant = "pink" }: { 
  label: string
  href: string
  variant?: "pink" | "yellow"
}) => {
  return (
    <Link href={href} className={`${styles.cta} ${styles[variant]}`}>
      {label}
    </Link>
  )
}

export default Cta