'use client'

import Link from "next/link";
import Cta from "@/components/global/Cta/Cta";
import BurgerCanvas from "@/components/global/BurgerCanvas/BurgerCanvas";
import styles from "./FeaturedItems.module.scss";

const FEATURED_ITEMS = [
    {
        id: "303",
        name: "303",
        price: "$16.99",
        href: "/menu/303",
        ingredients: {
        sauce: "regular" as const,
        lettuce: 1,
        tomato: 1,
        pattyCount: 3,
        cheeseCount: 3,
        pickles: 1,
        onions: 1,
        }
    },
    {
        id: "202",
        name: "202",
        price: "$10.99",
        href: "/menu/202",
        ingredients: {
        sauce: "regular" as const,
        lettuce: 1,
        tomato: 1,
        pattyCount: 2,
        cheeseCount: 2,
        pickles: 1,
        onions: 1,
        }
    },
    {
        id: "404",
        name: "404",
        price: "$19.99",
        href: "/menu/404",
        ingredients: {
        sauce: "regular" as const,
        lettuce: 1,
        tomato: 1,
        pattyCount: 4,
        cheeseCount: 4,
        pickles: 1,
        onions: 1,
        }
    },
]

const FeaturedItems = () => {
  return (
    <section className={styles.featuredItems}>
        {/* heading */}
        <h2>the lineup</h2>

        {/* cards */}
        <div className={styles.cardsGrid}>
            {FEATURED_ITEMS.map((item) => (
                <Link key={item.id} href={item.href} className={styles.card}>
                    <BurgerCanvas ingredients={item.ingredients} />
                    <span className={styles.cardName}>{item.name}</span>
                    <span className={styles.cardPrice}>{item.price}</span>
                </Link>
            ))}
        </div>

        {/* cta */}
        <div className={styles.cta}>
            <Cta variant="yellow" label="View the lineup" href="/menu"></Cta>
        </div>
    </section>
  )
}

export default FeaturedItems