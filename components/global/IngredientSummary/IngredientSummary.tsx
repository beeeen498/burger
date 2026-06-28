"use client";

import { BurgerIngredients } from "@/lib/burgerUtils";
import { CATEGORIES } from "../../global/data/builderData";
import styles from "./IngredientSummary.module.scss";

interface Props {
  ingredients: BurgerIngredients;
}

const IngredientSummary = ({ ingredients }: Props) => {
  // ── Build list of active ingredients with emoji and quantity ────────
  const activeItems: { emoji: string; label: string; quantity: number }[] = [];

  Object.values(CATEGORIES).forEach((category) => {
    category.ingredients.forEach((ingredient) => {
      if (ingredient.type === "counter") {
        const qty = (ingredients[ingredient.key] as number) ?? 0;
        if (qty > 0) {
          activeItems.push({
            emoji: ingredient.emoji,
            label: ingredient.label,
            quantity: qty,
          });
        }
      } else {
        // toggle — show if selected and not "none"
        if (
          ingredients[ingredient.key] === ingredient.value &&
          ingredient.value !== "none"
        ) {
          activeItems.push({
            emoji: ingredient.emoji,
            label: ingredient.label,
            quantity: 1,
          });
        }
      }
    });
  });

  if (activeItems.length === 0) {
    return (
      <div className={styles.summary}>
        <span className={styles.empty}>Nothing yet — start building!</span>
      </div>
    );
  }

  return (
    <div className={styles.summary}>
      {activeItems.map((item, i) => (
        <div key={i} className={styles.item}>
          <span className={styles.emoji}>{item.emoji}</span>
          {item.quantity > 1 && (
            <span className={styles.qty}>×{item.quantity}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default IngredientSummary;
