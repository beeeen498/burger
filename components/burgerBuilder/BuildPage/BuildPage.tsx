"use client";

import { useState } from "react";
import Header from "@/components/global/Header/Header";
import IngredientTabs from "../IngredientTabs/IngredientTabs";
import IngredientCard from "../IngredientCard/IngredientCard";
import BurgerCanvas from "@/components/global/BurgerCanvas/BurgerCanvas";
import NutritionPanel from "../NutritionPanel/NutritionPanel";
import { useIngredientFeedback } from "../hooks/useIngredientFeedback";
import SurpriseBadge from "../SurpriseBadge/SurpriseBadge";
import ResetBadge from "../ResetBadge/ResetBadge";
import Cta from "@/components/global/Cta/Cta";
import { CATEGORIES, calculateNutrition, calculatePrice, randomizeIngredients } from "../data/builderData";
import { BurgerIngredients } from "@/lib/burgerUtils";
import styles from "./BuildPage.module.scss";

// ── Default burger state ────────────────────────────
const DEFAULT_INGREDIENTS: BurgerIngredients = {
  bunType: "regular",
  sauce: "none",
  pattyCount: 1,
  cheeseCount: 0,
  lettuce: 0,
  tomato: 0,
  pickles: 0,
  onions: 0,
  bacon: 0,
  nuggets: 0,
}

const BuildPage = () => {
  // ── State ───────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState("bun");
  const [ingredients, setIngredients] = useState<BurgerIngredients>(DEFAULT_INGREDIENTS);

  // ── Calculated nutrition and price ─────────────────
  const nutrition = calculateNutrition(ingredients);
  const price = calculatePrice(ingredients);

  // ── Counter ingredient handlers ─────────────────────
  const handleAdd = (key: keyof BurgerIngredients) => {
    playAdd();
    setIngredients(prev => ({
      ...prev,
      [key]: ((prev[key] as number) ?? 0) + 1,
    }));
  };

  const handleRemove = (key: keyof BurgerIngredients) => {
    playRemove();
    setIngredients(prev => ({
      ...prev,
      [key]: Math.max(((prev[key] as number) ?? 0) - 1, 0),
    }));
  };

  // ── Toggle ingredient handler ───────────────────────
  const handleToggle = (key: keyof BurgerIngredients, value: string) => {
    setIngredients(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // ── Sound and vibration feedback ───────────────────
  const { playAdd, playRemove } = useIngredientFeedback();

  // ── Surprise Me — randomize all ingredients ─────────
  const handleSurprise = () => {
    setIngredients(randomizeIngredients());
    playAdd();
  };

  // ── Reset burger to default state ──────────────────
  const handleReset = () => {
    setIngredients(DEFAULT_INGREDIENTS);
    playRemove();
  };

  return (
    <main className={styles.page}>

      {/* ── Header wrapper ── */}
      <div className={styles.headerWrapper}>
        <Header />
      </div>

      <div className={styles.layout}>

        {/* ── Left panel — sticky 3D burger ── */}
        <div className={styles.burgerPanel}>
          <BurgerCanvas ingredients={ingredients} />

          {/* ── Surprise Me badge — left ── */}
          <SurpriseBadge onClick={handleSurprise} />

          {/* ── Reset badge — right ── */}
          <ResetBadge onClick={handleReset} />
        </div>


        {/* ── Right panel — ingredient selector ── */}
        <div className={styles.selectorPanel}>

          {/* ── Scrollable area ── */}
          <div className={styles.scrollArea}>
            <IngredientTabs
              activeCategory={activeCategory}
              onChange={setActiveCategory}
            />
            <div className={styles.ingredientList}>
              {CATEGORIES[activeCategory].ingredients.map((ingredient) => (
                <IngredientCard
                  key={ingredient.key + (ingredient.type === "toggle" ? ingredient.value : "")}
                  ingredient={ingredient}
                  quantity={ingredient.type === "counter" ? (ingredients[ingredient.key] as number) ?? 0 : undefined}
                  onAdd={() => handleAdd(ingredient.key)}
                  onRemove={() => handleRemove(ingredient.key)}
                  isSelected={ingredient.type === "toggle" && ingredients[ingredient.key] === ingredient.value}
                  onToggle={() => ingredient.type === "toggle" && handleToggle(ingredient.key, ingredient.value)}
                />
              ))}
            </div>
          </div>

          {/* ── Bottom area — nutrition + cart ── */}
          <div className={styles.bottomArea}>

            {/* ── Nutrition table ── */}
            <NutritionPanel nutrition={nutrition} />

            {/* ── Price and Add to Cart ── */}
            <div className={styles.cartRow}>
              <span className={styles.price}>${price.toFixed(2)}</span>
              <Cta label="Add to Cart" variant="yellow" onClick={() => console.log("add to cart", ingredients)} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default BuildPage;