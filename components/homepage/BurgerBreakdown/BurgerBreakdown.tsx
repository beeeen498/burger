import { forwardRef } from "react";
import styles from "./BurgerBreakdown.module.scss";

// forwardRef so page.tsx can pass breakdownRef to ScrollTracker
const BurgerBreakdown = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section ref={ref} className={styles.section}>
      <div className={styles.container}>
      </div>
    </section>
  );
});

BurgerBreakdown.displayName = "BurgerBreakdown";
export default BurgerBreakdown;