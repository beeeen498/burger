// components/menu/ItemDetailPage/ItemDetailPage.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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
            cameraOffset={14}
            scale={0.11}
          />

          {/* ── Ingredient summary ── */}
          <IngredientSummary ingredients={ingredients} />
        </div>

        {/* ── Right panel — item info + toppings ── */}
        <div className={styles.selectorPanel}>
          {/* ── Scrollable area ── */}
          <div className={styles.scrollArea}>
            {/* ── Item name + description ── */}
            <h1 className={styles.itemName}>{item.name}</h1>
            <p className={styles.itemDescription}>{item.description}</p>

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
              <Cta
                label="Add to Cart"
                variant="yellow"
                onClick={() =>
                  console.log("add to cart", { item, ingredients, price })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ItemDetailPage;
