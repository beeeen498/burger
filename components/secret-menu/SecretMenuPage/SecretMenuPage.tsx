"use client";

import MatrixRain from "../MatrixRain/MatrixRain";
import Header from "@/components/global/Header/Header";
import CountdownTimer from "../CountdownTimer/CountdownTimer";
import SecretBurgerCard from "../SecretBurgerCard/SecretBurgerCard";
import styles from "./SecretMenuPage.module.scss";

export default function SecretMenuPage() {
  return (
    <main className={styles.page}>
      {/* ── Matrix rain background ── */}
      <MatrixRain />

      <div className={styles.headerWrapper}>
        <Header />
      </div>

      {/* ── Page content — placeholder for now ── */}
      <div className={styles.content}>
        <h1 className={styles.title}>Secret Menu</h1>

        {/* ── Countdown timer ── */}
        <CountdownTimer />

        {/* ── Secret burger cards ── */}
        <div className={styles.cards}>
          <SecretBurgerCard
            scale={0.22}
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
        </div>
      </div>
    </main>
  );
}
