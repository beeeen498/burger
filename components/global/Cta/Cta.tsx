'use client'

import Link from "next/link"
import styles from "./Cta.module.scss"

const Cta = ({ label, href }: { label: string; href: string }) => {
  return (
    <Link href={href} className={styles.cta}>
        {label}
    </Link>
  )
}

export default Cta