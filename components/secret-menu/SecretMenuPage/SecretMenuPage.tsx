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
            scale={0.3}
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
            scale={0.3}
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
            scale={0.3}
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
            scale={0.3}
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
