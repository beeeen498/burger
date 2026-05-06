'use client'

import Link from "next/link";
import Cta from "@/components/global/Cta/Cta";
import BurgerCanvas from "@/components/global/BurgerCanvas/BurgerCanvas";
import styles from "./FeaturedItems.module.scss";

// Items ordered 303, 202, 404 intentionally —
// 404 is last so nth-child CSS makes it the tall hero card on the right
const FEATURED_ITEMS = [
    {
        id: "303",
        name: "303",
        price: "$16.99",
        href: "/menu/303",
        ingredients: {
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
        <div className={styles.container}>
            {/* heading */}
            <svg
                className={styles.heading}
                viewBox="0 0 1000 120"
                width="100%"
                aria-hidden="true"
            >
                <text
                    x="50%"
                    y="80%"
                    textAnchor="middle"
                    fontFamily="var(--header-font)"
                    fontSize="120"
                    className={styles.headingText}
                >
                    THE LINEUP
                </text>
            </svg>

            {/* cards */}
            <div className={styles.cardsGrid}>
                {FEATURED_ITEMS.map((item) => (
                    <Link
                        key={item.id}
                        href={item.href}
                        className={styles.card}
                        aria-label={`View the ${item.name} burger — ${item.price}`}
                    >
                        <BurgerCanvas ingredients={item.ingredients} />
                        <span className={styles.cardName}>{item.name}</span>
                        <span className={styles.cardPrice}>{item.price}</span>
                    </Link>
                ))}
            </div>

            {/* cta */}
            <div className={styles.cta}>
                <Cta variant="yellow" label="View the lineup" href="/menu" />
            </div>
        </div>        
    </section>
  )
}

export default FeaturedItems