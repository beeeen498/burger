"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import BurgerCanvas from "@/components/global/BurgerCanvas/BurgerCanvas"
import { MenuItem } from "../MenuPage/MenuPage"
import styles from "./MenuCard.module.scss"

interface MenuCardProps {
  item: MenuItem
}

export default function MenuCard({ item }: MenuCardProps) {
  const router = useRouter()

  // ── Visibility state for lazy loading the 3D canvas ──
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLElement>(null)

  // ── Watch the card with IntersectionObserver ──
  // When the card enters the viewport, set isVisible to true
  // Once visible we never unload — no pop-in when scrolling back up
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect() // stop watching once visible
        }
      },
      { rootMargin: "100px" } // start loading 100px before it enters view
    )

    if (cardRef.current) observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [])

  // ── How many the user wants to add ──
  const [quantity, setQuantity] = useState(1)

  // ── e.stopPropagation() prevents the card click from firing ──
  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    setQuantity(prev => prev + 1)
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setQuantity(prev => Math.max(1, prev - 1))
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("add to cart", { item, quantity })
  }

  // ── Clicking the card navigates to the item detail page ──
  const handleCardClick = () => {
    if (!item.is_sold_out) {
      router.push(`/menu/${item.slug}`)
    }
  }

  return (
    <article
      ref={cardRef}
      className={`${styles.card} ${item.is_sold_out ? styles.soldOut : ""}`}
      onClick={handleCardClick}
    >

      {/* ── Badge ── */}
      {item.is_sold_out     && <span className={`${styles.badge} ${styles.isSoldOut}`}>Sold Out</span>}
      {item.is_chef_pick    && !item.is_sold_out && <span className={`${styles.badge} ${styles.chefPick}`}>Chef's Pick</span>}
      {item.is_most_popular && !item.is_sold_out && !item.is_chef_pick && <span className={`${styles.badge} ${styles.mostPopular}`}>Most Popular</span>}
      {item.is_new          && !item.is_sold_out && !item.is_chef_pick && !item.is_most_popular && <span className={`${styles.badge} ${styles.isNew}`}>New</span>}
      {item.is_vegan        && !item.is_sold_out && <span className={`${styles.badge} ${styles.isVegan}`}>Vegan</span>}
      {item.is_vegetarian   && !item.is_sold_out && !item.is_vegan && <span className={`${styles.badge} ${styles.isVegetarian}`}>Vegetarian</span>}

      {/* ── 3D model — only renders when card is in viewport ── */}
      <div className={styles.canvas}>
        {isVisible && item.ingredients && (
          <BurgerCanvas
            ingredients={item.ingredients}
            cameraOffset={14}
            scale={0.2}
          />
        )}
      </div>

      {/* ── Name, description, price ── */}
      <div className={styles.content}>
        <h3 className={styles.name}>{item.name}</h3>
        <p className={styles.description}>{item.description}</p>
        <span className={styles.price}>
          ${(item.price * quantity).toFixed(2)}
        </span>
      </div>

      {/* ── Quantity controls + add to cart ── */}
      <div className={styles.actions}>
        <div className={styles.quantity}>
          <button className={styles.qtyBtn} onClick={handleRemove}>−</button>
          <span className={styles.qtyNum}>{quantity}</span>
          <button className={styles.qtyBtn} onClick={handleAdd}>+</button>
        </div>
        <button className={styles.addBtn} onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>

    </article>
  )
}