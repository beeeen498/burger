"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import BurgerCanvas from "@/components/global/BurgerCanvas/BurgerCanvas";
import useCartStore from "@/lib/useCartStore";
import { BurgerIngredients } from "@/lib/burgerUtils";
import styles from "./BurgerOfTheDay.module.scss";

// ---------- types ----------
interface RestaurantSettings {
  burger_of_the_day_type: "menu_item" | "custom" | null;
  burger_of_the_day_item_id: string | null;
  burger_of_the_day_build_url: string | null;
  burger_of_the_day_end_type: "midnight" | "custom";
  burger_of_the_day_end_time: string | null;
}

interface BurgerOfTheDayData {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  ingredients: BurgerIngredients;
}

interface BurgerOfTheDayProps {
  onReady?: () => void;
}

// ---------- component ----------
export default function BurgerOfTheDay({ onReady }: BurgerOfTheDayProps) {
  const [data, setData] = useState<BurgerOfTheDayData | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // ── Cart store ──
  const addItem = useCartStore((state) => state.addItem);

  // ---------- fetch burger of the day from Supabase ----------
  useEffect(() => {
    async function fetchData() {
      const { data: settings } = await supabase
        .from("restaurant_settings")
        .select(
          "burger_of_the_day_type, burger_of_the_day_item_id, burger_of_the_day_build_url, burger_of_the_day_end_type, burger_of_the_day_end_time, burger_of_the_day_has_discount, burger_of_the_day_discount_price",
        )
        .single();

      if (!settings || !settings.burger_of_the_day_type) {
        setData(null);
        onReady?.();
        return;
      }

      if (
        settings.burger_of_the_day_type === "menu_item" &&
        settings.burger_of_the_day_item_id
      ) {
        const { data: item } = await supabase
          .from("menu_items")
          .select("name, description, price, ingredients")
          .eq("id", settings.burger_of_the_day_item_id)
          .single();

        if (!item || !item.ingredients) {
          onReady?.();
          return;
        }

        setData({
          id: settings.burger_of_the_day_item_id,
          name: item.name,
          description: item.description,
          price: item.price,
          discountPrice: settings.burger_of_the_day_has_discount
            ? settings.burger_of_the_day_discount_price
            : null,
          ingredients: item.ingredients,
        });

        onReady?.();
      }

      if (
        settings.burger_of_the_day_type === "custom" &&
        settings.burger_of_the_day_build_url
      ) {
        const params = new URLSearchParams(settings.burger_of_the_day_build_url);
        const ingredients: BurgerIngredients = {
          bunType: (params.get("bunType") as BurgerIngredients["bunType"]) ?? "regular",
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

        setData({
          id: "burger-of-the-day",
          name: "Burger of the Day",
          description: "Today's special creation.",
          price: 0,
          discountPrice: settings.burger_of_the_day_has_discount
            ? settings.burger_of_the_day_discount_price
            : null,
          ingredients,
        });

        onReady?.();
      }
    }

    // ---------- initial fetch ----------
    fetchData();

    // ---------- listen for real-time changes ----------
    const channel = supabase
      .channel("burger_of_the_day")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "restaurant_settings" },
        () => { fetchData(); },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ---------- countdown timer ----------
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();

      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  // ---------- don't render if no burger of the day is set ----------
  if (!data) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  // ── Add burger of the day to cart ──
  // Uses the discount price if one exists, otherwise the regular price
  const handleAddToCart = () => {
    addItem({
      id: data.id,
      name: data.name,
      price: data.discountPrice ?? data.price,
      quantity: 1,
      ingredients: data.ingredients,
    });
  };

  return (
    <div className={styles.banner}>
      <span className={styles.badge}>Burger of the Day</span>

      <div className={styles.left}>
        <BurgerCanvas
          ingredients={data.ingredients}
          cameraOffset={14}
          scale={0.18}
        />
      </div>

      <div className={styles.right}>
        <p className={styles.title}>Today's Special</p>
        <h2 className={styles.name}>{data.name}</h2>
        <p className={styles.description}>{data.description}</p>

        <div className={styles.priceRow}>
          {data.discountPrice ? (
            <>
              <span className={styles.oldPrice}>${data.price.toFixed(2)}</span>
              <span className={styles.newPrice}>${data.discountPrice.toFixed(2)}</span>
            </>
          ) : (
            <span className={styles.newPrice}>${data.price.toFixed(2)}</span>
          )}
        </div>

        <div className={styles.countdown}>
          <span className={styles.countdownLabel}>Ends in</span>
          <div className={styles.timer}>
            <div className={styles.timeBlock}>
              <span className={styles.timeNum}>{pad(timeLeft.hours)}</span>
              <span className={styles.timeLabel}>hrs</span>
            </div>
            <span className={styles.timeSep}>:</span>
            <div className={styles.timeBlock}>
              <span className={styles.timeNum}>{pad(timeLeft.minutes)}</span>
              <span className={styles.timeLabel}>min</span>
            </div>
            <span className={styles.timeSep}>:</span>
            <div className={styles.timeBlock}>
              <span className={styles.timeNum}>{pad(timeLeft.seconds)}</span>
              <span className={styles.timeLabel}>sec</span>
            </div>
          </div>
        </div>

        <button className={styles.addBtn} onClick={handleAddToCart}>Add to Cart</button>
      </div>
    </div>
  );
}