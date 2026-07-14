// components/menu/ItemDetailPage/ItemDetailPage.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import useCartStore from "@/lib/useCartStore";
import Header from "@/components/global/Header/Header";
import BurgerCanvas from "@/components/global/BurgerCanvas/BurgerCanvas";
import IngredientSummary from "@/components/global/IngredientSummary/IngredientSummary";
import IngredientCard from "@/components/global/IngredientCard/IngredientCard";
import NutritionPanel from "@/components/global/NutritionPanel/NutritionPanel";
import Cta from "@/components/global/Cta/Cta";
import { useIngredientFeedback } from "@/components/burgerBuilder/hooks/useIngredientFeedback";
import {
  CATEGORIES,
  calculateNutrition,
} from "@/components/global/data/builderData";
import { BurgerIngredients } from "@/lib/burgerUtils";
import { MenuItem } from "../MenuPage/MenuPage";
import styles from "./ItemDetailPage.module.scss";

interface Props {
  slug: string;
}

const ItemDetailPage = ({ slug }: Props) => {
  // ── Fetched item state ──────────────────────────────
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Default ingredients — the item's starting toppings ──
  const [defaults, setDefaults] = useState<BurgerIngredients | null>(null);

  // ── Working ingredients — what the user has changed ──
  const [ingredients, setIngredients] = useState<BurgerIngredients | null>(
    null,
  );

  // ── Sound and vibration feedback ───────────────────
  const { playAdd, playRemove } = useIngredientFeedback();

  // ── Cart store ──────────────────────────────────
  const addItem = useCartStore((state) => state.addItem);
  const setFlyFrom = useCartStore((state) => state.setFlyFrom);

  // ── Selected side item — only for meals with side_items ──
  const [selectedSide, setSelectedSide] = useState<string | null>(null);

  // ── Selected milkshake flavor — only for meals ──
  const [selectedShake, setSelectedShake] = useState<string | null>(null);

  // ── Add item to cart ──────────────────────────────
  const handleAddToCart = () => {
    navigator.vibrate?.(50);

    addItem({
      id: item!.id,
      name: item!.name,
      price: calculateItemPrice(),
      quantity: 1,
      ingredients: ingredients,
      sideItems: activeSideItems ?? undefined,
    });
    toast(`Added ${item!.name} to bag! 🍔`);
  };

  // ── Fetch the matching item from Supabase by slug ──────
  useEffect(() => {
    async function fetchItem() {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        setError(error.message);
      } else if (data) {
        setItem(data);
        setDefaults(data.ingredients);
        setIngredients(data.ingredients);

        // ── Default the side to the first food side (not milkshake) ──
        if (data.side_items) {
          const firstFoodSide = data.side_items.find(
            (s: string) => s !== "vanilla_milkshake",
          );
          setSelectedSide(firstFoodSide ?? null);
        }

        // ── Default the milkshake to vanilla ──
        if (data.side_items?.includes("vanilla_milkshake")) {
          setSelectedShake("vanilla_milkshake");
        }
      }
      setLoading(false);
    }

    fetchItem();
  }, [slug]);

  // ── Add topping — always allowed up to ingredient.max ──
  const handleAdd = (key: keyof BurgerIngredients) => {
    playAdd();
    setIngredients((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [key]: ((prev[key] as number) ?? 0) + 1,
      };
    });
  };

  // ── Remove topping — blocked once back at the item's default ──
  const handleRemove = (key: keyof BurgerIngredients) => {
    setIngredients((prev) => {
      if (!prev || !defaults) return prev;
      const floor = (defaults[key] as number) ?? 0;
      const current = (prev[key] as number) ?? 0;
      if (current <= floor) return prev; // can't go below default — no sound
      playRemove();
      return {
        ...prev,
        [key]: current - 1,
      };
    });
  };

  // ── Calculate price — item's fixed price + cost of added extras only ──
  const calculateItemPrice = (): number => {
    if (!item || !ingredients || !defaults) return 0;

    let total = item.price;

    CATEGORIES.toppings.ingredients.forEach((ingredient) => {
      if (ingredient.type !== "counter") return;
      const current = (ingredients[ingredient.key] as number) ?? 0;
      const base = (defaults[ingredient.key] as number) ?? 0;
      const extra = current - base;
      total += extra * ingredient.price;
    });

    return Math.round(total * 100) / 100;
  };

  // ── Loading / error / not-found states ──────────────
  if (loading) {
    return (
      <div className={styles.statusPage}>
        <div className={styles.statusBox}>
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.statusPage}>
        <div className={styles.statusBox}>
          <h1>Something Went Wrong</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!item || !ingredients || !defaults) {
    return (
      <div className={styles.statusPage}>
        <div className={styles.statusBox}>
          <h1>Item Not Found</h1>
          <p>We couldn&apos;t find that burger.</p>
          <Cta label="Back to Menu" href="/menu" variant="pink" />
        </div>
      </div>
    );
  }

  // ── Build side_items with the user's chosen side ──
  const activeSideItems = item.side_items
    ? item.side_items.map((s) => {
        if (s === "vanilla_milkshake") return selectedShake ?? s;
        return selectedSide ?? s;
      })
    : undefined;

  const nutrition = calculateNutrition(ingredients);
  const price = calculateItemPrice();

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
            sideItems={activeSideItems}
            cameraOffset={13}
            scale={0.11}
          />

          {/* ── Ingredient summary ── */}
          <IngredientSummary ingredients={ingredients} direction="row" />
        </div>

        {/* ── Right panel — item info + toppings ── */}
        <div className={styles.selectorPanel}>
          {/* ── Scrollable area ── */}
          <div className={styles.scrollArea}>
            {/* ── Item name + description ── */}
            <h1 className={styles.itemName}>{item.name}</h1>
            <p className={styles.itemDescription}>{item.description}</p>

            {/* ── Side selector — meals only ── */}
            {item.side_items && selectedSide && (
              <div className={styles.sideSelector}>
                <h3 className={styles.sideSelectorLabel}>Choose Your Side</h3>
                <div className={styles.sideSelectorBtns}>
                  {[
                    { key: "french_fries", label: "Fries" },
                    { key: "onion_rings_extra", label: "Onion Rings" },
                    { key: "nuggets_extra", label: "Nuggets" },
                  ].map((side) => (
                    <button
                      key={side.key}
                      className={`${styles.sideBtn} ${selectedSide === side.key ? styles.active : ""}`}
                      onClick={() => setSelectedSide(side.key)}
                    >
                      {side.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Milkshake selector — meals only ── */}
            {item.side_items?.includes("vanilla_milkshake") &&
              selectedShake && (
                <div className={styles.sideSelector}>
                  <h3 className={styles.sideSelectorLabel}>
                    Choose Your Shake
                  </h3>
                  <div className={styles.sideSelectorBtns}>
                    {[
                      { key: "vanilla_milkshake", label: "Vanilla" },
                      { key: "chocolate_milkshake", label: "Chocolate" },
                      { key: "strawberry_milkshake", label: "Strawberry" },
                    ].map((shake) => (
                      <button
                        key={shake.key}
                        className={`${styles.sideBtn} ${selectedShake === shake.key ? styles.active : ""}`}
                        onClick={() => setSelectedShake(shake.key)}
                      >
                        {shake.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* ── Flat list of toppings — no tabs, toppings only ── */}
            <div className={styles.ingredientList}>
              {CATEGORIES.toppings.ingredients.map((ingredient) => (
                <IngredientCard
                  key={ingredient.key}
                  ingredient={ingredient}
                  quantity={(ingredients[ingredient.key] as number) ?? 0}
                  minQuantity={(defaults[ingredient.key] as number) ?? 0}
                  onAdd={() => handleAdd(ingredient.key)}
                  onRemove={() => handleRemove(ingredient.key)}
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
              <div
                onClick={(e) => {
                  const rect = (
                    e.currentTarget as HTMLElement
                  ).getBoundingClientRect();
                  setFlyFrom({ x: rect.left + rect.width / 2, y: rect.top });
                }}
              >
                <Cta
                  label="Add to Cart"
                  variant="yellow"
                  onClick={handleAddToCart}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ItemDetailPage;
