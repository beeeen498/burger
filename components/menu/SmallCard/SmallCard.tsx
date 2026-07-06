"use client";

import { useEffect, useRef, useState } from "react";
import SimpleModelCanvas from "@/components/global/SimpleModelCanvas/SimpleModelCanvas";
import useCartStore from "@/lib/useCartStore";
import { MenuItem } from "../MenuPage/MenuPage";
import styles from "./SmallCard.module.scss";

interface SmallCardProps {
  item: MenuItem;
}

export default function SmallCard({ item }: SmallCardProps) {
  // ── Cart store ──
  const addItem = useCartStore((state) => state.addItem);

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

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((prev) => prev + 1);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  // ── Add the item to the cart store and reset quantity ──
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity,
    });
    setQuantity(1);
  };

  return (
    <article
      ref={cardRef}
      className={`${styles.card} ${item.is_sold_out ? styles.soldOut : ""}`}
    >
      {/* ── 3D model — only renders when card is in viewport ── */}
      <div className={styles.canvas}>
        {isVisible && item.model_path && (
          <SimpleModelCanvas modelPath={item.model_path} scale={1} rotation={item.category === "sauces" ? [0.5, 0, 0] : undefined}/>
        )}
      </div>

      {/* ── Name and price ── */}
      <div className={styles.content}>
        <h3 className={styles.name}>{item.name}</h3>
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