'use client'

import Link from "next/link";
import Cta from "@/components/global/Cta/Cta";
import styles from "./FeaturedItems.module.scss";

const FeaturedItems = () => {
  return (
    <section className={styles.featuredItems}>
        {/* cards */}
        <div className={styles.cardsGrid}>
            <Link href="/menu/303" className={styles.card}>
                Card 1
            </Link>
            <Link href="/menu/202" className={styles.card}>
                Card 2
            </Link>
            <Link href="/menu/404" className={styles.card}>
                Card 3
            </Link>
        </div>

        {/* cta */}
        <div className={styles.cta}>
            <Cta label="View the lineup" href="/menu"></Cta>
        </div>
    </section>
  )
}

export default FeaturedItems