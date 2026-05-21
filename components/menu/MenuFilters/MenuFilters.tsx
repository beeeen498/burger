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
  categories: string[]        // list of categories that actually have items
  activeCategory: string      // currently active/visible category
  onSelect: (category: string) => void  // called when user clicks a filter
}

export default function MenuFilters({ categories, activeCategory, onSelect }: MenuFiltersProps) {
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
    </nav>
  )
}