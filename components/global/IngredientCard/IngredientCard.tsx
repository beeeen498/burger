"use client";

import { useState } from "react";
import { CounterIngredient, ToggleIngredient } from "../data/builderData";
import styles from "./IngredientCard.module.scss";

interface Props {
  ingredient: CounterIngredient | ToggleIngredient;
  // counter props
  quantity?: number;
  minQuantity?: number; // floor the minus button can't go below — defaults to 0
  onAdd?: () => void;
  onRemove?: () => void;
  // toggle props
  isSelected?: boolean;
  onToggle?: () => void;
}

const IngredientCard = ({ ingredient, quantity = 0, minQuantity = 0, onAdd, onRemove, isSelected, onToggle }: Props) => {
  const [shakingMax, setShakingMax] = useState(false);
  const [shakingMin, setShakingMin] = useState(false);

  // ── Handle clicking + when at max ──────────────────
  const handleAdd = () => {
    if (ingredient.type === "counter") {
      if (quantity >= ingredient.max) {
        setShakingMax(true);
        setTimeout(() => setShakingMax(false), 500);
        return;
      }
      onAdd?.();
    }
  };

  // ── Handle clicking − when at the floor ─────────────
  // Floor is usually 0, but on the item detail page it's the
  // item's default quantity — toppings can only be added, not removed.
  // Mirrors handleAdd's pattern — shake-and-block instead of disabling,
  // so the click is still felt even when it doesn't do anything.
  const handleRemove = () => {
    if (ingredient.type === "counter") {
      if (quantity <= minQuantity) {
        setShakingMin(true);
        setTimeout(() => setShakingMin(false), 500);
        return;
      }
      onRemove?.();
    }
  };

  // ── Counter card ───────────────────────────────────
  if (ingredient.type === "counter") {
    const isActive = quantity > 0;
    const isAtMax = quantity >= ingredient.max;
    const isAtMin = quantity <= minQuantity;

    return (
      <div className={`
        ${styles.card}
        ${isActive ? styles.active : styles.inactive}
        ${isAtMax && shakingMax ? styles.shake : ""}
        ${isAtMin && shakingMin ? styles.shake : ""}
      `}>

        {/* minus button */}
        <button
          className={`${styles.btn} ${isAtMin && shakingMin ? styles.btnMax : ""}`}
          onClick={handleRemove}
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
          className={`${styles.btn} ${isAtMax && shakingMax ? styles.btnMax : ""}`}
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