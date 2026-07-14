"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import BurgerCanvas from "@/components/global/BurgerCanvas/BurgerCanvas";
import useCartStore from "@/lib/useCartStore";
import SimpleModelCanvas from "@/components/global/SimpleModelCanvas/SimpleModelCanvas";
import { MenuItem } from "../MenuPage/MenuPage";
import styles from "./MenuCard.module.scss";

interface MenuCardProps {
  item: MenuItem;
}

export default function MenuCard({ item }: MenuCardProps) {
  const router = useRouter();

  // ── Cart store ──
  const addItem = useCartStore((state) => state.addItem);
  const setFlyFrom = useCartStore((state) => state.setFlyFrom);

  // ── Visibility state for lazy loading the 3D canvas ──
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLElement>(null);

  // ── Watch the card with IntersectionObserver ──
  // Continuously track visibility — mount/unmount the 3D canvas
  // as the card enters/exits the viewport. Debounced so a fast
  // scroll doesn't flicker the canvas mount/unmount and crash R3F.
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const observer = new IntersectionObserver(
      ([entry]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setIsVisible(entry.isIntersecting);
        }, 100);
      },
      { rootMargin: "150px" },
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  // ── How many the user wants to add ──
  const [quantity, setQuantity] = useState(1);

  // ── e.stopPropagation() prevents the card click from firing ──
  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((prev) => prev + 1);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  // ── Add the item to the cart store and reset quantity ──
  // Also grabs the button's position so the flying 🍔 knows
  // where to start its arc from.
  const handleAddToCart = (e: React.MouseEvent) => {
    // ── Haptic feedback ──
    navigator.vibrate?.(50);

    e.stopPropagation();

    // ── Capture button position for flying animation ──
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setFlyFrom({ x: rect.left + rect.width / 2, y: rect.top });

    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity,
      ingredients: item.ingredients ?? null,
    });
    toast(`Added ${item.name} to bag! 🍔`);
    setQuantity(1);
  };

  // ── Clicking the card navigates to the item detail page ──
  const handleCardClick = () => {
    if (!item.is_sold_out) {
      router.push(`/menu/${item.slug}`);
    }
  };

  return (
    <article
      ref={cardRef}
      className={`${styles.card} ${item.is_sold_out ? styles.soldOut : ""}`}
      onClick={handleCardClick}
    >
      {/* ── Badge ── */}
      {item.is_sold_out && (
        <span className={`${styles.badge} ${styles.isSoldOut}`}>Sold Out</span>
      )}
      {item.is_chef_pick && !item.is_sold_out && (
        <span className={`${styles.badge} ${styles.chefPick}`}>
          Chef's Pick
        </span>
      )}
      {item.is_most_popular && !item.is_sold_out && !item.is_chef_pick && (
        <span className={`${styles.badge} ${styles.mostPopular}`}>
          Most Popular
        </span>
      )}
      {item.is_new &&
        !item.is_sold_out &&
        !item.is_chef_pick &&
        !item.is_most_popular && (
          <span className={`${styles.badge} ${styles.isNew}`}>New</span>
        )}
      {item.is_vegan && !item.is_sold_out && (
        <span className={`${styles.badge} ${styles.isVegan}`}>Vegan</span>
      )}
      {item.is_vegetarian && !item.is_sold_out && !item.is_vegan && (
        <span className={`${styles.badge} ${styles.isVegetarian}`}>
          Vegetarian
        </span>
      )}

      {/* ── 3D model — only renders when card is in viewport ── */}
      <div className={styles.canvas}>
        {isVisible && item.ingredients && (
          <BurgerCanvas
            ingredients={item.ingredients}
            sideItems={item.side_items ?? undefined}
            cameraOffset={14}
            scale={0.165}
          />
        )}
        {isVisible && !item.ingredients && item.model_path && (
          <SimpleModelCanvas modelPath={item.model_path} scale={1.17} rotation={[0.4, 0.8, 0]} />
        )}
      </div>

      {/* ── Name, description, price ── */}
      <div className={styles.content}>
        <h3 className={styles.name}>{item.name}</h3>
        <p className={styles.description}>{item.description}</p>
        <span className={styles.price}>
          ${(item.price * quantity).toFixed(2)}
        </span>
      </div>

      {/* ── Quantity controls + add to cart ── */}
      <div className={styles.actions}>
        <div className={styles.quantity}>
          <button className={styles.qtyBtn} onClick={handleRemove}>
            −
          </button>
          <span className={styles.qtyNum}>{quantity}</span>
          <button className={styles.qtyBtn} onClick={handleAdd}>
            +
          </button>
        </div>
        <button className={styles.addBtn} onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </article>
  );
}
