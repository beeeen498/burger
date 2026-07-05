"use client";

import BurgerCanvas from "@/components/global/BurgerCanvas/BurgerCanvas";
import { BurgerIngredients } from "@/lib/burgerUtils";
import styles from "./SecretBurgerCard.module.scss";

// ── Types ─────────────────────────────────────────────
interface SecretBurgerCardProps {
  name: string;
  description: string;
  ingredients: string[];
  burgerIngredients: BurgerIngredients;
  variant: "classified" | "vhs" | "corrupted" | "diner" | "receipt"
  scale?: number;
}

export default function SecretBurgerCard({
  name,
  description,
  ingredients,
  burgerIngredients,
  variant,
  scale = 0.2,
}: SecretBurgerCardProps) {
  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      {/* ── Stamp — top corner label ── */}
      <span className={styles.stamp}>
        {variant === "classified" ? "CLASSIFIED"
          : variant === "vhs" ? "PLAY ▶"
          : variant === "corrupted" ? "ERROR"
          : variant === "diner" ? "SPECIAL ★"
          : "ORDER #047"}
      </span>

      {/* ── 3D burger model ── */}
      <div className={styles.model}>
        <BurgerCanvas
          ingredients={burgerIngredients}
          scale={scale}
          cameraOffset={13.5}
          // spin
        />
      </div>

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
  );
}
