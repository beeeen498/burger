"use client";

import { CATEGORIES } from "../data/builderData";
import styles from "./IngredientTabs.module.scss";

interface Props {
  activeCategory: string;
  onChange: (category: string) => void;
}

const IngredientTabs = ({ activeCategory, onChange }: Props) => {
  return (
    <div className={styles.tabs}>
      {Object.entries(CATEGORIES).map(([key, category]) => (
        <button
          key={key}
          className={`${styles.tab} ${activeCategory === key ? styles.active : ""}`}
          onClick={() => onChange(key)}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
};

export default IngredientTabs;