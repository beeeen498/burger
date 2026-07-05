"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import MatrixRain from "../MatrixRain/MatrixRain";
import Header from "@/components/global/Header/Header";
import CountdownTimer from "../CountdownTimer/CountdownTimer";
import SecretBurgerCard from "../SecretBurgerCard/SecretBurgerCard";
import styles from "./SecretMenuPage.module.scss";

// ── localStorage keys ─────────────────────────────────
const LS_SECRET_UNLOCKED = "secretMenu_unlocked";
const LS_UNLOCK_TIME = "secretMenu_unlockedAt";

export default function SecretMenuPage() {
  const router = useRouter();
  const [expiryPhase, setExpiryPhase] = useState<
    "active" | "glitch" | "fadeout" | "message"
  >("active");

  // ── Expiry sequence — glitch → fade → message → redirect ──
  const handleExpire = useCallback(() => {
    // ── Phase 1: glitch the cards ──
    setExpiryPhase("glitch");

    // ── Phase 2: fade everything to black ──
    setTimeout(() => {
      setExpiryPhase("fadeout");
    }, 2000);

    // ── Phase 3: show expired message ──
    setTimeout(() => {
      setExpiryPhase("message");

      // ── Clean up localStorage ──
      localStorage.removeItem(LS_SECRET_UNLOCKED);
      localStorage.removeItem(LS_UNLOCK_TIME);
    }, 3500);

    // ── Phase 4: redirect to menu ──
    setTimeout(() => {
      router.push("/menu");
    }, 7000);
  }, [router]);

  return (
    <main
      className={`${styles.page} ${expiryPhase !== "active" ? styles[expiryPhase] : ""}`}
    >
      {/* ── Matrix rain background ── */}
      <MatrixRain />

      <div className={styles.headerWrapper}>
        <Header />
      </div>

      {/* ── Expired message — only visible in message phase ── */}
      {expiryPhase === "message" && (
        <div className={styles.expiredOverlay}>
          <p className={styles.expiredText}>Your access has expired 🔒</p>
        </div>
      )}

      {/* ── Page content ── */}
      <div className={styles.content}>
        <h1 className={styles.title}>Secret Menu</h1>

        {/* ── Countdown timer ── */}
        <CountdownTimer onExpire={handleExpire} />

        {/* ── Secret burger cards ── */}
        <div className={styles.cards}>
          <SecretBurgerCard
            scale={0.28}
            name="The Land, Sea and Sky"
            description="The ultimate surf and turf situation."
            ingredients={["Beef Patty", "nuggets", "Shrimps"]}
            burgerIngredients={{
              sauce: "regular",
              pattyCount: 1,
              shrimps: 1,
              nuggets: 1,
            }}
            variant="classified"
          />

          <SecretBurgerCard
            scale={0.28}
            name="The Simpsons"
            description="Don't tell your cardiologist."
            ingredients={["Donut Bun", "Beef Patty", "Cheese"]}
            burgerIngredients={{
              bunType: "donut",
              pattyCount: 1,
              cheeseCount: 1,
            }}
            variant="vhs"
          />

          <SecretBurgerCard
            scale={0.28}
            name="Chicken & Waffles"
            description="Who said waffles are just for breakfast?"
            ingredients={["Waffle Bun", "Nuggets", "Maple Syrup"]}
            burgerIngredients={{
              bunType: "waffle",
              nuggets: 2,
            }}
            variant="receipt"
          />

          <SecretBurgerCard
            scale={0.28}
            name="The Nugzilla"
            description="A giant nugget. Nothing more to say."
            ingredients={["Giant Nugget", "Cheese", "Sauce"]}
            burgerIngredients={{
              giantNugget: 1,
              cheeseCount: 1,
              sauce: "regular",
            }}
            variant="kaiju"
          />
        </div>
      </div>
    </main>
  );
}
