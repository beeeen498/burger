"use client"

import styles from "./SecretBurgerCard.module.scss"

// ── Types ─────────────────────────────────────────────
interface SecretBurgerCardProps {
  name: string
  description: string
  ingredients: string[]
  variant: "classified" | "vhs" | "corrupted"
}

export default function SecretBurgerCard({ name, description, ingredients, variant }: SecretBurgerCardProps) {
  return (
    <div className={`${styles.card} ${styles[variant]}`}>

      {/* ── Stamp — top corner label ── */}
      <span className={styles.stamp}>CLASSIFIED</span>

      {/* ── Burger name ── */}
      <h2 className={styles.name}>{name}</h2>

      {/* ── Ingredients list — dossier style ── */}
      <ul className={styles.ingredients}>
        {ingredients.map((item, i) => (
          <li key={i}>
            <span className={styles.arrow}>&gt;</span> {item}
          </li>
        ))}
      </ul>

      {/* ── Description ── */}
      <p className={styles.description}>{description}</p>

    </div>
  )
}