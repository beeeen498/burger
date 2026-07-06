"use client";

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

  // ── Add this secret burger to cart ──
  // Also grabs the button's position so the flying 🍔 knows
  // where to start its arc from.
  const handleAddToCart = (e: React.MouseEvent) => {
    // ── Haptic feedback ──
    navigator.vibrate?.(50);

    // ── Capture button position for flying animation ──
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setFlyFrom({ x: rect.left + rect.width / 2, y: rect.top });

    addItem({
      id,
      name,
      price,
      quantity: 1,
      ingredients: burgerIngredients,
    });
    toast(`Added ${name} to bag! 🍔`);
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
      <span className={styles.price}>${price.toFixed(2)}</span>

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

      {/* ── Add to cart button ── */}
      <button className={styles.addBtn} onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
}
