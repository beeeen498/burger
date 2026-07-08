"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isSecretMenuActive } from "@/lib/secretMenuUtils";
import MatrixRain from "../MatrixRain/MatrixRain";
import Header from "@/components/global/Header/Header";
import CountdownTimer from "../CountdownTimer/CountdownTimer";
import SecretBurgerCard from "../SecretBurgerCard/SecretBurgerCard";
import styles from "./SecretMenuPage.module.scss";

export default function SecretMenuPage() {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [expiryPhase, setExpiryPhase] = useState<
    "active" | "glitch" | "fadeout" | "message"
  >("active");

  // ── Check access on mount — block page if expired or never unlocked ──
  useEffect(() => {
    if (!isSecretMenuActive()) {
      window.dispatchEvent(new Event("secretMenuExpired"));
      router.push("/menu");
      return;
    }
    setHasAccess(true);
  }, [router]);

  // ── Expiry sequence — glitch → fade → message → redirect ──
  const handleExpire = useCallback(() => {
    setExpiryPhase("glitch");

    setTimeout(() => {
      setExpiryPhase("fadeout");
    }, 2000);

    setTimeout(() => {
      setExpiryPhase("message");

      // ── Notify other components (Nav, Banner) ──
      window.dispatchEvent(new Event("secretMenuExpired"));
    }, 3500);

    setTimeout(() => {
      router.push("/menu");
    }, 7000);
  }, [router]);

  // ── Don't render anything until access is confirmed ──
  if (hasAccess === null) return null;

  return (
    <main
      className={`${styles.page} ${expiryPhase !== "active" ? styles[expiryPhase] : ""}`}
    >
      <MatrixRain />

      <div className={styles.headerWrapper}>
        <Header />
      </div>

      {expiryPhase === "message" && (
        <div className={styles.expiredOverlay}>
          <p className={styles.expiredText}>Your access has expired 🔒</p>
        </div>
      )}

      <div className={styles.content}>
        <h1 className={styles.title}>Secret Menu</h1>
        <CountdownTimer onExpire={handleExpire} />

        <div className={styles.cards}>
          <SecretBurgerCard
            id="land-sea-sky"
            price={24.99}
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
            id="the-simpsons"
            price={19.99}
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
            id="chicken-waffles"
            price={18.99}
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
            id="the-nugzilla"
            price={22.99}
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
