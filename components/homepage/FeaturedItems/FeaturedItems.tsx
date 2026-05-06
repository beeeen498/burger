'use client'

import { useRef, useEffect } from "react";
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
    const gridRef = useRef<HTMLDivElement>(null)

    // tilt & shadow effect to the mouse on hover
    useEffect(() => {
        const grid = gridRef.current
        if (!grid) return

        const handleMouseMove = (e: MouseEvent) => {
            const card = (e.target as HTMLElement).closest(`.${styles.card}`) as HTMLElement
            if (!card) return

            const rect = card.getBoundingClientRect()
            const x = (e.clientX - rect.left) / rect.width
            const y = (e.clientY - rect.top) / rect.height

            const normalX = x * 2 - 1
            const normalY = y * 2 - 1

            // tilt
            card.style.transform = `perspective(800px) rotateX(${-normalY * 5}deg) rotateY(${normalX * 5}deg)`
            card.style.transition = 'transform 0.1s ease, box-shadow 200ms ease'

            // dynamic shadow — follows opposite of tilt direction
            const shadowX = normalX * 8
            const shadowY = normalY * 8
            const shadowBlur = Math.abs(normalX) * 6 + Math.abs(normalY) * 6
            card.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease'
            card.style.boxShadow = `${shadowX}px ${shadowY}px 0px rgba(26,26,26,1)`
        }

        const cards = grid.querySelectorAll('a')
        const handleMouseLeave = (e: Event) => {
            const card = e.currentTarget as HTMLElement
            card.style.transform = ''
            card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease'
            card.style.boxShadow = '0px 8px 24px rgba(26, 26, 26, 0.4)'
        }

        grid.addEventListener('mousemove', handleMouseMove)
        cards.forEach(card => card.addEventListener('mouseleave', handleMouseLeave))

        return () => {
            grid.removeEventListener('mousemove', handleMouseMove)
            cards.forEach(card => card.removeEventListener('mouseleave', handleMouseLeave))
        }
    }, [])

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
            <div className={styles.cardsGrid} ref={gridRef}>
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