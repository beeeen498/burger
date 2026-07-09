"use client";

import { useState } from "react";
import { toast } from "sonner";
import BurgerCanvas from "@/components/global/BurgerCanvas/BurgerCanvas";
import useCartStore from "@/lib/useCartStore";
import { BurgerIngredients } from "@/lib/burgerUtils";
import styles from "./SecretBurgerCard.module.scss";

// ── Types ─────────────────────────────────────────────
interface SecretBurgerCardProps {
  id: string;
  name: string;
  price: number;
  description: string;
  ingredients: string[];
  burgerIngredients: BurgerIngredients;
  variant:
    | "classified"
    | "vhs"
    | "corrupted"
    | "diner"
    | "receipt"
    | "kaiju"
    | "hazmat"
    | "wrestling"
    | "wanted";
  scale?: number;
}

export default function SecretBurgerCard({
  id,
  name,
  price,
  description,
  ingredients,
  burgerIngredients,
  variant,
  scale = 0.2,
}: SecretBurgerCardProps) {
  // ── Cart store ──
  const addItem = useCartStore((state) => state.addItem);
  const setFlyFrom = useCartStore((state) => state.setFlyFrom);

  // ── How many the user wants to add ──
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => setQuantity((prev) => prev + 1);
  const handleRemove = () => setQuantity((prev) => Math.max(1, prev - 1));

  // ── Add this secret burger to cart ──
  const handleAddToCart = (e: React.MouseEvent) => {
    navigator.vibrate?.(50);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setFlyFrom({ x: rect.left + rect.width / 2, y: rect.top });

    addItem({
      id,
      name,
      price,
      quantity,
      ingredients: burgerIngredients,
    });
    toast(`Added ${name} to bag! 🍔`);
    setQuantity(1);
  };

  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      {/* ── Stamp — top corner label ── */}
      <span className={styles.stamp}>
        {variant === "classified"
          ? "CLASSIFIED"
          : variant === "vhs"
            ? "PLAY ▶"
            : variant === "corrupted"
              ? "ERROR"
              : variant === "diner"
                ? "SPECIAL ★"
                : variant === "receipt"
                  ? "ORDER #047"
                  : variant === "kaiju"
                    ? "RATED XXXL"
                    : variant === "hazmat"
                      ? "⚠ CAUTION"
                      : variant === "wrestling"
                        ? "MAIN EVENT"
                        : variant === "wanted"
                          ? "REWARD"
                          : ""}
      </span>

      {/* ── 3D burger model ── */}
      <div className={styles.model}>
        <BurgerCanvas
          ingredients={burgerIngredients}
          scale={scale}
          cameraOffset={13.5}
          spin
        />
      </div>

      {/* ── Burger name ── */}
      <h2 className={styles.name}>{name}</h2>

      {/* ── Price ── */}
      <span className={styles.price}>${(price * quantity).toFixed(2)}</span>

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
    </div>
  );
}