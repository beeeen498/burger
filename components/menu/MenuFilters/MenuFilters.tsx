"use client"

import styles from "./MenuFilters.module.scss"

// ── The category labels shown in the UI ──
const CATEGORY_LABELS: Record<string, string> = {
  single:    "Singles",
  meal:      "Meals",
  breakfast: "Breakfast",
  extras:    "Extras",
  sauces:    "Sauces",
  drinks:    "Drinks",
  desserts:  "Desserts",
}

interface MenuFiltersProps {
  categories: string[]
  activeCategory: string
  onSelect: (category: string) => void
  onSurpriseClick: () => void
}

export default function MenuFilters({ categories, activeCategory, onSelect, onSurpriseClick }: MenuFiltersProps) {
  return (
    <nav className={styles.filters}>
      {categories.map(category => (
        <button
          key={category}
          className={`${styles.btn} ${activeCategory === category ? styles.active : ""}`}
          onClick={() => onSelect(category)}
        >
          {CATEGORY_LABELS[category] ?? category}
        </button>
      ))}

      {/* ── Surprise Me button ── */}
      <button className={styles.surpriseBtn} onClick={onSurpriseClick}>
        Surprise Me 🎲 
      </button>
    </nav>
  )
}