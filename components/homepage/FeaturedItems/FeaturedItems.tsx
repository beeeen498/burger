'use client'

import Link from "next/link";
import Cta from "@/components/global/Cta/Cta";
import BurgerCanvas from "@/components/global/BurgerCanvas/BurgerCanvas";
import styles from "./FeaturedItems.module.scss";

const FeaturedItems = () => {
  return (
    <section className={styles.featuredItems}>
        {/* cards */}
        <div className={styles.cardsGrid}>
            {/* top left */}
            <Link href="/menu/303" className={styles.card}>
                <BurgerCanvas ingredients={{
                    sauce: true,
                    lettuce: true,
                    tomato: true,
                    pattyCount: 3,
                    cheeseCount: 3,
                    pickles: true,
                    onions: true,
                }} />
            </Link>

            {/* bottom left */}
            <Link href="/menu/202" className={styles.card}>
                <BurgerCanvas ingredients={{
                    sauce: true,
                    lettuce: true,
                    tomato: true,
                    pattyCount: 2,
                    cheeseCount: 2,
                    pickles: true,
                    onions: true,
                }} />
            </Link>

            {/* right */}
            <Link href="/menu/404" className={styles.card}>
                <BurgerCanvas ingredients={{
                    sauce: true,
                    lettuce: true,
                    tomato: true,
                    pattyCount: 4,
                    cheeseCount: 4,
                    pickles: true,
                    onions: true,
                }} />
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