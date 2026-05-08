'use client'

import Link from "next/link"
import styles from "./Cta.module.scss"

interface CtaProps {
  label: string
  variant?: "pink" | "yellow"
  href?: string
  onClick?: () => void
}

const Cta = ({ label, href, onClick, variant = "pink" }: CtaProps) => {
  if (href) {
    return (
      <Link href={href} className={`${styles.cta} ${styles[variant]}`}>
        {label}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={`${styles.cta} ${styles[variant]}`}>
      {label}
    </button>
  )
}

export default Cta