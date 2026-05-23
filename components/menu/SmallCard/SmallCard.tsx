"use client"

import { useState } from "react"
import { MenuItem } from "../MenuPage/MenuPage"
import styles from "./SmallCard.module.scss"

interface SmallCardProps {
  item: MenuItem
}

export default function SmallCard({ item }: SmallCardProps) {

  // ── How many the user wants to add ──
  const [quantity, setQuantity] = useState(1)

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

  return (
    <article className={`${styles.card} ${item.is_sold_out ? styles.soldOut : ""}`}>

      {/* ── 3D model placeholder — will use model_path later ── */}
      <div className={styles.canvas} />

      {/* ── Name and price ── */}
      <div className={styles.content}>
        <h3 className={styles.name}>{item.name}</h3>
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