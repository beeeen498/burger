"use client";

import { Nutrition } from "../../global/data/builderData";
import styles from "./NutritionPanel.module.scss";

interface Props {
  nutrition: Nutrition;
}

const NutritionPanel = ({ nutrition }: Props) => {
  return (
    <div className={styles.panel}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <h3 className={styles.title}>Nutrition Facts</h3>
      </div>

      <div className={styles.thick} />

      {/* ── Calories row ── */}
      <div className={styles.caloriesRow}>
        <span className={styles.caloriesLabel}>Calories</span>
        <span className={styles.caloriesValue}>
          {Math.round(nutrition.calories)}
        </span>
      </div>

      <div className={styles.thick} />

      {/* ── Macro rows ── */}
      <div className={styles.row}>
        <span className={styles.rowLabel}>Total Fat</span>
        <span className={styles.rowValue}>{Math.round(nutrition.fat)}g</span>
      </div>
      <div className={styles.divider} />

      <div className={styles.row}>
        <span className={styles.rowLabel}>Total Carbs</span>
        <span className={styles.rowValue}>{Math.round(nutrition.carbs)}g</span>
      </div>
      <div className={styles.divider} />

      <div className={styles.row}>
        <span className={styles.rowLabel}>Protein</span>
        <span className={styles.rowValue}>
          {Math.round(nutrition.protein)}g
        </span>
      </div>
    </div>
  );
};

export default NutritionPanel;
