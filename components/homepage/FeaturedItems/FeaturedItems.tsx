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
                    sauce: "regular",
                    lettuce: 1,
                    tomato: 1,
                    pattyCount: 3,
                    cheeseCount: 3,
                    pickles: 1,
                    onions: 1,
                    bacon: 3,
                }} />
            </Link>

            {/* bottom left */}
            <Link href="/menu/202" className={styles.card}>
                <BurgerCanvas ingredients={{
                    sauce: "regular",
                    lettuce: 1,
                    tomato: 1,
                    pattyCount: 2,
                    cheeseCount: 2,
                    pickles: 1,
                    bacon: 3,
                    onions: 1,
                }} />
            </Link>

            {/* right */}
            <Link href="/menu/404" className={styles.card}>
                <BurgerCanvas ingredients={{
                    sauce: "regular",
                    lettuce: 0,
                    tomato: 0,
                    pattyCount: 1,
                    cheeseCount: 1,
                    pickles: 0,
                    bacon: 1,
                    onions: 0,
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