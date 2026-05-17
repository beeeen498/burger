"use client"

import { MenuItem } from "../MenuPage/MenuPage"
import styles from "./MenuCard.module.scss"

interface MenuCardProps {
  item: MenuItem
}

export default function MenuCard({ item }: MenuCardProps) {
  return (
    <article className={`${styles.card} ${item.is_sold_out ? styles.soldOut : ""}`}>

        {/* 3D model placeholder for now */}
         <div className={styles.canvas} />
      
        {/* name, description, price */}
        <div className={styles.content}>
            <h3 className={styles.name}>{item.name}</h3>
            <p className={styles.description}>{item.description}</p>
            <span className={styles.price}>${item.price.toFixed(2)}</span>
        </div>

        {/* ── Badge — only one shows, priority order ── */}
        {item.is_sold_out     && <span className={`${styles.badge} ${styles.isSoldOut}`}>Sold Out</span>}
        {item.is_chef_pick    && !item.is_sold_out && <span className={`${styles.badge} ${styles.chefPick}`}>Chef's Pick</span>}
        {item.is_most_popular && !item.is_sold_out && !item.is_chef_pick && <span className={`${styles.badge} ${styles.mostPopular}`}>Most Popular</span>}
        {item.is_new          && !item.is_sold_out && !item.is_chef_pick && !item.is_most_popular && <span className={`${styles.badge} ${styles.isNew}`}>New</span>}
        {item.is_vegan        && !item.is_sold_out && <span className={`${styles.badge} ${styles.isVegan}`}>Vegan</span>}
        {item.is_vegetarian   && !item.is_sold_out && !item.is_vegan && <span className={`${styles.badge} ${styles.isVegetarian}`}>Vegetarian</span>}

        {/* quantity + add to cart */}
        <div className={styles.actions}>
            <div className={styles.quantity}>
                <button className={styles.qtyBtn}>−</button>
                <span className={styles.qtyNum}>1</span>
                <button className={styles.qtyBtn}>+</button>
            </div>

            <button className={styles.addBtn}>Add to Cart</button>
        </div>
    </article>
  )
}