"use client";

import { CATEGORIES } from "../data/builderData";
import { BurgerIngredients } from "@/lib/burgerUtils";
import styles from "./IngredientTabs.module.scss";

interface Props {
  activeCategory: string;
  onChange: (category: string) => void;
  ingredients: BurgerIngredients;
}

const IngredientTabs = ({ activeCategory, onChange, ingredients }: Props) => {
  
  // ── Count active ingredients per category ───────────
  const getCount = (categoryKey: string): number => {
    return CATEGORIES[categoryKey].ingredients.reduce((total, ingredient) => {
      if (ingredient.type === "counter") {
        return total + ((ingredients[ingredient.key] as number) ?? 0);
      } else {
        // toggle — count if selected and not "none"
        return total + (ingredients[ingredient.key] === ingredient.value && ingredient.value !== "none" ? 1 : 0);
      }
    }, 0);
  };

  return (
    <div className={styles.tabs}>
      {Object.entries(CATEGORIES).map(([key, category]) => {
        const count = getCount(key);
        return (
          <button
            key={key}
            className={`${styles.tab} ${activeCategory === key ? styles.active : ""}`}
            onClick={() => onChange(key)}
          >
            {category.label}
            {/* ── Active count badge ── */}
            {count > 0 && (
              <span className={styles.badge}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default IngredientTabs;