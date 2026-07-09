"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import useCartStore from "@/lib/useCartStore";
import Header from "@/components/global/Header/Header";
import IngredientTabs from "../../global/IngredientTabs/IngredientTabs";
import IngredientCard from "../../global/IngredientCard/IngredientCard";
import BurgerCanvas from "@/components/global/BurgerCanvas/BurgerCanvas";
import NutritionPanel from "@/components/global/NutritionPanel/NutritionPanel";
import { useIngredientFeedback } from "../hooks/useIngredientFeedback";
import SurpriseBadge from "../SurpriseBadge/SurpriseBadge";
import ResetBadge from "../ResetBadge/ResetBadge";
import IngredientSummary from "@/components/global/IngredientSummary/IngredientSummary";
import Cta from "@/components/global/Cta/Cta";
import {
  CATEGORIES,
  calculateNutrition,
  calculatePrice,
  randomizeIngredients,
} from "../../global/data/builderData";
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
  friedEgg: 0,
  friedFish: 0,
  onionRings: 0,
  potatoChips: 0,
};

// ── Parse URL params into BurgerIngredients ─────────
function parseIngredientsFromParams(
  params: URLSearchParams,
): BurgerIngredients | null {
  if (!params.toString()) return null;
  return {
    bunType:
      (params.get("bunType") as BurgerIngredients["bunType"]) ?? "regular",
    sauce: (params.get("sauce") as BurgerIngredients["sauce"]) ?? "none",
    pattyCount: parseInt(params.get("pattyCount") ?? "0"),
    cheeseCount: parseInt(params.get("cheeseCount") ?? "0"),
    lettuce: parseInt(params.get("lettuce") ?? "0"),
    tomato: parseInt(params.get("tomato") ?? "0"),
    pickles: parseInt(params.get("pickles") ?? "0"),
    onions: parseInt(params.get("onions") ?? "0"),
    bacon: parseInt(params.get("bacon") ?? "0"),
    nuggets: parseInt(params.get("nuggets") ?? "0"),
    friedEgg: parseInt(params.get("friedEgg") ?? "0"),
    friedFish: parseInt(params.get("friedFish") ?? "0"),
    onionRings: parseInt(params.get("onionRings") ?? "0"),
    potatoChips: parseInt(params.get("potatoChips") ?? "0"),
  };
}

const BuildPage = () => {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("bun");
  const [copied, setCopied] = useState(false);

  // ── Naming popup state ──────────────────────────
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [burgerName, setBurgerName] = useState("");

  // ── Cart store ──────────────────────────────────
  const addItem = useCartStore((state) => state.addItem);
  const setFlyFrom = useCartStore((state) => state.setFlyFrom);

  // ── Detect window width for summary direction ───────
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Saving the burger to local storage & parsing to url ──
  const [ingredients, setIngredients] = useState<BurgerIngredients>(() => {
    if (typeof window === "undefined") return DEFAULT_INGREDIENTS;

    const fromParams = parseIngredientsFromParams(searchParams);
    if (fromParams) return fromParams;
    try {
      const saved = localStorage.getItem("burgerBuilder");
      return saved ? JSON.parse(saved) : DEFAULT_INGREDIENTS;
    } catch {
      return DEFAULT_INGREDIENTS;
    }
  });

  // ── Persist ingredients to localStorage on change ──
  useEffect(() => {
    localStorage.setItem("burgerBuilder", JSON.stringify(ingredients));
  }, [ingredients]);

  // ── Calculated nutrition and price ─────────────────
  const nutrition = calculateNutrition(ingredients);
  const price = calculatePrice(ingredients);

  // ── Counter ingredient handlers ─────────────────────
  const handleAdd = (key: keyof BurgerIngredients) => {
    playAdd();
    setIngredients((prev) => ({
      ...prev,
      [key]: ((prev[key] as number) ?? 0) + 1,
    }));
  };

  const handleRemove = (key: keyof BurgerIngredients) => {
    playRemove();
    setIngredients((prev) => ({
      ...prev,
      [key]: Math.max(((prev[key] as number) ?? 0) - 1, 0),
    }));
  };

  // ── Toggle ingredient handler ───────────────────────
  const handleToggle = (key: keyof BurgerIngredients, value: string) => {
    setIngredients((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ── Sound and vibration feedback ───────────────────
  const { playAdd, playRemove } = useIngredientFeedback();

  // ── Surprise Me — randomize all ingredients ─────────
  const handleSurprise = () => {
    const randomized = randomizeIngredients();
    setIngredients(randomized);
    playAdd();

    const firstActive = Object.keys(CATEGORIES)
      .filter((key) => key !== "bun")
      .find((categoryKey) =>
        CATEGORIES[categoryKey].ingredients.some((ingredient) => {
          if (ingredient.type === "counter") {
            return ((randomized[ingredient.key] as number) ?? 0) > 0;
          }
          return (
            randomized[ingredient.key] === ingredient.value &&
            ingredient.value !== "none"
          );
        }),
      );
    if (firstActive) setActiveCategory(firstActive);
  };

  // ── Reset burger to default state ──────────────────
  const handleReset = () => {
    setIngredients(DEFAULT_INGREDIENTS);
    playRemove();
  };

  // ── Sharing the built burger ──────────────────
  const handleShare = useCallback(() => {
    const params = new URLSearchParams();
    Object.entries(ingredients).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== 0 &&
        value !== "none"
      ) {
        params.set(key, String(value));
      }
    });
    const url = `${window.location.origin}/build?${params.toString()}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [ingredients]);

  // ── Open the naming popup ───────────────────────
  const handleCartClick = () => {
    setShowNamePopup(true);
  };

  // ── Confirm and add to cart ─────────────────────
  const handleConfirmAdd = () => {
    navigator.vibrate?.(50);

    addItem({
      id: `custom-burger-${Date.now()}`,
      name: burgerName.trim() || "Custom Burger",
      price: price,
      quantity: 1,
      ingredients: ingredients,
    });

    toast(`Added ${burgerName.trim() || "Custom Burger"} to bag! 🍔`);
    setBurgerName("");
    setShowNamePopup(false);
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
          <BurgerCanvas
            ingredients={ingredients}
            cameraOffset={14}
            scale={0.11}
          />

          {/* ── Ingredient summary ── */}
          <div className={styles.ingredientDiv}>
            <IngredientSummary
              ingredients={ingredients}
              direction={
                windowWidth > 1000
                  ? "row"
                  : windowWidth <= 550
                    ? "row"
                    : "column"
              }
            />
          </div>

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
              ingredients={ingredients}
            />

            <div className={styles.ingredientList}>
              {CATEGORIES[activeCategory].ingredients.map((ingredient) => (
                <IngredientCard
                  key={
                    ingredient.key +
                    (ingredient.type === "toggle" ? ingredient.value : "")
                  }
                  ingredient={ingredient}
                  quantity={
                    ingredient.type === "counter"
                      ? ((ingredients[ingredient.key] as number) ?? 0)
                      : undefined
                  }
                  onAdd={() => handleAdd(ingredient.key)}
                  onRemove={() => handleRemove(ingredient.key)}
                  isSelected={
                    ingredient.type === "toggle" &&
                    ingredients[ingredient.key] === ingredient.value
                  }
                  onToggle={() =>
                    ingredient.type === "toggle" &&
                    handleToggle(ingredient.key, ingredient.value)
                  }
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
              <Cta
                label="Add to Cart"
                variant="yellow"
                onClick={handleCartClick}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Name your burger popup ── */}
      {showNamePopup && (
        <div
          className={styles.popupOverlay}
          onClick={() => setShowNamePopup(false)}
        >
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.popupTitle}>Name Your Burger</h3>
            <input
              className={styles.nameInput}
              type="text"
              value={burgerName}
              onChange={(e) => setBurgerName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirmAdd()}
              placeholder="e.g. Ben's Monster..."
              maxLength={30}
              autoFocus
            />
            <div className={styles.popupButtons}>
              <button className={styles.skipBtn} onClick={handleConfirmAdd}>
                Skip
              </button>
              <button className={styles.confirmBtn} onClick={handleConfirmAdd}>
                Add to Cart 🍔
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default BuildPage;
