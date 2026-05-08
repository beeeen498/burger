"use client";

import { useState } from "react";
import { CounterIngredient, ToggleIngredient } from "../data/builderData";
import styles from "./IngredientCard.module.scss";

interface Props {
  ingredient: CounterIngredient | ToggleIngredient;
  // counter props
  quantity?: number;
  onAdd?: () => void;
  onRemove?: () => void;
  // toggle props
  isSelected?: boolean;
  onToggle?: () => void;
}

const IngredientCard = ({ ingredient, quantity = 0, onAdd, onRemove, isSelected, onToggle }: Props) => {
  const [shaking, setShaking] = useState(false);

  // ── Handle clicking + when at max ──────────────────
  const handleAdd = () => {
    if (ingredient.type === "counter") {
      if (quantity >= ingredient.max) {
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
        return;
      }
      onAdd?.();
    }
  };

  // ── Counter card ───────────────────────────────────
  if (ingredient.type === "counter") {
    const isActive = quantity > 0;
    const isAtMax = quantity >= ingredient.max;

    return (
      <div className={`
        ${styles.card}
        ${isActive ? styles.active : styles.inactive}
        ${isAtMax && shaking ? styles.shake : ""}
      `}>

        {/* minus button */}
        <button
          className={styles.btn}
          onClick={onRemove}
          disabled={quantity === 0}
          aria-label={`Remove ${ingredient.label}`}
        >
          −
        </button>

        {/* label */}
        <div className={styles.label}>
          <span className={styles.emoji}>{ingredient.emoji}</span>
          <span className={styles.name}>{ingredient.label}</span>
          {isActive && (
            <span className={styles.counter}>{quantity}/{ingredient.max}</span>
          )}
        </div>

        {/* price — only show if price > 0 */}
        {ingredient.price > 0 && (
          <span className={styles.price}>+${ingredient.price.toFixed(2)}</span>
        )}

        {/* plus button */}
        <button
          className={`${styles.btn} ${isAtMax && shaking ? styles.btnMax : ""}`}
          onClick={handleAdd}
          aria-label={`Add ${ingredient.label}`}
        >
          +
        </button>

      </div>
    );
  }

  // ── Toggle card ────────────────────────────────────
  return (
    <div
      className={`${styles.card} ${isSelected ? styles.active : styles.inactive}`}
      onClick={onToggle}
      role="button"
      aria-label={ingredient.label}
    >
      <span className={styles.emoji}>{ingredient.emoji}</span>
      <span className={styles.name}>{ingredient.label}</span>
      <span className={styles.price}>
        {ingredient.price === 0 ? "included" : `+$${ingredient.price.toFixed(2)}`}
      </span>
    </div>
  );
};

export default IngredientCard;